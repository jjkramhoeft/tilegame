import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { ASSET_KEYS } from '../common/assets';
import { getText } from '../common/texts';
import { SCENE_KEYS } from './scene-keys';
import { KeyboardComponent } from '../components/input/keyboard-component';

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    heading: '#5eb1da',
    body: '#93c9e4',
    textStroke: '#000000',
};

const REFLECTION_SCROLL_TOP = 180;
const REFLECTION_SCROLL_BOTTOM = 710;
const REFLECTION_SCROLL_HEIGHT = REFLECTION_SCROLL_BOTTOM - REFLECTION_SCROLL_TOP;
const REFLECTION_TEXT_X = 60;
const REFLECTION_TEXT_SPACING = 18;
const REFLECTION_HEADING_TOP_SPACING = 24;
const REFLECTION_KEYBOARD_SCROLL_SPEED = 420;
const REFLECTION_MOUSE_WHEEL_SCROLL_SPEED = 0.7;

type ReflectionTextConfig = {
    textKey: Parameters<typeof getText>[0];
    width: number;
    isHeading?: boolean;
};

const REFLECTION_TEXTS: ReflectionTextConfig[] = [
    { textKey: 'reflection.point1', width: 800, isHeading: true },
    { textKey: 'reflection.point2', width: 800 },
    { textKey: 'reflection.point3', width: 800 },
    { textKey: 'reflection.point4', width: 800, isHeading: true },
    { textKey: 'reflection.point5', width: 800 },
    { textKey: 'reflection.point6', width: 800 },
    { textKey: 'reflection.point7', width: 800, isHeading: true },
    { textKey: 'reflection.point8', width: 800 },
    { textKey: 'reflection.point9', width: 800 },
    { textKey: 'reflection.point10', width: 800 },
    { textKey: 'reflection.point11', width: 800, isHeading: true },
    { textKey: 'reflection.point12', width: 800 },
    { textKey: 'reflection.point13', width: 800 },
    { textKey: 'reflection.point14', width: 800 },
    { textKey: 'reflection.point15', width: 800, isHeading: true },
    { textKey: 'reflection.point16', width: 800 },
    { textKey: 'reflection.point17', width: 800 },
    { textKey: 'reflection.point18', width: 800 },
];

export class Reflection extends Scene
{
    reflectionMusic?: Phaser.Sound.BaseSound;
    private reflectionScrollContainer?: Phaser.GameObjects.Container;
    private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
    private controls?: KeyboardComponent;
    private scrollOffset = 0;
    private maxScrollOffset = 0;

    constructor ()
    {
        super('reflection');
    }

    create ()
    {
        const centerY = this.cameras.main.centerY;
        const centerX = this.cameras.main.centerX;
        const registryVolume = this.registry.get('musicVolume');
        const musicVolume = typeof registryVolume === 'number' ? registryVolume : 0.1;

        this.registry.set('musicVolume', musicVolume);
        this.sound.volume = musicVolume;

        this.reflectionMusic = this.sound.add('creditsMusic', {
            loop: true
        });
        this.reflectionMusic.play();

        this.add.image(centerX, centerY, 'credit-bg');
        this.add.image(centerX+355, 95, 'logo').setDepth(100).setScale(1.5);

        this.add.text(50, 90, getText('reflection.title'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 58, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
        }).setOrigin(0).setDepth(100);

        // -------------------------------------------------------------------------------------------

        this.createScrollableReflectionText();

        // -------------------------------------------------------------------------------------------

        const exit_text = this.add.text(980, 755, getText('reflection.back'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 28, color: COLORS.body,
            stroke: COLORS.textStroke, strokeThickness: 8,
        });
        exit_text.setOrigin(1);
        exit_text.setInteractive({ useHandCursor: true });
        exit_text.on('pointerdown', () => {
            this.returnToIntro();
        });

        if (this.input.keyboard) {
            this.controls = new KeyboardComponent(this.input.keyboard);
        } else {
            console.warn('[Reflection] keyboard plugin is not setup properly');
        }

        this.events.once('shutdown', () => {
            this.reflectionMusic?.stop();
            this.reflectionMusic?.destroy();
            this.reflectionMusic = undefined;
        });
    }

    update (_time: number, delta: number)
    {
        if (this.controls && (this.controls.isEnterKeyJustDown || this.controls.isActionKeyJustDown)) {
            this.returnToIntro();
            return;
        }

        if (!this.cursorKeys) {
            return;
        }

        const scrollAmount = REFLECTION_KEYBOARD_SCROLL_SPEED * (delta / 1000);

        if (this.cursorKeys.up.isDown) {
            this.scrollReflection(-scrollAmount);
        }

        if (this.cursorKeys.down.isDown) {
            this.scrollReflection(scrollAmount);
        }
    }

    private returnToIntro ()
    {
        this.reflectionMusic?.stop();
        this.scene.start(SCENE_KEYS.INTRO);
    }

    private createScrollableReflectionText ()
    {
        this.reflectionScrollContainer = this.add.container(0, REFLECTION_SCROLL_TOP).setDepth(50);
        this.scrollOffset = 0;
        this.maxScrollOffset = 0;

        let currentY = 0;
        REFLECTION_TEXTS.forEach((reflectionText, index) => {
            if (reflectionText.isHeading && index > 0) {
                currentY += REFLECTION_HEADING_TOP_SPACING;
            }

            const text = this.add.text(REFLECTION_TEXT_X, currentY, getText(reflectionText.textKey), {
                fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX,
                fontSize: reflectionText.isHeading ? 38 : 28,
                color: reflectionText.isHeading ? COLORS.heading : COLORS.body,
                stroke: COLORS.textStroke,
                strokeThickness: reflectionText.isHeading ? 6 : 5,
                align: 'left',
                wordWrap: { width: reflectionText.width },
                lineSpacing: 4,
            });

            this.reflectionScrollContainer?.add(text);
            currentY += text.height + REFLECTION_TEXT_SPACING;
        });

        const contentHeight = Math.max(0, currentY - REFLECTION_TEXT_SPACING);
        this.maxScrollOffset = Math.max(0, contentHeight - REFLECTION_SCROLL_HEIGHT);

        Phaser.Actions.AddMaskShape(this.reflectionScrollContainer, {
            shape: 'rectangle',
            region: new Phaser.Geom.Rectangle(0, REFLECTION_SCROLL_TOP, this.scale.width, REFLECTION_SCROLL_HEIGHT),
        });

        this.cursorKeys = this.input.keyboard?.createCursorKeys();
        this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
            this.scrollReflection(deltaY * REFLECTION_MOUSE_WHEEL_SCROLL_SPEED);
        });
    }

    private scrollReflection (amount: number)
    {
        if (!this.reflectionScrollContainer) {
            return;
        }

        this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset + amount, 0, this.maxScrollOffset);
        this.reflectionScrollContainer.y = REFLECTION_SCROLL_TOP - this.scrollOffset;
    }
}
