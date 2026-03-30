import { Scene } from 'phaser';

const TILE_SIZE = 64;

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
       
    }

    create ()
    {
        const map = this.make.tilemap({
            data: MAP_DATA,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE
        });

        const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0);

        if (!tileset) {
            throw new Error('Failed to create tileset from assets/tiles.png');
        }

        map.createLayer(0, tileset, 0, 0);

        this.cameras.main.setBounds(0, 0, 16 * TILE_SIZE, 16 * TILE_SIZE);
    }
}
