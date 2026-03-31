import Phaser from 'phaser';
import { DECORATION_LAYER_DEPTH, TILE_SIZE } from './TileConfig';

const DECORATION_TILESET_KEY = 'tile-decoration';

export class DecorationTileLayer
{
    static preload (scene: Phaser.Scene): void
    {
        scene.load.spritesheet(DECORATION_TILESET_KEY, 'tile-decoration.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });
    }

    static create (scene: Phaser.Scene, mapData: number[][]): void
    {
        const map = scene.make.tilemap({
            data: mapData,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE
        });

        const tileset = map.addTilesetImage(DECORATION_TILESET_KEY, DECORATION_TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0);

        if (!tileset) {
            throw new Error('Failed to create decoration tileset from assets/tile-decoration.png');
        }

        const layer = map.createLayer(0, tileset, 0, 0);

        if (!layer) {
            throw new Error('Failed to create decoration overlay layer.');
        }

        layer.setDepth(DECORATION_LAYER_DEPTH);
    }
}