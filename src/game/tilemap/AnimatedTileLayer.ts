import Phaser from 'phaser';
import {
    TILE_SIZE,
    WATER_ANIM_KEY,
    LAVA_ANIM_KEY,
    ANIMATED_TILE_OVERRIDES,
} from './TileConfig';

const WATER_SPRITESHEET_KEY = 'water';

export class AnimatedTileLayer
{
    static preload (scene: Phaser.Scene): void
    {
        scene.load.spritesheet(WATER_SPRITESHEET_KEY, 'Water64.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });
    }

    static create (scene: Phaser.Scene, mapData: number[][]): void
    {
        AnimatedTileLayer.registerAnims(scene);
        AnimatedTileLayer.placeSprites(scene, mapData);
    }

    private static registerAnims (scene: Phaser.Scene): void
    {
        if (!scene.anims.exists(WATER_ANIM_KEY)) {
            scene.anims.create({
                key: WATER_ANIM_KEY,
                frames: scene.anims.generateFrameNumbers(WATER_SPRITESHEET_KEY, { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!scene.anims.exists(LAVA_ANIM_KEY)) {
            scene.anims.create({
                key: LAVA_ANIM_KEY,
                frames: scene.anims.generateFrameNumbers(WATER_SPRITESHEET_KEY, { start: 32, end: 39 }),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    private static placeSprites (scene: Phaser.Scene, mapData: number[][]): void
    {
        for (let y = 0; y < mapData.length; y++) {
            for (let x = 0; x < mapData[y].length; x++) {
                const tileIndex = mapData[y][x];
                const animKey = ANIMATED_TILE_OVERRIDES[tileIndex];

                if (!animKey) {
                    continue;
                }

                scene.add
                    .sprite(x * TILE_SIZE, y * TILE_SIZE, WATER_SPRITESHEET_KEY)
                    .setOrigin(0, 0)
                    .play(animKey);
            }
        }
    }
}
