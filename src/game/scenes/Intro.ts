import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { getText } from '../common/texts';
import { KeyboardComponent } from '../components/input/keyboard-component';

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    uiText: '#93c9e4',
    uiTextBorder: '#000000',
};

const CURSOR_SIZE = 16;
const CURSOR_X = 20;
const CURSOR_Y_OFFSET = 20; // vertically center cursor on the menu text

type MenuItem = {
    text: Phaser.GameObjects.Text;
    y: number;
    onSelect: () => void;
};

export class Intro extends Scene {
    exit_text: Phaser.GameObjects.Text;
    introMusic?: Phaser.Sound.BaseSound;
    private menuItems: MenuItem[] = [];
    private selectedMenuIndex = 0;
    private cursor!: Phaser.GameObjects.Image;
    private cursorOutline!: Phaser.GameObjects.Image;
    private controls?: KeyboardComponent;

    constructor() {
        super('intro');
    }

    create() {
        this.menuItems = [];
        this.selectedMenuIndex = 0;

        let musicVolume = this.registry.get('musicVolume');
        if (typeof musicVolume !== 'number') {
            this.registry.set('musicVolume', 0.05);
            musicVolume = 0.05
        }

        this.sound.volume = musicVolume;

        this.add.image(512, 384, 'background');
        this.add.image(512, 150, 'logo').setDepth(100).setScale(2.5);

        this.introMusic = this.sound.add('introMusic', {
            loop: true
        });
        this.introMusic.play();

        this.add.text(512, 415, getText('intro.title'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 38, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.exit_text = this.createMenuText(550, getText('intro.newGame'), () => {
            this.introMusic?.stop();
            this.scene.stop(SCENE_KEYS.UI_SCENE);
            this.scene.stop(SCENE_KEYS.GAME_SCENE);
            this.scene.start(SCENE_KEYS.GAME_SCENE);
        });

        this.createMenuText(600, getText('intro.settings'), () => {
            this.introMusic?.stop();
            this.scene.start(SCENE_KEYS.SETTINGS);
        });

        this.createMenuText(650, getText('intro.credits'), () => {
            this.introMusic?.stop();
            this.scene.start(SCENE_KEYS.CREDITS);
        });

        this.createMenuText(700, getText('intro.reflection'), () => {
            this.introMusic?.stop();
            this.scene.start(SCENE_KEYS.REFLECTION);
        });

        this.cursorOutline = this.add.image(0, 0, ASSET_KEYS.UI_CURSOR, 0)
            .setOrigin(0.5)
            .setDisplaySize(CURSOR_SIZE * 2 + 6, CURSOR_SIZE * 2 + 6)
            .setDepth(100)
            .setTint(0x000010);
        this.cursor = this.add.image(0, 0, ASSET_KEYS.UI_CURSOR, 0)
            .setOrigin(0.5)
            .setDisplaySize(CURSOR_SIZE * 2, CURSOR_SIZE * 2)
            .setDepth(101)
            .setTint(0x5eb1da);
        this.updateCursorPosition();

        if (this.input.keyboard) {
            this.controls = new KeyboardComponent(this.input.keyboard);
        } else {
            console.warn('[Intro] keyboard plugin is not setup properly');
        }

        this.events.once('shutdown', () => {
            this.introMusic?.stop();
            this.introMusic?.destroy();
            this.introMusic = undefined;
        });
    }

    update(): void {
        if (!this.controls || this.menuItems.length === 0) {
            return;
        }

        if (this.controls.isUpJustDown) {
            this.selectedMenuIndex = Phaser.Math.Clamp(this.selectedMenuIndex - 1, 0, this.menuItems.length - 1);
            this.updateCursorPosition();
            return;
        }

        if (this.controls.isDownJustDown) {
            this.selectedMenuIndex = Phaser.Math.Clamp(this.selectedMenuIndex + 1, 0, this.menuItems.length - 1);
            this.updateCursorPosition();
            return;
        }

        if (this.controls.isEnterKeyJustDown || this.controls.isActionKeyJustDown) {
            this.menuItems[this.selectedMenuIndex].onSelect();
        }
    }

    private createMenuText(y: number, label: string, onSelect: () => void): Phaser.GameObjects.Text {
        const text = this.add.text(40, y, label, {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 38, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
        });
        text.setOrigin(0);
        text.setInteractive({ useHandCursor: true });
        text.on('pointerdown', onSelect);
        this.menuItems.push({ text, y, onSelect });
        return text;
    }

    private updateCursorPosition(): void {
        if (!this.cursor || this.menuItems.length === 0) {
            return;
        }
        const item = this.menuItems[this.selectedMenuIndex];
        const cursorY = item.y + CURSOR_Y_OFFSET;
        this.cursor.setPosition(CURSOR_X, cursorY);
        this.cursorOutline.setPosition(CURSOR_X, cursorY);
    }
}
