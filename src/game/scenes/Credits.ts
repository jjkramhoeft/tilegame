import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { ASSET_KEYS } from '../common/assets';
import { getText } from '../common/texts';
import { SCENE_KEYS } from './scene-keys';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { ScrollableTextPanel } from '../common/scrollable-text-panel';

const COLORS = {
    title: '#5eb1da',
    titleStroke: '#000000',
    uiText: '#93c9e4',
    uiTextBorder: '#000000',
};

const CREDIT_SCROLL_TOP = 220;
const CREDIT_SCROLL_BOTTOM = 700;
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
    private creditsScrollPanel?: ScrollableTextPanel;
    private controls?: KeyboardComponent;
    #uiSelectSound!: Phaser.Sound.BaseSound;

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
        this.#uiSelectSound = this.sound.add('Blip_Select7');

        this.registry.set('musicVolume', musicVolume);

        this.creditsMusic = this.sound.add('creditsMusic', {
            loop: true,
            volume: musicVolume
        });
        this.creditsMusic.play();

        this.add.image(centerX, centerY, 'credit-bg');
        this.add.image(centerX+180, 120, 'logo').setDepth(100).setScale(2);;

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
            this.#uiSelectSound.play();
            this.returnToIntro();
        });

        if (this.input.keyboard) {
            this.controls = new KeyboardComponent(this.input.keyboard);
        } else {
            console.warn('[Credits] keyboard plugin is not setup properly');
        }

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.creditsScrollPanel?.destroy();
            this.creditsScrollPanel = undefined;
            this.creditsMusic?.stop();
            this.creditsMusic?.destroy();
            this.creditsMusic = undefined;
        });
    }

    update (_time: number, delta: number)
    {
        if (this.controls && (this.controls.isActionKeyJustDown)) {         
            this.#uiSelectSound.play();
            this.returnToIntro();
            return;
        }

        this.creditsScrollPanel?.update(delta);
    }

    private returnToIntro ()
    {
        this.creditsMusic?.stop();
        this.scene.start(SCENE_KEYS.INTRO);
    }

    private createScrollableCreditsText ()
    {
        this.creditsScrollPanel = new ScrollableTextPanel(this, {
            top: CREDIT_SCROLL_TOP,
            bottom: CREDIT_SCROLL_BOTTOM,
            textX: CREDIT_TEXT_X,
            textSpacing: CREDIT_TEXT_SPACING,
            keyboardScrollSpeed: CREDIT_KEYBOARD_SCROLL_SPEED,
            wheelScrollSpeed: CREDIT_MOUSE_WHEEL_SCROLL_SPEED,
            depth: 50,
            entries: CREDIT_TEXTS.map((creditText) => ({
                text: getText(creditText.textKey),
                width: creditText.width,
                style: {
                fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 32, color: COLORS.title,
                stroke: COLORS.titleStroke, strokeThickness: 6,
                align: 'left',
                lineSpacing: 4,
                },
            })),
        });
    }
}
