import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { DataManager } from '../common/data-manager';
import { setEnableLogging } from '../common/config';
import { ASSET_KEYS } from '../common/assets';
import { getText, type TextKey } from '../common/texts';
import { SCENE_KEYS } from './scene-keys';
import { DIFFICULTY } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';

const CURSOR_SIZE = 16;
const CURSOR_X_OFFSET = 30; // distance left of the '<' arrow

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    uiText: '#93c9e4',
    uiTextBorder: '#000000',
};

const MUSIC_LEVELS = [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1];
const LANGUAGE_OPTIONS = [
    { textKey: 'settings.language.danish', isDanish: true },
    { textKey: 'settings.language.english', isDanish: false }
];
const PLAYER_OPTIONS = [
    { textKey: 'settings.player.adam', sex: 'male' },
    { textKey: 'settings.player.eve', sex: 'female' }
];
const DEBUG_OPTIONS = [
    { textKey: 'settings.difficulty.easy', value: DIFFICULTY.EASY },
    { textKey: 'settings.difficulty.hard', value: DIFFICULTY.HARD },
    { textKey: 'settings.difficulty.debug', value: DIFFICULTY.DEBUG },
];

type LocalizedTextObject = {
    text: Phaser.GameObjects.Text;
    getValue: () => string;
};

type PickerRow = {
    y: number;
    valueText: Phaser.GameObjects.Text;
    getValueText: () => string;
    onPrevious: () => void;
    onNext: () => void;
};

export class Settings extends Scene
{
    private musicIndex = 1;
    private languageIndex = 1;
    private playerIndex = 0;
    private debugIndex = 0;
    private localizedTextObjects: LocalizedTextObject[] = [];
    private rows: PickerRow[] = [];
    private selectedRowIndex = 0;
    private cursor!: Phaser.GameObjects.Image;
    private cursorOutline!: Phaser.GameObjects.Image;
    private controls?: KeyboardComponent;

    constructor ()
    {
        super('settings');
    }

    create ()
    {
        this.localizedTextObjects = [];
        this.rows = [];
        this.selectedRowIndex = 0;
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'credit-bg');

        const savedDifficulty = this.registry.get('difficulty');
        const hasSavedDifficulty = savedDifficulty === DIFFICULTY.EASY || savedDifficulty === DIFFICULTY.HARD || savedDifficulty === DIFFICULTY.DEBUG;
        if (hasSavedDifficulty) {
            const index = DEBUG_OPTIONS.findIndex((option) => option.value === savedDifficulty);
            if (index >= 0) {
                this.debugIndex = index;
            }
        } else {
            const currentDifficulty = DataManager.instance.data.difficulty;
            const index = DEBUG_OPTIONS.findIndex((option) => option.value === currentDifficulty);
            if (index >= 0) {
                this.debugIndex = index;
            }
        }

        const savedMusicVolume = this.registry.get('musicVolume');

        if (typeof savedMusicVolume === 'number') {
            const index = MUSIC_LEVELS.findIndex((v) => v === savedMusicVolume);
            if (index >= 0) {
                this.musicIndex = index;
            }
        }

        const savedLanguage = this.registry.get('languageIsDanish');
        if (typeof savedLanguage === 'boolean') {
            this.languageIndex = savedLanguage ? 0 : 1;
        } else {
            this.languageIndex = DataManager.instance.data.languageIsDanish ? 0 : 1;
        }

        const savedPlayerSex = this.registry.get('playerSex');
        if (typeof savedPlayerSex === 'string') {
            const index = PLAYER_OPTIONS.findIndex((option) => option.sex === savedPlayerSex);
            if (index >= 0) {
                this.playerIndex = index;
            }
        } else {
            const index = PLAYER_OPTIONS.findIndex((option) => option.sex === DataManager.instance.data.sex);
            if (index >= 0) {
                this.playerIndex = index;
            }
        }

        const savedDebug = this.registry.get('physicsDebug');
        if (!hasSavedDifficulty && typeof savedDebug === 'boolean') {
            this.debugIndex = savedDebug ? 1 : 0;
        }

        const centerX = this.cameras.main.centerX;

        const titleText = this.add.text(centerX, 80, getText('settings.title'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 56, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.trackLocalizedText(titleText, () => getText('settings.title'));

        this.createPickerRow({
            x: centerX,
            y: 200,
            getLabelText: () => getText('settings.musicVolume'),
            getValueText: () => `${Math.round(MUSIC_LEVELS[this.musicIndex] * 100)}%`,
            onPrevious: () => this.changeMusicVolume(-1),
            onNext: () => this.changeMusicVolume(1)
        });

        this.createPickerRow({
            x: centerX,
            y: 250,
            getLabelText: () => getText('settings.language'),
            getValueText: () => getText(LANGUAGE_OPTIONS[this.languageIndex].textKey as TextKey),
            onPrevious: () => this.changeLanguage(-1),
            onNext: () => this.changeLanguage(1)
        });

        this.createPickerRow({
            x: centerX,
            y: 300,
            getLabelText: () => getText('settings.playingAs'),
            getValueText: () => getText(PLAYER_OPTIONS[this.playerIndex].textKey as TextKey),
            onPrevious: () => this.changePlayer(-1),
            onNext: () => this.changePlayer(1)
        });

        this.createPickerRow({
            x: centerX,
            y: 350,
            getLabelText: () => getText('settings.difficulty'),
            getValueText: () => getText(DEBUG_OPTIONS[this.debugIndex].textKey as TextKey),
            onPrevious: () => this.changeDifficulty(-1),
            onNext: () => this.changeDifficulty(1)
        });

        this.applyMusicVolume();
        this.applyLanguage();
        this.applyPlayer();
        this.applyDifficulty();

        this.cursorOutline = this.add.image(0, 0, ASSET_KEYS.UI_CURSOR, 0)
            .setOrigin(0.5)
            .setDisplaySize(CURSOR_SIZE*2 + 6, CURSOR_SIZE*2 + 6)
            .setDepth(100)
            .setTint(0x000010);
        this.cursor = this.add.image(0, 0, ASSET_KEYS.UI_CURSOR, 0)
            .setOrigin(0.56, 0.5)
            .setDisplaySize(CURSOR_SIZE*2-4, CURSOR_SIZE*2-2)
            .setDepth(101)
            .setTint(0x5eb1da);
        this.updateCursorPosition();

        if (this.input.keyboard) {
            this.controls = new KeyboardComponent(this.input.keyboard);
        } else {
            console.warn('[Settings] keyboard plugin is not setup properly');
        }

        const backText = this.add.text(980, 750, getText('settings.back'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
        });
        this.trackLocalizedText(backText, () => getText('settings.back'));
        backText.setOrigin(1);
        backText.setInteractive({ useHandCursor: true });
        backText.on('pointerdown', () => {
            this.scene.start(SCENE_KEYS.INTRO);
        });
    }

    update (): void
    {
        if (!this.controls || this.rows.length === 0) {
            return;
        }

        if (this.controls.isEscapeKeyJustDown || this.controls.isEnterKeyJustDown || this.controls.isActionKeyJustDown) {
            this.scene.start(SCENE_KEYS.INTRO);
            return;
        }

        if (this.controls.isUpJustDown) {
            this.selectedRowIndex = Phaser.Math.Clamp(this.selectedRowIndex - 1, 0, this.rows.length - 1);
            this.updateCursorPosition();
            return;
        }

        if (this.controls.isDownJustDown) {
            this.selectedRowIndex = Phaser.Math.Clamp(this.selectedRowIndex + 1, 0, this.rows.length - 1);
            this.updateCursorPosition();
            return;
        }

        const activeRow = this.rows[this.selectedRowIndex];
        if (this.controls.isLeftJustDown) {
            activeRow.onPrevious();
            activeRow.valueText.setText(activeRow.getValueText());
            return;
        }
        if (this.controls.isRightJustDown) {
            activeRow.onNext();
            activeRow.valueText.setText(activeRow.getValueText());
        }
    }

    private updateCursorPosition (): void
    {
        if (!this.cursor || this.rows.length === 0) {
            return;
        }
        const row = this.rows[this.selectedRowIndex];
        const cursorX = 700 - 170 - CURSOR_X_OFFSET;
        this.cursor.setPosition(cursorX, row.y);
        this.cursorOutline.setPosition(cursorX, row.y);
    }

    private createPickerRow (config: {
        x: number;
        y: number;
        getLabelText: () => string;
        getValueText: () => string;
        onPrevious: () => void;
        onNext: () => void;
    }): void
    {
        let x1= 80;
        let x2=700;
        const labelText = this.add.text(x1, config.y -25 , config.getLabelText(), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 5,
        }).setOrigin(0);
        this.trackLocalizedText(labelText, config.getLabelText);

        const previousText = this.add.text(x2 - 170, config.y, '<', {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 5,
        }).setOrigin(0.5);

        const valueText = this.add.text(x2-50, config.y, config.getValueText(), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 5,
        }).setOrigin(0.5);
        this.trackLocalizedText(valueText, config.getValueText);

        const nextText = this.add.text(x2 + 170-100, config.y, '>', {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 5,
        }).setOrigin(0.5);

        previousText.setInteractive({ useHandCursor: true });
        nextText.setInteractive({ useHandCursor: true });

        previousText.on('pointerdown', () => {
            config.onPrevious();
            valueText.setText(config.getValueText());
        });

        nextText.on('pointerdown', () => {
            config.onNext();
            valueText.setText(config.getValueText());
        });

        this.rows.push({
            y: config.y,
            valueText,
            getValueText: config.getValueText,
            onPrevious: config.onPrevious,
            onNext: config.onNext,
        });
    }

    private changeMusicVolume (direction: number): void
    {
        this.musicIndex = Phaser.Math.Wrap(this.musicIndex + direction, 0, MUSIC_LEVELS.length);
        this.applyMusicVolume();
    }

    private changeLanguage (direction: number): void
    {
        this.languageIndex = Phaser.Math.Wrap(this.languageIndex + direction, 0, LANGUAGE_OPTIONS.length);
        this.applyLanguage();
        this.refreshLocalizedTexts();
    }

    private trackLocalizedText (text: Phaser.GameObjects.Text, getValue: () => string): void
    {
        this.localizedTextObjects.push({ text, getValue });
    }

    private refreshLocalizedTexts (): void
    {
        this.localizedTextObjects.forEach(({ text, getValue }) => {
            text.setText(getValue());
        });
    }

    private changePlayer (direction: number): void
    {
        this.playerIndex = Phaser.Math.Wrap(this.playerIndex + direction, 0, PLAYER_OPTIONS.length);
        this.applyPlayer();
    }

    private applyMusicVolume (): void
    {
        const value = MUSIC_LEVELS[this.musicIndex];
        this.registry.set('musicVolume', value);
        this.sound.volume = value;
    }

    private applyLanguage (): void
    {
        const languageIsDanish = LANGUAGE_OPTIONS[this.languageIndex].isDanish;
        this.registry.set('languageIsDanish', languageIsDanish);
        DataManager.instance.data = {
            ...DataManager.instance.data,
            languageIsDanish,
        };
    }

    private applyPlayer (): void
    {
        const playerSex = PLAYER_OPTIONS[this.playerIndex].sex;
        this.registry.set('playerSex', playerSex);
        DataManager.instance.data = {
            ...DataManager.instance.data,
            sex: playerSex,
        };
    }

    private changeDifficulty (direction: number): void
    {
        this.debugIndex = Phaser.Math.Wrap(this.debugIndex + direction, 0, DEBUG_OPTIONS.length);
        this.applyDifficulty();
    }

    private applyDifficulty (): void
    {
        const difficulty = DEBUG_OPTIONS[this.debugIndex].value;
        const debugEnabled = difficulty === DIFFICULTY.DEBUG;
        this.registry.set('difficulty', difficulty);
        this.registry.set('physicsDebug', debugEnabled);
        setEnableLogging(debugEnabled);
        
        const gameScene = this.scene.get('GameScene');
        if (gameScene?.physics?.world) {
            const world = gameScene.physics.world;
            if (debugEnabled && !world.debugGraphic) {
                world.createDebugGraphic();
            }
            world.drawDebug = debugEnabled;
            if (!debugEnabled && world.debugGraphic) {
                world.debugGraphic.clear();
            }
        }
        DataManager.instance.data = {
            ...DataManager.instance.data,
            isDebugMode: debugEnabled,
            difficulty: difficulty,
        };
    }
}
