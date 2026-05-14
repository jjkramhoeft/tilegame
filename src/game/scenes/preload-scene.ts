import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, ASSET_PACK_KEYS } from '../common/assets';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    public preload(): void {
        // load asset pack that has assets for the rest of the game
        this.load.pack(ASSET_PACK_KEYS.MAIN, 'assets/data/assets.json');

        this.load.image('tile-base', 'assets/tile-base.png');
    }

    public create(): void {

        this.#createAnimations();

        this.scene.start(SCENE_KEYS.INTRO);
    }

    #createAnimations(): void {
        this.anims.create({
            key: "JJK_LOOSE_FULL_HEART",
            frames: this.anims.generateFrameNumbers('hearts16', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: 2
        }); this.anims.create({
            key: "JJK_LOOSE_FIRST_HALF",
            frames: this.anims.generateFrameNumbers('hearts16', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: 2
        });
        this.anims.create({
            key: "JJK_LOOSE_SECOND_HALF",
            frames: this.anims.generateFrameNumbers('hearts16', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: 2
        });

        this.anims.create({
            key: "JJK_LOOSE_FULL_POWER",
            frames: this.anims.generateFrameNumbers('power16', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: 2
        }); this.anims.create({
            key: "JJK_LOOSE_FIRST_HALF_POWER",
            frames: this.anims.generateFrameNumbers('power16', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: 2
        });
        this.anims.create({
            key: "JJK_LOOSE_SECOND_HALF_POWER",
            frames: this.anims.generateFrameNumbers('power16', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: 2
        });

        this.anims.create({
            key: "JJK_LOOSE_FULL_PROGRESS",
            frames: this.anims.generateFrameNumbers('progress16', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: 2
        }); this.anims.create({
            key: "JJK_LOOSE_FIRST_HALF_PROGRESS",
            frames: this.anims.generateFrameNumbers('progress16', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: 2
        });
        this.anims.create({
            key: "JJK_LOOSE_SECOND_HALF_PROGRESS",
            frames: this.anims.generateFrameNumbers('progress16', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: 2
        });

        const WATER_ANIM_KEY = 'water-flow';
        this.anims.create({
            key: WATER_ANIM_KEY,
            frames: this.anims.generateFrameNumbers('tile-animated', { start: 8, end: 15 }),
            frameRate: 8,
            repeat: -1
        });
        const LAVA_ANIM_KEY = 'lava-flow';
        this.anims.create({
            key: LAVA_ANIM_KEY,
            frames: this.anims.generateFrameNumbers('tile-animated', { start: 40, end: 47 }),
            frameRate: 8,
            repeat: -1
        });
        const CRYSTAL_ANIM_KEY = 'crystal-flow';
        this.anims.create({
            key: CRYSTAL_ANIM_KEY,
            frames: this.anims.generateFrameNumbers('tile-animated', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        const VOID_ANIM_KEY = 'void-marker-flow';
        this.anims.create({
            key: VOID_ANIM_KEY,
            frames: this.anims.generateFrameNumbers('tile-animated', { start: 24, end: 31 }),
            frameRate: 8,
            repeat: -1
        });
        const VOID_BORDER_ANIM_KEY = 'void-border-flow';
        this.anims.create({
            key: VOID_BORDER_ANIM_KEY,
            frames: this.anims.generateFrameNumbers('tile-animated', { start: 32, end: 39 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.createFromAseprite(ASSET_KEYS.HUD_NUMBERS);
        this.anims.createFromAseprite(ASSET_KEYS.PLAYER);
        this.anims.createFromAseprite(ASSET_KEYS.SPIDER);
        this.anims.createFromAseprite(ASSET_KEYS.WISP);
        this.anims.create({
            key: ASSET_KEYS.ENEMY_DEATH,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.ENEMY_DEATH),
            frameRate: 6,
            repeat: 0,
            delay: 0,
        });
        this.anims.create({
            key: ASSET_KEYS.DAGGER,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.DAGGER),
            frameRate: 16,
            repeat: -1,
            delay: 0,
        });

        const anims = this.anims;
        const sexes = ['male', 'female'];
        const gears = ['nude', 'bare', 'basic', 'armor'];
        const weapons = ['none', 'dagger', 'staff', 'sword'];
        // Create basic directional walk animations (8 frames per row)
        // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right  
        sexes.forEach(sex => {
            gears.forEach(gear => {
                weapons.forEach(weapon => {
                    anims.create({ key: `${sex}-${gear}-${weapon}-walk-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-walk-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 9, end: 17 }), frameRate: 10, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-walk-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 18, end: 26 }), frameRate: 10, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-walk-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 27, end: 35 }), frameRate: 10, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-swim-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-swim-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 9, end: 17 }), frameRate: 10, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-swim-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 18, end: 26 }), frameRate: 10, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-swim-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 27, end: 35 }), frameRate: 10, repeat: -1 });
                });
            });
        });

        // Create basic directional attack animations (6 frames per row)
        // Sprite sheet layout: row 0 = up, row 1 = left, row 2 = down, row 3 = right
        sexes.forEach(sex => {
            gears.forEach(gear => {
                const weapons = ['none', 'dagger', 'staff'];
                weapons.forEach(weapon => {
                    anims.create({ key: `${sex}-${gear}-${weapon}-thrust-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 0, end: 7 }), frameRate: 14, repeat: 1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-thrust-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 8, end: 15 }), frameRate: 14, repeat: 1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-thrust-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 16, end: 23 }), frameRate: 14, repeat: 1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-thrust-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 24, end: 31 }), frameRate: 14, repeat: 1 });
                });
                let weapon = 'sword';
                anims.create({ key: `${sex}-${gear}-${weapon}-thrust-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust128`, { start: 0, end: 5 }), frameRate: 14, repeat: 1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-thrust-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust128`, { start: 6, end: 11 }), frameRate: 14, repeat: 1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-thrust-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust128`, { start: 12, end: 17 }), frameRate: 14, repeat: 1 });
                anims.create({ key: `${sex}-${gear}-${weapon}-thrust-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust128`, { start: 18, end: 23 }), frameRate: 14, repeat: 1 });
            });
        });

        // Idle = Two frames for each direction
        // Die = All six frames of hurt animation, played once
        // Fall = Last three frames of hurt animation, played as loop
        sexes.forEach(sex => {
            gears.forEach(gear => {
                weapons.forEach(weapon => {
                    anims.create({ key: `${sex}-${gear}-${weapon}-idle-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 0, end: 1 }), frameRate: 2, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-idle-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 2, end: 3 }), frameRate: 2, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-idle-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 4, end: 5 }), frameRate: 2, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-idle-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 6, end: 7 }), frameRate: 2, repeat: -1 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-die`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-hurt`, { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
                    anims.create({ key: `${sex}-${gear}-${weapon}-hurt`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-hurt`, { start: 0, end: 5 }), frameRate: 12, repeat: 0, yoyo: true });
                    anims.create({ key: `${sex}-${gear}-${weapon}-fall`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-fall`, { start: 0, end: 3 }), frameRate: 13, repeat: 10 });
                });
            });
        });

        anims.create({ key: 'spell-music-anim', frames: anims.generateFrameNumbers('spell-music-11_grayscale', { start: 0, end: 10 }), frameRate: 9, repeat: 0 });

        //Critter animations (currently only Lamb and Chicken)
        //Lamb sprite sheet layout: row 0 = down, row 1 = up, row 2 = left, row 3 = right. Each row has 6 frames for walking, followed by rows with 4 frames for idle.
        anims.create({ key: 'lamb-walk-up', frames: anims.generateFrameNumbers('Lamb', { start: 6, end: 11 }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'lamb-walk-left', frames: anims.generateFrameNumbers('Lamb', { start: 12, end: 17 }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'lamb-walk-down', frames: anims.generateFrameNumbers('Lamb', { start: 0, end: 5 }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'lamb-walk-right', frames: anims.generateFrameNumbers('Lamb', { start: 18, end: 23 }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'lamb-idle-up', frames: anims.generateFrameNumbers('Lamb', { start: 6, end: 9 }), frameRate: 4, repeat: -1 });
        anims.create({ key: 'lamb-idle-left', frames: anims.generateFrameNumbers('Lamb', { start: 12, end: 15 }), frameRate: 4, repeat: -1 });
        anims.create({ key: 'lamb-idle-down', frames: anims.generateFrameNumbers('Lamb', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
        anims.create({ key: 'lamb-idle-right', frames: anims.generateFrameNumbers('Lamb', { start: 18, end: 21 }), frameRate: 4, repeat: -1 });
        
        //Chicken sprite sheet layout: row 0 = down, row 1 = up, row 2 = left, row 3 = right. Each row has 6 frames for walking, followed by rows with 4 frames for idle.
        anims.create({ key: 'chicken-walk-up', frames: anims.generateFrameNumbers('Chicken', { start: 6, end: 11 }), frameRate: 10, repeat: -1 });
        anims.create({ key: 'chicken-walk-left', frames: anims.generateFrameNumbers('Chicken', { start: 12, end: 17 }), frameRate: 10, repeat: -1 });
        anims.create({ key: 'chicken-walk-down', frames: anims.generateFrameNumbers('Chicken', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        anims.create({ key: 'chicken-walk-right', frames: anims.generateFrameNumbers('Chicken', { start: 18, end: 23 }), frameRate: 10, repeat: -1 });
        anims.create({ key: 'chicken-idle-up', frames: anims.generateFrameNumbers('Chicken', { start: 6, end: 9 }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'chicken-idle-left', frames: anims.generateFrameNumbers('Chicken', { start: 12, end: 15 }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'chicken-idle-down', frames: anims.generateFrameNumbers('Chicken', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'chicken-idle-right', frames: anims.generateFrameNumbers('Chicken', { start: 18, end: 21 }), frameRate: 6, repeat: -1 });
    }
}
