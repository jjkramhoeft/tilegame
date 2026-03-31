import Phaser from 'phaser';
import { DETAIL_LAYER_DEPTH, TILE_SIZE } from './TileConfig';

const DETAIL_TILESET_KEY = 'tile-details';

export class DetailTileLayer
{
    static preload (scene: Phaser.Scene): void
    {
        scene.load.spritesheet(DETAIL_TILESET_KEY, 'tile-details.png', {
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

        const tileset = map.addTilesetImage(DETAIL_TILESET_KEY, DETAIL_TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0);

        if (!tileset) {
            throw new Error('Failed to create detail tileset from assets/tile-details.png');
        }

        const layer = map.createLayer(0, tileset, 0, 0);

        if (!layer) {
            throw new Error('Failed to create detail overlay layer.');
        }

        layer.setDepth(DETAIL_LAYER_DEPTH);
    }
}