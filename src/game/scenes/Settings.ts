import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { DataManager } from '../common/data-manager';
import { setEnableLogging } from '../common/config';
import { ASSET_KEYS } from '../common/assets';

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    uiText: '#93c9e4',
    uiTextBorder: '#000000',
};

const MUSIC_LEVELS = [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1];
const LANGUAGE_OPTIONS = [
    { label: 'Danish', isDanish: true },
    { label: 'English', isDanish: false }
];
const PLAYER_OPTIONS = [
    { label: 'Adam', sex: 'male' },
    { label: 'Eve', sex: 'female' }
];
const DEBUG_OPTIONS = [
    { label: 'Off', value: false },
    { label: 'On', value: true }
];

export class Settings extends Scene
{
    private musicIndex = 1;
    private languageIndex = 1;
    private playerIndex = 0;
    private debugIndex = 0;

    constructor ()
    {
        super('Settings');
    }

    create ()
    {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'credit-bg');

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
        if (typeof savedDebug === 'boolean') {
            this.debugIndex = savedDebug ? 1 : 0;
        }

        const centerX = this.cameras.main.centerX;

        this.add.text(centerX, 80, 'Settings', {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 56, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.createPickerRow({
            x: centerX,
            y: 200,
            label: 'Music Volume',
            getValueText: () => `${Math.round(MUSIC_LEVELS[this.musicIndex] * 100)}%`,
            onPrevious: () => this.changeMusicVolume(-1),
            onNext: () => this.changeMusicVolume(1)
        });

        this.createPickerRow({
            x: centerX,
            y: 250,
            label: 'Language',
            getValueText: () => LANGUAGE_OPTIONS[this.languageIndex].label,
            onPrevious: () => this.changeLanguage(-1),
            onNext: () => this.changeLanguage(1)
        });

        this.createPickerRow({
            x: centerX,
            y: 300,
            label: 'Playing as',
            getValueText: () => PLAYER_OPTIONS[this.playerIndex].label,
            onPrevious: () => this.changePlayer(-1),
            onNext: () => this.changePlayer(1)
        });

        this.createPickerRow({
            x: centerX,
            y: 350,
            label: 'Debug',
            getValueText: () => DEBUG_OPTIONS[this.debugIndex].label,
            onPrevious: () => this.changeDebug(-1),
            onNext: () => this.changeDebug(1)
        });

        this.applyMusicVolume();
        this.applyLanguage();
        this.applyPlayer();
        this.applyDebug();

        const backText = this.add.text(900, 700, 'Back', {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
        });
        backText.setOrigin(0);
        backText.setInteractive({ useHandCursor: true });
        backText.on('pointerdown', () => {
            this.scene.start('Intro');
        });
    }

    private createPickerRow (config: {
        x: number;
        y: number;
        label: string;
        getValueText: () => string;
        onPrevious: () => void;
        onNext: () => void;
    }): void
    {
        let x1= 80;
        let x2=700;
        this.add.text(x1, config.y -25 , config.label, {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 5,
        }).setOrigin(0);

        const previousText = this.add.text(x2 - 170, config.y, '<', {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 5,
        }).setOrigin(0.5);

        const valueText = this.add.text(x2-50, config.y, config.getValueText(), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 5,
        }).setOrigin(0.5);

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

    private changeDebug (direction: number): void
    {
        this.debugIndex = Phaser.Math.Wrap(this.debugIndex + direction, 0, DEBUG_OPTIONS.length);
        this.applyDebug();
    }

    private applyDebug (): void
    {
        const enabled = DEBUG_OPTIONS[this.debugIndex].value;
        this.registry.set('physicsDebug', enabled);
        setEnableLogging(enabled);

        const gameScene = this.scene.get('GameScene');
        if (gameScene?.physics?.world) {
            const world = gameScene.physics.world;
            if (enabled && !world.debugGraphic) {
                world.createDebugGraphic();
            }
            world.drawDebug = enabled;
            if (!enabled && world.debugGraphic) {
                world.debugGraphic.clear();
            }
        }
        DataManager.instance.data = {
            ...DataManager.instance.data,
            isDebugMode: enabled,
        };
    }
}
