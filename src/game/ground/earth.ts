import { Tile } from './tile';
import { Position, Direction } from '../common/types';
import { BIOME } from '../common/common';
import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../common/assets';
import { findTargetTiles, DecideBiome, DicedeDecoration, DicedeBlockingAndFloating } from './creator';
import { TileCollisionObject, getBlockingBoxesData } from './blocking-boxes';

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
    protected tilemap!: Phaser.Tilemaps.Tilemap;
    protected biomeLayer!: Phaser.Tilemaps.TilemapLayer;
    protected decorationLayer!: Phaser.Tilemaps.TilemapLayer;
    protected blockingLayer!: Phaser.Tilemaps.TilemapLayer;
    protected floatingLayer!: Phaser.Tilemaps.TilemapLayer;
    protected blockingGeometryGroup!: Phaser.Physics.Arcade.StaticGroup;
    private isInitialized = false;
    private blockingData: Map<number, TileCollisionObject> = new Map<number, TileCollisionObject>();
    tileSize = 64;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.allTiles = new Map<string, Tile>();
    }

    public createMap(width: number = 100, height: number = 100): void {
        if (this.isInitialized) {
            return;
        }

        this.tilemap = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width,
            height,
        });
        if (!this.tilemap) {
            console.error('Failed to create biome layer');
            return;
        }
        // Set up base biome layer.
        const tilesetBase = this.tilemap.addTilesetImage(
            ASSET_KEYS.TILESET_BASE,
            ASSET_KEYS.TILESET_BASE,
            this.tileSize,
            this.tileSize
        );
        if (!tilesetBase) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_BASE}`);
        }
        const biomeLayer = this.tilemap.createBlankLayer('biome', tilesetBase);
        if (!biomeLayer) {
            console.error('Failed to create biome tile layer');
            return;
        }
        biomeLayer.setDepth(-10);
        this.biomeLayer = biomeLayer;

        // Set up decoration layer.
        const tilesetDeco = this.tilemap.addTilesetImage(
            ASSET_KEYS.TILESET_DECORATION,
            ASSET_KEYS.TILESET_DECORATION,
            this.tileSize,
            this.tileSize
        );
        if (!tilesetDeco) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_DECORATION}`);
        }
        const decorationLayer = this.tilemap.createBlankLayer('decoration', tilesetDeco);
        if (!decorationLayer) {
            console.error('Failed to create decoration layer');
            return;
        }
        decorationLayer.setDepth(-8);
        this.decorationLayer = decorationLayer;

        // Set up blocking layer.
        let tilesetBlocking = this.tilemap.addTilesetImage(
            ASSET_KEYS.TILESET_BLOCKING,
            ASSET_KEYS.TILESET_BLOCKING,
            this.tileSize,
            this.tileSize
        );
        if (!tilesetBlocking) {
            console.error('Failed to load blocking tileset');
            return;
        }
        //Add geometric collision boxes to the blocking layer based on the tile index.    
        tilesetBlocking.tileData = getBlockingBoxesData(tilesetBlocking); // get in blocking-boxes.ts
        if (!tilesetBlocking) {
            throw new Error(`getBlockingBoxesData failed!`);
        }
        const blockingLayer = this.tilemap.createBlankLayer('blocking', tilesetBlocking);
        if (!blockingLayer) {
            console.error('Failed to create blocking tile layer');
            return;
        }
        blockingLayer.setDepth(0);
        this.blockingLayer = blockingLayer;
        this.blockingGeometryGroup = this.scene.physics.add.staticGroup();

        // Set up floating layer.
        const tilesetFloating = this.tilemap.addTilesetImage(
            ASSET_KEYS.TILESET_FLOATING,
            ASSET_KEYS.TILESET_FLOATING,
            this.tileSize,
            this.tileSize
        );
        if (!tilesetFloating) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_FLOATING}`);
        }
        const floatingLayer = this.tilemap.createBlankLayer('floating', tilesetFloating);
        if (!floatingLayer) {
            console.error('Failed to create floating tile layer');
            return;
        }
        floatingLayer.setDepth(9999999);
        this.floatingLayer = floatingLayer;

        this.isInitialized = true;
    }

    public AddTiles(creationConfig: EarthCastingConfig, casterPosition: Position, primeTargetPosition: Position, directions: Direction[]) {
        let numberOfPlacedTiles = 0;
        let allTagets = findTargetTiles(primeTargetPosition, directions, creationConfig.powerLevel);
        let casterTile = this.getTile(casterPosition.x, casterPosition.y);
        while (numberOfPlacedTiles < creationConfig.powerLevel) {
            const target = allTagets.shift();
            if (target == undefined) {
                console.log('No more target tiles to pick!');
                return;
            }
            const targetIsOccupied = this.getTile(target.x, target.y) !== undefined;
            if (targetIsOccupied) {
                console.log('Target tile is occupied, skipping!');
                continue;
            } else {
                console.log('Placing new tile at target!');
                this.AddTile(this.CreateNewTile(creationConfig, target, creationConfig.powerLevel, casterTile));
                numberOfPlacedTiles++;
            }
        }
    }

    private CreateNewTile(creationConfig: EarthCastingConfig, tilePosition: Position, powerLevel: number, casterTile: Tile | undefined): Tile {

        const casterBiome = casterTile?.biome ?? BIOME.ROCK;
        const neighborTiles = this.get4NeighborTiles(tilePosition);
        const biome: number = DecideBiome(creationConfig, casterBiome, neighborTiles);
        const countOfNeighborDecorations = neighborTiles.filter(n => n.decoration >= 0).length;
        const countOfNeighborBolcking = neighborTiles.filter(n => n.blocking >= 0).length;
        const casterGotDecoration = casterTile?.decoration !== undefined && casterTile.decoration >= 0;
        const decoration: number = DicedeDecoration(biome, countOfNeighborDecorations, casterGotDecoration, powerLevel);
        const [blocking, floating] = DicedeBlockingAndFloating(biome, countOfNeighborDecorations, casterGotDecoration, powerLevel, decoration, countOfNeighborBolcking);

        return new Tile({
            tilenumber: tilePosition,
            biome: biome,
            decoration: decoration,
            blocking: blocking,
            floating: floating,
        });
    }

    private get4NeighborTiles(tilePosition: Position): Tile[] {
        const neighborTiles: Tile[] = [];
        let neighborUp = this.getTile(tilePosition.x, tilePosition.y - 1);
        let neighborDown = this.getTile(tilePosition.x, tilePosition.y + 1);
        let neighborLeft = this.getTile(tilePosition.x - 1, tilePosition.y);
        let neighborRight = this.getTile(tilePosition.x + 1, tilePosition.y);
        if (neighborUp) {
            neighborTiles.push(neighborUp);
        }
        if (neighborDown) {
            neighborTiles.push(neighborDown);
        }
        if (neighborLeft) {
            neighborTiles.push(neighborLeft);
        }
        if (neighborRight) {
            neighborTiles.push(neighborRight);
        }
        return neighborTiles;
    }

    public AddTile(tile: Tile) {
        this.allTiles.set(this.key(tile.tileX, tile.tileY), tile);
        if (tile.biome >= 0) {
            this.biomeLayer.putTileAt(tile.biome, tile.tileX, tile.tileY);
            if (tile.biome === BIOME.WATER) {
                this.scene.add
                    .sprite(tile.tileX * this.tileSize, tile.tileY * this.tileSize, 'tile-animated')
                    .setOrigin(0, 0)
                    .setDepth(-1)
                    .play('water-flow');
            } else if (tile.biome === BIOME.LAVA) {
                this.scene.add
                    .sprite(tile.tileX * this.tileSize, tile.tileY * this.tileSize, 'tile-animated')
                    .setOrigin(0, 0)
                    .setDepth(-1)
                    .play('lava-flow');
            } else if (tile.biome === BIOME.CRYSTAL) {
                const crystalAnimationChance = 0.7;
                if (Phaser.Math.RND.realInRange(0, 1) < crystalAnimationChance) {
                    this.scene.add
                        .sprite(tile.tileX * this.tileSize, tile.tileY * this.tileSize, 'tile-animated')
                        .setOrigin(0, 0)
                        .setDepth(-1)
                        .play('crystal-flow');
                }
            } else if (tile.biome === BIOME.VOID) {
                const voidAnimationChance = 0.6;
                if (Phaser.Math.RND.realInRange(0, 1) < voidAnimationChance) {
                    this.scene.add
                        .sprite(tile.tileX * this.tileSize, tile.tileY * this.tileSize, 'tile-animated')
                        .setOrigin(0, 0)
                        .setDepth(-1)
                        .play('void-flow');
                }
            }
        }
        if (tile.decoration >= 0) {
            if (tile.floating > 55) {
                console.warn(`Decoration tile index ${tile.decoration} is out of expected range!`);
            }
            this.decorationLayer.putTileAt(tile.decoration, tile.tileX, tile.tileY);
        }
        if (tile.blocking >= 0) {
            if (tile.floating > 91) {
                console.warn(`Blocking tile index ${tile.blocking} is out of expected range!`);
            }
            this.blockingLayer.putTileAt(tile.blocking, tile.tileX, tile.tileY);
            this.createBlockingGeometryBody(tile.tileX, tile.tileY, tile.blocking);
        }
        if (tile.floating >= 0) {
            if (tile.floating > 15) {
                console.warn(`Floating tile index ${tile.floating} is out of expected range!`);
            }
            this.floatingLayer.putTileAt(tile.floating, tile.tileX, tile.tileY - 1);
        }
    }

    public getTile(x: number, y: number): Tile | undefined {
        return this.allTiles.get(this.key(x, y));
    }

    public getTileXYFromScreenCoordinates(screenX: number, screenY: number, offsetPlayer: boolean): Position {
        let playOffsetX = 0;
        let playOffsetY = 20;
        if (!offsetPlayer) {
            playOffsetX = 0;
            playOffsetY = 0;
        }
        const tileX = Math.floor((screenX + playOffsetX) / this.tileSize);
        const tileY = Math.floor((screenY + playOffsetY) / this.tileSize);
        return { x: tileX, y: tileY };
    }

    // Used by game-scene when setting up collision between player and map 
    public getBlockingGeometryGroup(): Phaser.Physics.Arcade.StaticGroup {
        return this.blockingGeometryGroup;
    }

    private key(x: number, y: number): string {
        return `${x},${y}`;
    }

    private createBlockingGeometryBody(tileX: number, tileY: number, tileIndex: number): void {
        const geometry = this.blockingData.get(tileIndex) ?? { x: 16, y: 16, width: 32, height: 32 };
        const worldX = tileX * this.tileSize + geometry.x + geometry.width / 2;
        const worldY = tileY * this.tileSize + geometry.y + geometry.height / 2;

        const collisionZone = this.scene.add.zone(worldX, worldY, geometry.width, geometry.height);
        collisionZone.setData('tileIndex', tileIndex);
        this.scene.physics.add.existing(collisionZone, true);

        const body = collisionZone.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(geometry.width, geometry.height);
        body.updateFromGameObject();

        this.blockingGeometryGroup.add(collisionZone);
    }
}
