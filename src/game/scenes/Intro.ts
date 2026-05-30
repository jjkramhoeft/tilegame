import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import {
    ASSET_KEYS,
    BULL_ANIMATION_KEYS,
    PIGLET_ANIMATION_KEYS,
    CHICKEN_ANIMATION_KEYS,
    SHEEP_ANIMATION_KEYS,
    LAMB_ANIMATION_KEYS,
    TURKEY_ANIMATION_KEYS,
} from '../common/assets';
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
const INTRO_ANIMAL_SPAWN_DELAY_MS = 8_000;
const INTRO_ANIMAL_MIN_TURN_DELAY_MS = 2_000;
const INTRO_ANIMAL_MAX_TURN_DELAY_MS = 8_000;
const INTRO_ANIMAL_MIN_REVERSE_DURATION_MS = 500;
const INTRO_ANIMAL_MAX_REVERSE_DURATION_MS = 1_500;
const INTRO_ANIMAL_Y_VALUES = [260, 540];
const INTRO_ANIMAL_DEPTH = [5, 25];
const INTRO_ANIMAL_OFFSCREEN_PADDING = 80;
const INTRO_ANIMAL_SCALE = 2.5;

type IntroAnimalConfig = {
    assetKey: string;
    walkLeft: string;
    walkRight: string;
    speed: number;
};

type IntroAnimalDirection = 'left' | 'right';

type MenuItem = {
    text: Phaser.GameObjects.Text;
    y: number;
    onSelect: () => void;
};

const INTRO_ANIMALS: IntroAnimalConfig[] = [
    {
        assetKey: ASSET_KEYS.LAMB,
        walkLeft: LAMB_ANIMATION_KEYS.WALK_LEFT,
        walkRight: LAMB_ANIMATION_KEYS.WALK_RIGHT,
        speed: 60
    }, {
        assetKey: ASSET_KEYS.SHEEP,
        walkLeft: SHEEP_ANIMATION_KEYS.WALK_LEFT,
        walkRight: SHEEP_ANIMATION_KEYS.WALK_RIGHT,
        speed: 70
    },
    {
        assetKey: ASSET_KEYS.BULL,
        walkLeft: BULL_ANIMATION_KEYS.WALK_LEFT,
        walkRight: BULL_ANIMATION_KEYS.WALK_RIGHT,
        speed: 80
    },
    {
        assetKey: ASSET_KEYS.TURKEY,
        walkLeft: TURKEY_ANIMATION_KEYS.WALK_LEFT,
        walkRight: TURKEY_ANIMATION_KEYS.WALK_RIGHT,
        speed: 60
    },
    {
        assetKey: ASSET_KEYS.PIGLET,
        walkLeft: PIGLET_ANIMATION_KEYS.WALK_LEFT,
        walkRight: PIGLET_ANIMATION_KEYS.WALK_RIGHT,
        speed: 70
    },
    {
        assetKey: ASSET_KEYS.CHICKEN,
        walkLeft: CHICKEN_ANIMATION_KEYS.WALK_LEFT,
        walkRight: CHICKEN_ANIMATION_KEYS.WALK_RIGHT,
        speed: 80
    },
];

export class Intro extends Scene {
    exit_text: Phaser.GameObjects.Text;
    introMusic?: Phaser.Sound.BaseSound;
    private menuItems: MenuItem[] = [];
    private selectedMenuIndex = 0;
    private cursor!: Phaser.GameObjects.Image;
    private cursorOutline!: Phaser.GameObjects.Image;
    private controls?: KeyboardComponent;
    private animalSpawnEvent?: Phaser.Time.TimerEvent;
    private backgroundAnimals: Phaser.GameObjects.Sprite[] = [];

    #uiDownSound!: Phaser.Sound.BaseSound;
    #uiUpSound!: Phaser.Sound.BaseSound;
    #uiSelectSound!: Phaser.Sound.BaseSound;

    constructor() {
        super('intro');
    }

    create() {
        this.menuItems = [];
        this.selectedMenuIndex = 0;

        this.#uiDownSound = this.sound.add('menu_006');
        this.#uiUpSound = this.sound.add('menu_024');
        this.#uiSelectSound = this.sound.add('Blip_Select7');

        let musicVolume = this.registry.get('musicVolume');
        if (typeof musicVolume !== 'number') {
            this.registry.set('musicVolume', 0.05);
            musicVolume = 0.05
        }

        this.add.image(512, 384, ASSET_KEYS.INTRO_BACKGROUND).setDepth(0);
        this.add.image(512, 384, ASSET_KEYS.INTRO_BACKGROUND_LAYER_2).setDepth(10);
        this.add.image(512, 384, ASSET_KEYS.INTRO_BACKGROUND_LAYER_1).setDepth(20);
        this.add.image(512, 384, ASSET_KEYS.INTRO_BACKGROUND_LAYER_0).setDepth(30);
        this.add.image(512, 150, ASSET_KEYS.LOGO).setDepth(100).setScale(2.5);
        this.startBackgroundAnimalSpawning();

        this.introMusic = this.sound.add('introMusic', {
            loop: true,
            volume: musicVolume
        });
        this.introMusic.play();

        this.add.text(512, 415, getText('intro.title'), {
            fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX, fontSize: 38, color: COLORS.title,
            stroke: COLORS.titleStroke, strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.exit_text = this.createMenuText(550, getText('intro.newGame'), () => {
            this.introMusic?.stop();
            this.#uiSelectSound.play();
            this.scene.stop(SCENE_KEYS.UI_SCENE);
            this.scene.stop(SCENE_KEYS.GAME_SCENE);
            this.scene.start(SCENE_KEYS.GAME_SCENE);
        });

        this.createMenuText(600, getText('intro.settings'), () => {
            this.introMusic?.stop();         
            this.#uiSelectSound.play();
            this.scene.start(SCENE_KEYS.SETTINGS);
        });

        this.createMenuText(650, getText('intro.credits'), () => {
            this.introMusic?.stop();         
            this.#uiSelectSound.play();
            this.scene.start(SCENE_KEYS.CREDITS);
        });

        this.createMenuText(700, getText('intro.reflection'), () => {
            this.introMusic?.stop();                     
            this.#uiSelectSound.play();
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
            this.cleanupBackgroundAnimals();
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
            this.#uiUpSound.play();
            return;
        }

        if (this.controls.isDownJustDown) {
            this.selectedMenuIndex = Phaser.Math.Clamp(this.selectedMenuIndex + 1, 0, this.menuItems.length - 1);
            this.updateCursorPosition();
            this.#uiDownSound.play();
            return;
        }

        if (this.controls.isActionKeyJustDown) {
            if (!this.#uiSelectSound.isPlaying) {
                this.#uiSelectSound.play();
            }
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
        text.setDepth(100);
        this.menuItems.push({ text, y, onSelect });
        return text;
    }

    private startBackgroundAnimalSpawning(): void {
        this.animalSpawnEvent?.destroy();
        this.animalSpawnEvent = this.time.addEvent({
            delay: INTRO_ANIMAL_SPAWN_DELAY_MS,
            callback: this.spawnBackgroundAnimal,
            callbackScope: this,
            loop: true,
        });
    }

    private spawnBackgroundAnimal(): void {
        const lane = Phaser.Utils.Array.GetRandom([0,1]);// 0 is top lane, 1 is bottom lane
        const animalIndex = lane*3 + Phaser.Math.Between(0, 2);
        const animal = INTRO_ANIMALS[animalIndex];
        let y = INTRO_ANIMAL_Y_VALUES[lane];
        let depthAdd =0;
        if(lane==1){

            const variance =Phaser.Utils.Array.GetRandom([0,1,2,3]);
            y -= variance*5;
            depthAdd = -variance;
        }
        const direction: IntroAnimalDirection = Phaser.Math.Between(0, 1) === 0 ? 'right' : 'left';
        const screenWidth = this.scale.width;
        const startX = direction === 'right' ? -INTRO_ANIMAL_OFFSCREEN_PADDING : screenWidth + INTRO_ANIMAL_OFFSCREEN_PADDING;
        const animalSprite = this.add.sprite(startX, y, animal.assetKey, 0)
            .setDepth(INTRO_ANIMAL_DEPTH[lane] + depthAdd)
            .setScale(INTRO_ANIMAL_SCALE);
        if(lane==0){
            animalSprite.setTint(0x333333)
            .setTintMode(Phaser.TintModes.ADD);;
        }
        this.backgroundAnimals.push(animalSprite);
        animalSprite.play(direction === 'right' ? animal.walkRight : animal.walkLeft);
        this.moveBackgroundAnimal(animalSprite, animal, direction);
    }

    private moveBackgroundAnimal(
        animalSprite: Phaser.GameObjects.Sprite,
        animal: IntroAnimalConfig,
        direction: IntroAnimalDirection,
    ): void {
        const screenWidth = this.scale.width;
        const endX = direction === 'right' ? screenWidth + INTRO_ANIMAL_OFFSCREEN_PADDING : -INTRO_ANIMAL_OFFSCREEN_PADDING;
        const totalDistance = Math.abs(endX - animalSprite.x);
        const totalDuration = totalDistance / animal.speed * 1000;
        const turnDelay = Phaser.Math.Between(INTRO_ANIMAL_MIN_TURN_DELAY_MS, INTRO_ANIMAL_MAX_TURN_DELAY_MS);
        const firstMoveDuration = Math.min(turnDelay, Math.max(totalDuration - 1000, 1000));
        const travelProgress = firstMoveDuration / totalDuration;
        const turnX = Phaser.Math.Linear(animalSprite.x, endX, travelProgress);

        this.tweens.add({
            targets: animalSprite,
            x: turnX,
            duration: firstMoveDuration,
            ease: 'Linear',
            onComplete: () => {
                if (!animalSprite.active) {
                    return;
                }
                this.moveBackgroundAnimalBack(animalSprite, animal, direction, endX);
            },
        });
    }

    private moveBackgroundAnimalBack(
        animalSprite: Phaser.GameObjects.Sprite,
        animal: IntroAnimalConfig,
        direction: IntroAnimalDirection,
        endX: number,
    ): void {
        const reverseDuration = Phaser.Math.Between(
            INTRO_ANIMAL_MIN_REVERSE_DURATION_MS,
            INTRO_ANIMAL_MAX_REVERSE_DURATION_MS,
        );
        const reverseDistance = animal.speed * reverseDuration / 1000;
        const reverseX = direction === 'right'
            ? animalSprite.x - reverseDistance
            : animalSprite.x + reverseDistance;

        animalSprite.play(direction === 'right' ? animal.walkLeft : animal.walkRight);
        this.tweens.add({
            targets: animalSprite,
            x: reverseX,
            duration: reverseDuration,
            ease: 'Linear',
            onComplete: () => this.moveBackgroundAnimalOut(animalSprite, animal, direction, endX),
        });
    }

    private moveBackgroundAnimalOut(
        animalSprite: Phaser.GameObjects.Sprite,
        animal: IntroAnimalConfig,
        direction: IntroAnimalDirection,
        endX: number,
    ): void {
        if (!animalSprite.active) {
            return;
        }

        animalSprite.play(direction === 'right' ? animal.walkRight : animal.walkLeft);
        this.tweens.add({
            targets: animalSprite,
            x: endX,
            duration: Math.abs(endX - animalSprite.x) / animal.speed * 1000,
            ease: 'Linear',
            onComplete: () => this.destroyBackgroundAnimal(animalSprite),
        });
    }

    private destroyBackgroundAnimal(animalSprite: Phaser.GameObjects.Sprite): void {
        this.backgroundAnimals = this.backgroundAnimals.filter((backgroundAnimal) => backgroundAnimal !== animalSprite);
        animalSprite.destroy();
    }

    private cleanupBackgroundAnimals(): void {
        this.animalSpawnEvent?.destroy();
        this.animalSpawnEvent = undefined;
        this.backgroundAnimals.forEach((backgroundAnimal) => {
            this.tweens.killTweensOf(backgroundAnimal);
            backgroundAnimal.destroy();
        });
        this.backgroundAnimals = [];
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
