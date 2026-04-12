import { Scene } from 'phaser';
import { DataManager } from '../common/data-manager';

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    uiText: '#93c9e4',
    uiTextBorder: '#000000',
};

const MUSIC_LEVELS = [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1];
const BG_OPTIONS = [
    { label: 'Forest', value: '#233d2a' },
    { label: 'Lake', value: '#1f3e56' },
    { label: 'Night', value: '#171718' },
    { label: 'Sand', value: '#7a6940' },
    { label: 'Rose', value: '#5a2f42' }
];
const LANGUAGE_OPTIONS = [
    { label: 'Danish', isDanish: true },
    { label: 'English', isDanish: false }
];
const PLAYER_OPTIONS = [
    { label: 'Adam', sex: 'male' },
    { label: 'Eve', sex: 'female' }
];

export class Settings extends Scene
{
    private musicIndex = 1;
    private bgIndex = 2;
    private languageIndex = 1;
    private playerIndex = 0;

    constructor ()
    {
        super('Settings');
    }

    create ()
    {
        const savedMusicVolume = this.registry.get('musicVolume');
        const savedBgColor = this.registry.get('settingsBgColor');

        if (typeof savedMusicVolume === 'number') {
            const index = MUSIC_LEVELS.findIndex((v) => v === savedMusicVolume);
            if (index >= 0) {
                this.musicIndex = index;
            }
        }

        if (typeof savedBgColor === 'string') {
            const index = BG_OPTIONS.findIndex((option) => option.value === savedBgColor);
            if (index >= 0) {
                this.bgIndex = index;
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

        const centerX = this.cameras.main.centerX;

        this.add.text(centerX, 110, 'Settings', {
            fontFamily: 'Arial Black', fontSize: 64, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.createPickerRow({
            x: centerX,
            y: 290,
            label: 'Music Volume',
            getValueText: () => `${Math.round(MUSIC_LEVELS[this.musicIndex] * 100)}%`,
            onPrevious: () => this.changeMusicVolume(-1),
            onNext: () => this.changeMusicVolume(1)
        });

        this.createPickerRow({
            x: centerX,
            y: 430,
            label: 'Background Color',
            getValueText: () => BG_OPTIONS[this.bgIndex].label,
            onPrevious: () => this.changeBackgroundColor(-1),
            onNext: () => this.changeBackgroundColor(1)
        });

        this.createPickerRow({
            x: centerX,
            y: 570,
            label: 'Language',
            getValueText: () => LANGUAGE_OPTIONS[this.languageIndex].label,
            onPrevious: () => this.changeLanguage(-1),
            onNext: () => this.changeLanguage(1)
        });

        this.createPickerRow({
            x: centerX,
            y: 710,
            label: 'Playing as',
            getValueText: () => PLAYER_OPTIONS[this.playerIndex].label,
            onPrevious: () => this.changePlayer(-1),
            onNext: () => this.changePlayer(1)
        });

        this.applyBackgroundColor();
        this.applyMusicVolume();
        this.applyLanguage();
        this.applyPlayer();

        const backText = this.add.text(900, 700, 'Back', {
            fontFamily: 'Arial Black', fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
            align: 'center'
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
        this.add.text(config.x, config.y - 55, config.label, {
            fontFamily: 'Arial Black', fontSize: 36, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 7,
            align: 'center'
        }).setOrigin(0.5);

        const previousText = this.add.text(config.x - 170, config.y, '<', {
            fontFamily: 'Arial Black', fontSize: 56, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 7,
            align: 'center'
        }).setOrigin(0.5);

        const valueText = this.add.text(config.x, config.y, config.getValueText(), {
            fontFamily: 'Arial Black', fontSize: 42, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 7,
            align: 'center'
        }).setOrigin(0.5);

        const nextText = this.add.text(config.x + 170, config.y, '>', {
            fontFamily: 'Arial Black', fontSize: 56, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 7,
            align: 'center'
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

    private changeBackgroundColor (direction: number): void
    {
        this.bgIndex = Phaser.Math.Wrap(this.bgIndex + direction, 0, BG_OPTIONS.length);
        this.applyBackgroundColor();
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

    private applyBackgroundColor (): void
    {
        const color = BG_OPTIONS[this.bgIndex].value;
        this.registry.set('settingsBgColor', color);
        this.cameras.main.setBackgroundColor(color);
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
}
