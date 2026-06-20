import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { GameDataManager } from '../common/game-data-manager';
import { setEnableLogging } from '../common/config';
import {
    ASSET_KEYS,
    PLANT1_ANIMATION_KEYS,
    PLANT2_ANIMATION_KEYS,
    PLANT3_ANIMATION_KEYS,
} from '../common/assets';
import { getText, type TextKey } from '../common/texts';
import { SCENE_KEYS } from './scene-keys';
import { DIFFICULTY, SEX, isDifficulty, isDebugDifficulty, isSex } from '../common/common';
import type { Difficulty, Sex } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { AmbientParticles, createAmbientParticles } from './ambient-particles';

const CURSOR_SIZE = 16;
const CURSOR_X_OFFSET = 30; // distance left of the '<' arrow

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    uiText: '#93c9e4',
    uiTextBorder: '#000000',
};

const MUSIC_LEVELS = [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1];
const PLANT_POSITION = { x: 750, y: 500 } as const;
const PLANT_IDLE_CHANGE_DELAY_MIN = 5000;
const PLANT_IDLE_CHANGE_DELAY_MAX = 8000;
const LANGUAGE_OPTIONS = [
    { textKey: 'settings.language.danish', isDanish: true },
    { textKey: 'settings.language.english', isDanish: false }
];
const PLAYER_OPTIONS = [
    { textKey: 'settings.player.adam', sex: SEX.MALE },
    { textKey: 'settings.player.eve', sex: SEX.FEMALE }
] satisfies readonly { textKey: TextKey; sex: Sex }[];
const DEBUG_OPTIONS = [
    { textKey: 'settings.difficulty.easy', value: DIFFICULTY.EASY },
    { textKey: 'settings.difficulty.hard', value: DIFFICULTY.HARD },
    { textKey: 'settings.difficulty.debugPlay', value: DIFFICULTY.DEBUG_PLAY },
    { textKey: 'settings.difficulty.debugAssets', value: DIFFICULTY.DEBUG_ASSETS },
] satisfies readonly { textKey: TextKey; value: Difficulty }[];

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

type DecorativePlantConfig = {
    textureKey: string;
    idleAnimationKeys: string[];
};

const DECORATIVE_PLANTS: DecorativePlantConfig[] = [
    {
        textureKey: ASSET_KEYS.PLANT1_IDLE,
        idleAnimationKeys: [PLANT1_ANIMATION_KEYS.IDLE_LEFT, PLANT1_ANIMATION_KEYS.IDLE_RIGHT, PLANT1_ANIMATION_KEYS.IDLE_DOWN],
    },
    {
        textureKey: ASSET_KEYS.PLANT2_IDLE,
        idleAnimationKeys: [PLANT2_ANIMATION_KEYS.IDLE_LEFT, PLANT2_ANIMATION_KEYS.IDLE_RIGHT, PLANT2_ANIMATION_KEYS.IDLE_DOWN],
    },
    {
        textureKey: ASSET_KEYS.PLANT3_IDLE,
        idleAnimationKeys: [PLANT3_ANIMATION_KEYS.IDLE_LEFT, PLANT3_ANIMATION_KEYS.IDLE_RIGHT, PLANT3_ANIMATION_KEYS.IDLE_DOWN],
    },
];

export class Settings extends Scene {
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
    private decorativePlant?: Phaser.GameObjects.Sprite;
    private decorativePlantTimer?: Phaser.Time.TimerEvent;
    private ambientParticles?: AmbientParticles;
    #uiDownSound!: Phaser.Sound.BaseSound;
    #uiUpSound!: Phaser.Sound.BaseSound;
    #uiSelectSound!: Phaser.Sound.BaseSound;

    constructor() {
        super('settings');
    }

    create() {
        this.localizedTextObjects = [];
        this.rows = [];
        this.selectedRowIndex = 0;
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, ASSET_KEYS.CREDITS_BACKGROUND);
        this.ambientParticles = createAmbientParticles(this);
        this.createDecorativePlant();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.ambientParticles?.destroy();
            this.ambientParticles = undefined;
            this.cleanupDecorativePlantTimer();
        });

        this.#uiDownSound = this.sound.add(ASSET_KEYS.UI_DOWN);
        this.#uiUpSound = this.sound.add(ASSET_KEYS.UI_UP);
        this.#uiSelectSound = this.sound.add(ASSET_KEYS.UI_SELECT);

        this.addKeyboard('default', -350, 100);
        this.addKeyboard('alt', -350, 250);

        const savedDifficulty = this.registry.get('difficulty');
        const hasSavedDifficulty = isDifficulty(savedDifficulty);
        if (hasSavedDifficulty) {
            const index = DEBUG_OPTIONS.findIndex((option) => option.value === savedDifficulty);
            if (index >= 0) {
                this.debugIndex = index;
            }
        } else {
            const currentDifficulty = GameDataManager.instance.data.difficulty;
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
            this.languageIndex = GameDataManager.instance.data.languageIsDanish ? 0 : 1;
        }

        const savedPlayerSex = this.registry.get('playerSex');
        if (isSex(savedPlayerSex)) {
            const index = PLAYER_OPTIONS.findIndex((option) => option.sex === savedPlayerSex);
            if (index >= 0) {
                this.playerIndex = index;
            }
        } else {
            const index = PLAYER_OPTIONS.findIndex((option) => option.sex === GameDataManager.instance.data.sex);
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
            .setDisplaySize(CURSOR_SIZE * 2 + 6, CURSOR_SIZE * 2 + 6)
            .setDepth(100)
            .setTint(0x000010);
        this.cursor = this.add.image(0, 0, ASSET_KEYS.UI_CURSOR, 0)
            .setOrigin(0.56, 0.5)
            .setDisplaySize(CURSOR_SIZE * 2 - 4, CURSOR_SIZE * 2 - 2)
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
            this.#uiSelectSound.play();
            this.scene.start(SCENE_KEYS.INTRO);
        });
    }

    addKeyboard(layout: string, xOffset: number, yOffset: number): void {
        const x = this.cameras.main.centerX + xOffset;
        const y = this.cameras.main.centerY + yOffset;
        const dy = 25;
        const dx = 80;
        if (layout === 'default' && this.input.keyboard) {
            //Attack z  
            this.add.image(x, y, ASSET_KEYS.KEYBOARDKEYS, 8);
            const attackText = this.add.text(x, y + dy, getText('keyboard.attack'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100);
            this.trackLocalizedText(attackText, () => getText('keyboard.attack'));
            //Interact x
            this.add.image(x + dx, y, ASSET_KEYS.KEYBOARDKEYS, 9);
            const interactText = this.add.text(x + dx, y + dy, getText('keyboard.interact'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100);
            this.trackLocalizedText(interactText, () => getText('keyboard.interact'));
            //Cast c
            this.add.image(x + dx * 2, y, ASSET_KEYS.KEYBOARDKEYS, 10);
            const castText = this.add.text(x + dx * 2, y + dy, getText('keyboard.cast'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100);
            this.trackLocalizedText(castText, () => getText('keyboard.cast'));
            //Map m
            this.add.image(x + dx * 3.2, y, ASSET_KEYS.KEYBOARDKEYS, 11);
            const mapText = this.add.text(x + dx * 3.2, y + dy, getText('keyboard.map'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100);
            this.trackLocalizedText(mapText, () => getText('keyboard.map'));
            //Move 
            this.add.image(x + dx * 5, y, ASSET_KEYS.KEYBOARDKEYS, 13);
            this.add.image(x + dx * 4.5, y + dy, ASSET_KEYS.KEYBOARDKEYS, 14);
            this.add.image(x + dx * 5, y + dy, ASSET_KEYS.KEYBOARDKEYS, 15);
            this.add.image(x + dx * 5.5, y + dy, ASSET_KEYS.KEYBOARDKEYS, 16);
            const moveText = this.add.text(x + dx * 5, y + dy * 2.2, getText('keyboard.move'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100);
            this.trackLocalizedText(moveText, () => getText('keyboard.move'));
        } else if (layout === 'alt' && this.input.keyboard) {
            const dimColor = 0x999999;
            //Move 
            this.add.image(x + dx * 0.5, y, ASSET_KEYS.KEYBOARDKEYS, 1).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            this.add.image(x, y + dy, ASSET_KEYS.KEYBOARDKEYS, 5).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            this.add.image(x + dx * 0.5, y + dy, ASSET_KEYS.KEYBOARDKEYS, 6).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            this.add.image(x + dx, y + dy, ASSET_KEYS.KEYBOARDKEYS, 7).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            const moveText = this.add.text(x + dx * 0.5, y + dy * 2.2, getText('keyboard.move'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            this.trackLocalizedText(moveText, () => getText('keyboard.move'));
            //Attack r  
            this.add.image(x+ dx * 2, y, ASSET_KEYS.KEYBOARDKEYS, 2).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            const attackText = this.add.text(x+dx*2, y + dy, getText('keyboard.attack'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            this.trackLocalizedText(attackText, () => getText('keyboard.attack'));
            //Cast t
            this.add.image(x + dx * 3, y, ASSET_KEYS.KEYBOARDKEYS, 3).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            const castText = this.add.text(x + dx * 3, y + dy, getText('keyboard.cast'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            this.trackLocalizedText(castText, () => getText('keyboard.cast'));
            //Map m
            this.add.image(x + dx * 4, y, ASSET_KEYS.KEYBOARDKEYS, 11).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            const mapText = this.add.text(x + dx * 4, y + dy, getText('keyboard.map'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            //Interact enter
            this.add.image(x + dx*5, y, ASSET_KEYS.KEYBOARDKEYS, 4).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            const interactText = this.add.text(x + dx*5, y + dy, getText('keyboard.interact'), { fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 22, color: COLORS.title, stroke: COLORS.titleStroke, strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(100).setTint(dimColor).setTintMode(Phaser.TintModes.MULTIPLY);
            this.trackLocalizedText(interactText, () => getText('keyboard.interact'));
            this.trackLocalizedText(mapText, () => getText('keyboard.map'));
        }
    }

    update(): void {
        if (!this.controls || this.rows.length === 0) {
            return;
        }

        if (this.controls.isEscapeKeyJustDown || this.controls.isActionKeyJustDown) {
            this.#uiSelectSound.play();
            this.scene.start(SCENE_KEYS.INTRO);
            return;
        }

        if (this.controls.isUpJustDown) {
            this.selectedRowIndex = Phaser.Math.Clamp(this.selectedRowIndex - 1, 0, this.rows.length - 1);
            this.updateCursorPosition();
            this.#uiUpSound.play();
            return;
        }

        if (this.controls.isDownJustDown) {
            this.selectedRowIndex = Phaser.Math.Clamp(this.selectedRowIndex + 1, 0, this.rows.length - 1);
            this.updateCursorPosition();
            this.#uiDownSound.play();
            return;
        }

        const activeRow = this.rows[this.selectedRowIndex];
        if (this.controls.isLeftJustDown) {
            activeRow.onPrevious();
            activeRow.valueText.setText(activeRow.getValueText());
            this.#uiDownSound.play();
            return;
        }
        if (this.controls.isRightJustDown) {
            activeRow.onNext();
            activeRow.valueText.setText(activeRow.getValueText());
            this.#uiUpSound.play();
        }
    }

    private updateCursorPosition(): void {
        if (!this.cursor || this.rows.length === 0) {
            return;
        }
        const row = this.rows[this.selectedRowIndex];
        const cursorX = 700 - 170 - CURSOR_X_OFFSET;
        this.cursor.setPosition(cursorX, row.y);
        this.cursorOutline.setPosition(cursorX, row.y);
    }

    private createDecorativePlant(): void {
        const plantConfig = Phaser.Utils.Array.GetRandom(DECORATIVE_PLANTS);
        this.decorativePlant = this.add.sprite(PLANT_POSITION.x + Phaser.Math.Between(0, 150), PLANT_POSITION.y, plantConfig.textureKey)
            .setScale(2)
            .setOrigin(0.5)
            .setDepth(1);
        this.playRandomDecorativePlantIdle(plantConfig);
        this.scheduleDecorativePlantIdleChange(plantConfig);
    }

    private playRandomDecorativePlantIdle(plantConfig: DecorativePlantConfig): void {
        if (!this.decorativePlant?.active) {
            return;
        }
        this.decorativePlant.play(Phaser.Utils.Array.GetRandom(plantConfig.idleAnimationKeys), true);
    }

    private scheduleDecorativePlantIdleChange(plantConfig: DecorativePlantConfig): void {
        this.cleanupDecorativePlantTimer();
        this.decorativePlantTimer = this.time.delayedCall(
            Phaser.Math.Between(PLANT_IDLE_CHANGE_DELAY_MIN, PLANT_IDLE_CHANGE_DELAY_MAX),
            () => {
                this.playRandomDecorativePlantIdle(plantConfig);
                this.scheduleDecorativePlantIdleChange(plantConfig);
            },
        );
    }

    private cleanupDecorativePlantTimer(): void {
        this.decorativePlantTimer?.remove(false);
        this.decorativePlantTimer = undefined;
    }

    private createPickerRow(config: {
        x: number;
        y: number;
        getLabelText: () => string;
        getValueText: () => string;
        onPrevious: () => void;
        onNext: () => void;
    }): void {
        let x1 = 80;
        let x2 = 700;
        const labelText = this.add.text(x1, config.y - 25, config.getLabelText(), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 5,
        }).setOrigin(0);
        this.trackLocalizedText(labelText, config.getLabelText);

        const previousText = this.add.text(x2 - 170, config.y, '<', {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 5,
        }).setOrigin(0.5);

        const valueText = this.add.text(x2 - 50, config.y, config.getValueText(), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 5,
        }).setOrigin(0.5);
        this.trackLocalizedText(valueText, config.getValueText);

        const nextText = this.add.text(x2 + 170 - 100, config.y, '>', {
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

    private changeMusicVolume(direction: number): void {
        this.musicIndex = Phaser.Math.Wrap(this.musicIndex + direction, 0, MUSIC_LEVELS.length);
        this.applyMusicVolume();
    }

    private changeLanguage(direction: number): void {
        this.languageIndex = Phaser.Math.Wrap(this.languageIndex + direction, 0, LANGUAGE_OPTIONS.length);
        this.applyLanguage();
        this.refreshLocalizedTexts();
    }

    private trackLocalizedText(text: Phaser.GameObjects.Text, getValue: () => string): void {
        this.localizedTextObjects.push({ text, getValue });
    }

    private refreshLocalizedTexts(): void {
        this.localizedTextObjects.forEach(({ text, getValue }) => {
            text.setText(getValue());
        });
    }

    private changePlayer(direction: number): void {
        this.playerIndex = Phaser.Math.Wrap(this.playerIndex + direction, 0, PLAYER_OPTIONS.length);
        this.applyPlayer();
    }

    private applyMusicVolume(): void {
        const value = MUSIC_LEVELS[this.musicIndex];
        this.registry.set('musicVolume', value);
    }

    private applyLanguage(): void {
        const languageIsDanish = LANGUAGE_OPTIONS[this.languageIndex].isDanish;
        this.registry.set('languageIsDanish', languageIsDanish);
        GameDataManager.instance.setLanguageIsDanish(languageIsDanish);
    }

    private applyPlayer(): void {
        const playerSex = PLAYER_OPTIONS[this.playerIndex].sex;
        this.registry.set('playerSex', playerSex);
        GameDataManager.instance.setSex(playerSex);
    }

    private changeDifficulty(direction: number): void {
        this.debugIndex = Phaser.Math.Wrap(this.debugIndex + direction, 0, DEBUG_OPTIONS.length);
        this.applyDifficulty();
    }

    private applyDifficulty(): void {
        const difficulty = DEBUG_OPTIONS[this.debugIndex].value;
        const debugEnabled = isDebugDifficulty(difficulty);
        this.registry.set('difficulty', difficulty);
        this.registry.set('physicsDebug', debugEnabled);
        setEnableLogging(debugEnabled);

        const gameScene = this.scene.get(SCENE_KEYS.GAME_SCENE);
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
        GameDataManager.instance.setDifficulty(difficulty, debugEnabled);
    }
}
