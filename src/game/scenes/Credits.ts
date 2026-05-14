import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { ASSET_KEYS } from '../common/assets';
import { getText } from '../common/texts';
import { SCENE_KEYS } from './scene-keys';
import { KeyboardComponent } from '../components/input/keyboard-component';

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    uiText: '#93c9e4',
    uiTextBorder: '#000000',
};

const CREDIT_SCROLL_TOP = 220;
const CREDIT_SCROLL_BOTTOM = 700;
const CREDIT_SCROLL_HEIGHT = CREDIT_SCROLL_BOTTOM - CREDIT_SCROLL_TOP;
const CREDIT_TEXT_X = 60;
const CREDIT_TEXT_SPACING = 34;
const CREDIT_KEYBOARD_SCROLL_SPEED = 420;
const CREDIT_MOUSE_WHEEL_SCROLL_SPEED = 0.7;

type CreditTextConfig = {
    textKey: Parameters<typeof getText>[0];
    width: number;
};

const CREDIT_TEXTS: CreditTextConfig[] = [
    { textKey: 'credits.madeFor', width: 800 },
    { textKey: 'credits.thanks', width: 800 },
    { textKey: 'credits.codeHelp', width: 600 },
    { textKey: 'credits.tutorials', width: 600 },
    { textKey: 'credits.graphicsMusic', width: 800 },
    { textKey: 'credits.graphicsOther', width: 800 },
    { textKey: 'credits.graphicsFont', width: 800 },
    { textKey: 'credits.tokenBudget', width: 800 },
    { textKey: 'credits.humanOperator', width: 800 },
];

export class Credits extends Scene
{
    creditsMusic?: Phaser.Sound.BaseSound;
    private creditsScrollContainer?: Phaser.GameObjects.Container;
    private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
    private controls?: KeyboardComponent;
    private scrollOffset = 0;
    private maxScrollOffset = 0;

    constructor ()
    {
        super('credits');
    }

    create ()
    {
        const centerY = this.cameras.main.centerY;
        const centerX = this.cameras.main.centerX;
        const registryVolume = this.registry.get('musicVolume');
        const musicVolume = typeof registryVolume === 'number' ? registryVolume : 0.1;

        this.registry.set('musicVolume', musicVolume);
        this.sound.volume = musicVolume;

        this.creditsMusic = this.sound.add('creditsMusic', {
            loop: true
        });
        this.creditsMusic.play();

        this.add.image(centerX, centerY, 'credit-bg');
        this.add.image(centerX+180, 120, 'logo').setDepth(100);

        this.add.text(200, 150, getText('credits.title'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 58, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
        }).setOrigin(0.5).setDepth(100);

        // -------------------------------------------------------------------------------------------

        this.createScrollableCreditsText();

        // -------------------------------------------------------------------------------------------
        
        const exit_text = this.add.text(980, 750, getText('credits.back'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 28, color: COLORS.uiText,
            stroke: COLORS.uiTextBorder, strokeThickness: 8,
        });
        exit_text.setOrigin(1);
        exit_text.setInteractive({ useHandCursor: true });
        exit_text.on('pointerdown', () => {
            this.returnToIntro();
        });

        if (this.input.keyboard) {
            this.controls = new KeyboardComponent(this.input.keyboard);
        } else {
            console.warn('[Credits] keyboard plugin is not setup properly');
        }

        this.events.once('shutdown', () => {
            this.creditsMusic?.stop();
            this.creditsMusic?.destroy();
            this.creditsMusic = undefined;
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

        const scrollAmount = CREDIT_KEYBOARD_SCROLL_SPEED * (delta / 1000);

        if (this.cursorKeys.up.isDown) {
            this.scrollCredits(-scrollAmount);
        }

        if (this.cursorKeys.down.isDown) {
            this.scrollCredits(scrollAmount);
        }
    }

    private returnToIntro ()
    {
        this.creditsMusic?.stop();
        this.scene.start(SCENE_KEYS.INTRO);
    }

    private createScrollableCreditsText ()
    {
        this.creditsScrollContainer = this.add.container(0, CREDIT_SCROLL_TOP).setDepth(50);
        this.scrollOffset = 0;
        this.maxScrollOffset = 0;

        let currentY = 0;
        CREDIT_TEXTS.forEach((creditText) => {
            const text = this.add.text(CREDIT_TEXT_X, currentY, getText(creditText.textKey), {
                fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
                stroke: COLORS.titleStroke, strokeThickness: 6,
                align: 'left',
                wordWrap: { width: creditText.width },
                lineSpacing: 4,
            });

            this.creditsScrollContainer?.add(text);
            currentY += text.height + CREDIT_TEXT_SPACING;
        });

        const contentHeight = Math.max(0, currentY - CREDIT_TEXT_SPACING);
        this.maxScrollOffset = Math.max(0, contentHeight - CREDIT_SCROLL_HEIGHT);

        Phaser.Actions.AddMaskShape(this.creditsScrollContainer, {
            shape: 'rectangle',
            region: new Phaser.Geom.Rectangle(0, CREDIT_SCROLL_TOP, this.scale.width, CREDIT_SCROLL_HEIGHT),
        });

        this.cursorKeys = this.input.keyboard?.createCursorKeys();
        this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
            this.scrollCredits(deltaY * CREDIT_MOUSE_WHEEL_SCROLL_SPEED);
        });
    }

    private scrollCredits (amount: number)
    {
        if (!this.creditsScrollContainer) {
            return;
        }

        this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset + amount, 0, this.maxScrollOffset);
        this.creditsScrollContainer.y = CREDIT_SCROLL_TOP - this.scrollOffset;
    }
}
