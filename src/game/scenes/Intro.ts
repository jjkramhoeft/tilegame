import { Scene } from 'phaser';
import { ASSET_KEYS, ASSET_PACK_KEYS } from '../../assets';
import { SCENE_KEYS } from './scene-keys';

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    uiText: '#93c9e4',
    uiTextBorder: '#000000',
};

export class Intro extends Scene {
    exit_text: Phaser.GameObjects.Text;
    introMusic?: Phaser.Sound.BaseSound;

    constructor() {
        super('Intro');
    }

    preload() { }

    create() {
        let musicVolume = this.registry.get('musicVolume');
        if (typeof musicVolume !== 'number') {
            this.registry.set('musicVolume', 0.05);
            musicVolume = 0.05
        }

        this.sound.volume = musicVolume;

        this.add.image(512, 384, 'background');
        this.add.image(512, 150, 'logo').setDepth(100);

        this.introMusic = this.sound.add('introMusic', {
            loop: true
        });
        this.introMusic.play();

        this.add.text(512, 415, 'Den 1. Have - Gartnerens Lærling', {
            fontFamily: 'Arial Black', fontSize: 38, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.exit_text = this.add.text(915, 700, 'Exit', {
            fontFamily: 'Arial Black', fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
            align: 'center'
        });
        this.exit_text.setOrigin(0);
        this.exit_text.setInteractive({ useHandCursor: true });
        this.exit_text.on('pointerdown', () => {
            this.introMusic?.stop();
            this.scene.stop('Intro');
        });

        const credits_text = this.add.text(850, 650, 'Credits', {
            fontFamily: 'Arial Black', fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
            align: 'center'
        });
        credits_text.setOrigin(0);
        credits_text.setInteractive({ useHandCursor: true });
        credits_text.on('pointerdown', () => {
            this.introMusic?.stop();
            this.scene.start('Credits');
        });

        const settings_text = this.add.text(827, 600, 'Settings', {
            fontFamily: 'Arial Black', fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
            align: 'center'
        });
        settings_text.setOrigin(0);
        settings_text.setInteractive({ useHandCursor: true });
        settings_text.on('pointerdown', () => {
            this.introMusic?.stop();
            this.scene.start('Settings');
        });

        this.exit_text = this.add.text(20, 700, 'New Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
            align: 'center'
        });
        this.exit_text.setOrigin(0);
        this.exit_text.setInteractive({ useHandCursor: true });
        this.exit_text.on('pointerdown', () => {
            this.introMusic?.stop();
            this.scene.start(SCENE_KEYS.GAME_SCENE);
        });

        this.events.once('shutdown', () => {
            this.introMusic?.stop();
            this.introMusic?.destroy();
            this.introMusic = undefined;
        });
    }
}
