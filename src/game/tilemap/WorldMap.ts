import Phaser from 'phaser';
import {
    ANIMATED_TILE_OVERRIDES,
    BASE_LAYER_DEPTH,
    DETAIL_MAP_DATA,
    MAP_DATA,
    TILE_SIZE,
    validateLayerDimensions,
} from './TileConfig';
import { AnimatedTileLayer } from './AnimatedTileLayer';
import { DetailTileLayer } from './DetailTileLayer';

export class WorldMap
{
    static preload (scene: Phaser.Scene): void
    {
        scene.load.spritesheet('tiles', 'tiles.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });

        AnimatedTileLayer.preload(scene);
        DetailTileLayer.preload(scene);
    }

    static create (scene: Phaser.Scene): void
    {
        validateLayerDimensions(MAP_DATA, DETAIL_MAP_DATA, 'Detail layer');

        const baseLayerData = MAP_DATA.map((row) =>
            row.map((tile) => (ANIMATED_TILE_OVERRIDES[tile] !== undefined ? -1 : tile))
        );

        const map = scene.make.tilemap({
            data: baseLayerData,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE
        });

        const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0);

        if (!tileset) {
            throw new Error('Failed to create tileset from assets/tiles.png');
        }

        const baseLayer = map.createLayer(0, tileset, 0, 0);

        if (!baseLayer) {
            throw new Error('Failed to create base tile layer.');
        }

        baseLayer.setDepth(BASE_LAYER_DEPTH);

        AnimatedTileLayer.create(scene, MAP_DATA);
        DetailTileLayer.create(scene, DETAIL_MAP_DATA);

        const mapWidth = MAP_DATA[0].length * TILE_SIZE;
        const mapHeight = MAP_DATA.length * TILE_SIZE;
        scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    }
}
