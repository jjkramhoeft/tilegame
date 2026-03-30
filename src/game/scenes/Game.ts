import { Scene } from 'phaser';

const TILE_SIZE = 64;
const WATER_TILE_INDEX = 5;
const LAVA_TILE_INDEX = 9;
const WATER_ANIM_KEY = 'water-flow';
const LAVA_ANIM_KEY = 'lava-flow';

const MAP_DATA: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 9, 9, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 5, 5, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3, 3, 3, 4, 4, 0],
    [0, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3, 3, 3, 4, 4, 0],
    [0, 6, 6, 6, 6, 1, 1, 1, 1, 3, 3, 3, 3, 0, 0, 0],
    [0, 6, 6, 6, 6, 1, 1, 1, 1, 3, 3, 3, 3, 0, 0, 0],
    [0, 6, 6, 6, 6, 6, 4, 4, 4, 3, 3, 3, 3, 0, 0, 0],
    [0,10,10, 1, 1, 4, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0],
    [0,10,10, 1, 1, 4, 4, 4, 4, 4, 7, 7, 7, 0, 0, 0],
    [0,10,10, 1, 1, 4, 4, 4, 4, 4, 7, 7, 7, 0, 0, 0],
    [0, 9, 9, 1, 1, 4, 4, 4, 4, 4, 7, 7, 7, 0, 0, 0],
    [0, 9, 9, 1, 1, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.spritesheet('tiles', 'tiles.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });
        this.load.spritesheet('water', 'Water64.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });
       
    }

    create ()
    {
        const baseLayerData = MAP_DATA.map((row) => row.map((tile) => {
            if (tile === WATER_TILE_INDEX || tile === LAVA_TILE_INDEX) {
                return -1;
            }

            return tile;
        }));

        const map = this.make.tilemap({
            data: baseLayerData,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE
        });

        const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0);

        if (!tileset) {
            throw new Error('Failed to create tileset from assets/tiles.png');
        }

        map.createLayer(0, tileset, 0, 0);
        this.createAnimatedTileAnims();
        this.createAnimatedTiles();

        this.cameras.main.setBounds(0, 0, 16 * TILE_SIZE, 16 * TILE_SIZE);
    }

    private createAnimatedTileAnims (): void
    {
        if (!this.anims.exists(WATER_ANIM_KEY)) {
            this.anims.create({
                key: WATER_ANIM_KEY,
                frames: this.anims.generateFrameNumbers('water', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists(LAVA_ANIM_KEY)) {
            this.anims.create({
                key: LAVA_ANIM_KEY,
                frames: this.anims.generateFrameNumbers('water', { start: 32, end: 39 }),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    private createAnimatedTiles (): void
    {
        for (let y = 0; y < MAP_DATA.length; y++) {
            for (let x = 0; x < MAP_DATA[y].length; x++) {
                const tile = MAP_DATA[y][x];

                if (tile !== WATER_TILE_INDEX && tile !== LAVA_TILE_INDEX) {
                    continue;
                }

                const animKey = tile === WATER_TILE_INDEX ? WATER_ANIM_KEY : LAVA_ANIM_KEY;

                this.add
                    .sprite(x * TILE_SIZE, y * TILE_SIZE, 'water')
                    .setOrigin(0, 0)
                    .play(animKey);
            }
        }
    }
}
