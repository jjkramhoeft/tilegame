import { Tile } from './tile';
import { Position } from '../common/types';
import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../common/assets';

export type EarthCastingConfig = {
    isDesertUnlocked: boolean;
    isGrassUnlocked: boolean;
    isForestUnlocked: boolean;
    isWaterUnlocked: boolean;
    isSwampUnlocked: boolean;
    isCrystalUnlocked: boolean;
    isLavaUnlocked: boolean;
    isMountainUnlocked: boolean;
    powerLevel: number;
};

export class Earth {

    protected allTiles: Map<string, Tile> = new Map<string, Tile>();
    protected scene: Phaser.Scene;
    protected biomeLayer!: Phaser.Tilemaps.Tilemap;
    private isInitialized = false;
    tileSize = 64;
    constructor(scene: Phaser.Scene){
        this.scene = scene;
        this.allTiles = new Map<string,Tile>();
    }

    public createMap(width: number = 100, height: number = 100): void {
        if (this.isInitialized) {
            return;
        }

        this.biomeLayer = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width,
            height,
        });

        const tileset = this.biomeLayer.addTilesetImage(
            ASSET_KEYS.TILESET_BASE,
            ASSET_KEYS.TILESET_BASE,
            this.tileSize,
            this.tileSize
        );

        if (!tileset) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_BASE}`);
        }

        this.biomeLayer.createBlankLayer('biome', tileset);

        if (!this.biomeLayer) {
            console.error('Failed to create biome layer');
            return;
        }
        this.isInitialized = true;
    }

    public AddTiles(creationConfig: EarthCastingConfig, tilePosition: Position) {
        const tile = new Tile({
            tilenumber: tilePosition,
            biome: 1,
        });
        this.AddTile(tile);
    }

    public AddTile(tile: Tile) {
        this.allTiles.set(this.key(tile.tileX, tile.tileY), tile);
        if(tile.biome >= 0) {
            this.biomeLayer.putTileAt(tile.biome, tile.tileX, tile.tileY);
        }
    }

    public getTile(x: number, y: number): Tile | undefined {
        return this.allTiles.get(this.key(x, y));
    }

    public getTileXYFromScreenCoordinates(screenX: number, screenY: number, offsetPlayer: boolean): Position {
         let playOffsetX = 0;
         let playOffsetY = 20;
        if (!offsetPlayer) {
            playOffsetX=0;
            playOffsetY=0;
        }
        const tileX = Math.floor((screenX + playOffsetX) / this.tileSize);
        const tileY = Math.floor((screenY + playOffsetY) / this.tileSize);
        return { x: tileX, y: tileY };
    }

    private key(x: number, y: number): string {
        return `${x},${y}`;
    }
}