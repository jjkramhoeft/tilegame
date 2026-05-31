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
    heading: '#5eb1da',
    body: '#93c9e4',
    textStroke: '#000000',
};

const REFLECTION_SCROLL_TOP = 180;
const REFLECTION_SCROLL_BOTTOM = 710;
const REFLECTION_TEXT_X = 60;
const REFLECTION_TEXT_SPACING = 18;
const REFLECTION_HEADING_TOP_SPACING = 24;
const REFLECTION_KEYBOARD_SCROLL_SPEED = 420;
const REFLECTION_MOUSE_WHEEL_SCROLL_SPEED = 0.7;
const REFLECTION_MUSIC_PAUSE_MS = 3000;
const REFLECTION_CLOUD_DEPTH = 25;
const REFLECTION_CLOUD_MIN_Y = 0;
const REFLECTION_CLOUD_MAX_Y = 200;
const REFLECTION_CLOUD_SPAWN_DELAY_MS = 1500;
const REFLECTION_INITIAL_CLOUD_COUNT = 10;
const REFLECTION_MAX_ACTIVE_CLOUDS = 18;
const REFLECTION_CLOUD_OFFSCREEN_PADDING = 180;
const REFLECTION_CLOUD_MIN_SPEED = 10;
const REFLECTION_CLOUD_MAX_SPEED = 35;
const REFLECTION_CLOUD_MIN_ALPHA = 0.7;
const REFLECTION_CLOUD_MAX_ALPHA = 0.9;
const REFLECTION_CLOUD_MIN_SCALE = 0.9;
const REFLECTION_CLOUD_MAX_SCALE = 1.15;

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

const REFLECTION_MUSIC_KEYS = [
    ASSET_KEYS.REFLECTION_MUSIC_1,
    ASSET_KEYS.REFLECTION_MUSIC_2,
    ASSET_KEYS.REFLECTION_MUSIC_3,
];

const REFLECTION_CLOUD_KEYS = [
    ASSET_KEYS.CLOUD_SHAPE2_1,
    ASSET_KEYS.CLOUD_SHAPE2_2,
    ASSET_KEYS.CLOUD_SHAPE2_3,
    ASSET_KEYS.CLOUD_SHAPE2_4,
    ASSET_KEYS.CLOUD_SHAPE2_5,
    ASSET_KEYS.CLOUD_SHAPE3_1,
    ASSET_KEYS.CLOUD_SHAPE3_2,
    ASSET_KEYS.CLOUD_SHAPE3_3,
    ASSET_KEYS.CLOUD_SHAPE3_4,
    ASSET_KEYS.CLOUD_SHAPE3_5,
];

export class Reflection extends Scene {
    reflectionMusic?: Phaser.Sound.BaseSound;
    private reflectionMusicIndex = 0;
    private reflectionMusicPauseEvent?: Phaser.Time.TimerEvent;
    private reflectionScrollPanel?: ScrollableTextPanel;
    private controls?: KeyboardComponent;
    private backgroundClouds: Phaser.GameObjects.Image[] = [];
    private cloudSpawnEvent?: Phaser.Time.TimerEvent;
    #uiSelectSound!: Phaser.Sound.BaseSound;

    constructor() {
        super('reflection');
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const registryVolume = this.registry.get('musicVolume');
        const musicVolume = typeof registryVolume === 'number' ? registryVolume : 0.1;
        this.#uiSelectSound = this.sound.add(ASSET_KEYS.BLIP_SELECT_7);

        this.registry.set('musicVolume', musicVolume);

        this.reflectionMusicIndex = 0;
        this.playNextReflectionMusic();

        this.add.image(0, 0, ASSET_KEYS.CREDITS_BACKGROUND).setOrigin(0).setDisplaySize(this.scale.width, this.scale.height).setDepth(0);
        this.add.image(0, 0, ASSET_KEYS.CREDITS_BACKGROUND_LAYER_1).setOrigin(0).setDisplaySize(this.scale.width, this.scale.height).setDepth(40);
        this.createBackgroundClouds();
        this.add.image(centerX + 355, 95, ASSET_KEYS.LOGO).setDepth(100).setScale(1.5);

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
        exit_text.setDepth(100);
        exit_text.setOrigin(1);
        exit_text.setInteractive({ useHandCursor: true });
        exit_text.on('pointerdown', () => {
            this.#uiSelectSound.play();
            this.returnToIntro();
        });

        if (this.input.keyboard) {
            this.controls = new KeyboardComponent(this.input.keyboard);
        } else {
            console.warn('[Reflection] keyboard plugin is not setup properly');
        }

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.reflectionScrollPanel?.destroy();
            this.reflectionScrollPanel = undefined;
            this.clearBackgroundClouds();
            this.clearReflectionMusicPauseEvent();
            this.reflectionMusic?.stop();
            this.reflectionMusic?.destroy();
            this.reflectionMusic = undefined;
        });
    }

    update(_time: number, delta: number) {
        if (this.controls && (this.controls.isActionKeyJustDown)) {
            this.#uiSelectSound.play();
            this.returnToIntro();
            return;
        }

        this.reflectionScrollPanel?.update(delta);
    }

    private returnToIntro() {
        this.clearReflectionMusicPauseEvent();
        this.reflectionMusic?.stop();
        this.scene.start(SCENE_KEYS.INTRO);
    }

    private clearReflectionMusicPauseEvent() {
        this.reflectionMusicPauseEvent?.remove(false);
        this.reflectionMusicPauseEvent = undefined;
    }

    private playNextReflectionMusic() {
        this.clearReflectionMusicPauseEvent();
        this.reflectionMusic?.stop();
        this.reflectionMusic?.destroy();

        const key = REFLECTION_MUSIC_KEYS[this.reflectionMusicIndex % REFLECTION_MUSIC_KEYS.length];
        this.reflectionMusicIndex += 1;

        const registryVolume = this.registry.get('musicVolume');
        const musicVolume = typeof registryVolume === 'number' ? registryVolume : 0.1;

        this.reflectionMusic = this.sound.add(key, { loop: false, volume: musicVolume });
        this.reflectionMusic.once(Phaser.Sound.Events.COMPLETE, () => {
            this.clearReflectionMusicPauseEvent();
            this.reflectionMusicPauseEvent = this.time.delayedCall(REFLECTION_MUSIC_PAUSE_MS, () => {
                this.reflectionMusicPauseEvent = undefined;
                this.playNextReflectionMusic();
            });
        });
        this.reflectionMusic.play();
    }

    private createBackgroundClouds() {
        this.clearBackgroundClouds();

        for (let index = 0; index < REFLECTION_INITIAL_CLOUD_COUNT; index += 1) {
            this.spawnCloud(Phaser.Math.Between(-REFLECTION_CLOUD_OFFSCREEN_PADDING, this.scale.width));
        }

        this.cloudSpawnEvent = this.time.addEvent({
            delay: REFLECTION_CLOUD_SPAWN_DELAY_MS,
            callback: () => this.spawnCloud(),
            loop: true,
        });
    }

    private spawnCloud(initialX = -REFLECTION_CLOUD_OFFSCREEN_PADDING) {
        if (this.backgroundClouds.length >= REFLECTION_MAX_ACTIVE_CLOUDS) {
            return;
        }

        const cloudKey = Phaser.Utils.Array.GetRandom(REFLECTION_CLOUD_KEYS);
        const cloud = this.add.image(initialX, Phaser.Math.Between(REFLECTION_CLOUD_MIN_Y, REFLECTION_CLOUD_MAX_Y), cloudKey)
            .setDepth(REFLECTION_CLOUD_DEPTH)
            .setAlpha(Phaser.Math.FloatBetween(REFLECTION_CLOUD_MIN_ALPHA, REFLECTION_CLOUD_MAX_ALPHA))
            .setScale(Phaser.Math.FloatBetween(REFLECTION_CLOUD_MIN_SCALE, REFLECTION_CLOUD_MAX_SCALE))
            .setTint(0x111).setTintMode(Phaser.TintModes.ADD);
        const targetX = this.scale.width + REFLECTION_CLOUD_OFFSCREEN_PADDING;
        const speed = Phaser.Math.Between(REFLECTION_CLOUD_MIN_SPEED, REFLECTION_CLOUD_MAX_SPEED);
        const duration = ((targetX - initialX) / speed) * 1000;

        this.backgroundClouds.push(cloud);
        this.tweens.add({
            targets: cloud,
            x: targetX,
            duration,
            ease: 'Linear',
            onComplete: () => this.destroyCloud(cloud),
        });
    }

    private destroyCloud(cloud: Phaser.GameObjects.Image) {
        this.backgroundClouds = this.backgroundClouds.filter((backgroundCloud) => backgroundCloud !== cloud);
        this.tweens.killTweensOf(cloud);
        cloud.destroy();
    }

    private clearBackgroundClouds() {
        this.cloudSpawnEvent?.remove(false);
        this.cloudSpawnEvent = undefined;
        [...this.backgroundClouds].forEach((cloud) => this.destroyCloud(cloud));
        this.backgroundClouds = [];
    }

    private createScrollableReflectionText() {
        this.reflectionScrollPanel = new ScrollableTextPanel(this, {
            top: REFLECTION_SCROLL_TOP,
            bottom: REFLECTION_SCROLL_BOTTOM,
            textX: REFLECTION_TEXT_X,
            textSpacing: REFLECTION_TEXT_SPACING,
            keyboardScrollSpeed: REFLECTION_KEYBOARD_SCROLL_SPEED,
            wheelScrollSpeed: REFLECTION_MOUSE_WHEEL_SCROLL_SPEED,
            depth: 50,
            entries: REFLECTION_TEXTS.map((reflectionText, index) => ({
                text: getText(reflectionText.textKey),
                width: reflectionText.width,
                topSpacing: reflectionText.isHeading && index > 0 ? REFLECTION_HEADING_TOP_SPACING : 0,
                style: {
                    fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX,
                    fontSize: reflectionText.isHeading ? 38 : 28,
                    color: reflectionText.isHeading ? COLORS.heading : COLORS.body,
                    stroke: COLORS.textStroke,
                    strokeThickness: reflectionText.isHeading ? 6 : 5,
                    align: 'left',
                    lineSpacing: 4,
                },
            })),
        });
    }
}
