import { Tile } from './tile';
import { Position, Direction } from '../common/types';
import { BIOME } from '../common/common';
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


interface TileCollisionObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface TileCollisionData {
    objectgroup?: {
        objects?: TileCollisionObject[];
    };
}

export class Earth {

    protected allTiles: Map<string, Tile> = new Map<string, Tile>();
    protected scene: Phaser.Scene;
    protected biomeLayer!: Phaser.Tilemaps.Tilemap;
    protected decorationLayer!: Phaser.Tilemaps.Tilemap;
    protected blockingLayer!: Phaser.Tilemaps.Tilemap;
    protected floatingLayer!: Phaser.Tilemaps.Tilemap;
    private isInitialized = false;
    tileSize = 64;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.allTiles = new Map<string, Tile>();
    }

    public createMap(width: number = 100, height: number = 100): void {
        if (this.isInitialized) {
            return;
        }

        // Set up base biome layer.
        this.biomeLayer = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width,
            height,
        });
        if (!this.biomeLayer) {
            console.error('Failed to create biome layer');
            return;
        }
        const tilesetBase = this.biomeLayer.addTilesetImage(
            ASSET_KEYS.TILESET_BASE,
            ASSET_KEYS.TILESET_BASE,
            this.tileSize,
            this.tileSize
        );
        if (!tilesetBase) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_BASE}`);
        }
        const biomeTileLayer = this.biomeLayer.createBlankLayer('biome', tilesetBase);
        if (!biomeTileLayer) {
            console.error('Failed to create biome tile layer');
            return;
        }
        biomeTileLayer.setDepth(-2);

        // Set up decoration layer.
        this.decorationLayer = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width,
            height,
        });
        const tilesetDeco = this.decorationLayer.addTilesetImage(
            ASSET_KEYS.TILESET_DECORATION,
            ASSET_KEYS.TILESET_DECORATION,
            this.tileSize,
            this.tileSize
        );
        if (!tilesetDeco) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_DECORATION}`);
        }
        this.decorationLayer.createBlankLayer('decoration', tilesetDeco);
        if (!this.decorationLayer) {
            console.error('Failed to create decoration layer');
            return;
        }

        // Set up blocking layer.
        this.blockingLayer = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width,
            height,
        });
        if (!this.blockingLayer) {
            console.error('Failed to create blocking layer');
            return;
        }
        let tilesetBlocking = this.blockingLayer.addTilesetImage(
            ASSET_KEYS.TILESET_BLOCKING,
            ASSET_KEYS.TILESET_BLOCKING,
            this.tileSize,
            this.tileSize
        );
        if (!tilesetBlocking) {
            console.error('Failed to load rocks tileset');
            return;
        }
        //Add geometric collision shapes to the blocking layer based on the tile.
        const rocksTileData = (tilesetBlocking.tileData || {}) as Record<number, TileCollisionData>;
        // Define custom rectangles for any tile index you want
        for (const tileIndex in rocksTileData) {
            rocksTileData[tileIndex] = {
                objectgroup: {
                    objects: [{
                        x: 16,
                        y: 16,
                        width: 32,
                        height: 32
                    }]
                }
            };
        }
        tilesetBlocking.tileData = rocksTileData;


        if (!tilesetBlocking) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_BLOCKING}`);
        }
        const blockingTileLayer = this.blockingLayer.createBlankLayer('blocking', tilesetBlocking);
        if (!blockingTileLayer) {
            console.error('Failed to create blocking tile layer');
            return;
        }
        blockingTileLayer.setDepth(0);

        // Set up floating layer.
        this.floatingLayer = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width,
            height,
        });
        if (!this.blockingLayer) {
            console.error('Failed to create blocking layer');
            return;
        }
        const tilesetFloating = this.floatingLayer.addTilesetImage(
            ASSET_KEYS.TILESET_FLOATING,
            ASSET_KEYS.TILESET_FLOATING,
            this.tileSize,
            this.tileSize
        );
        if (!tilesetFloating) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_FLOATING}`);
        }
        const floatingTileLayer = this.floatingLayer.createBlankLayer('floating', tilesetFloating);
        if (!floatingTileLayer) {
            console.error('Failed to create floating tile layer');
            return;
        }
        floatingTileLayer.setDepth(9999999);

        this.isInitialized = true;
    }

    public AddTiles(creationConfig: EarthCastingConfig, casterPosition: Position, primeTargetPosition: Position, directions: Direction[]) {
        let numberOfPlacedTiles = 0;
        let allTagets = this.FindTargetTiles(primeTargetPosition, directions, creationConfig.powerLevel);
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

    private FindTargetTiles(tilePosition: Position, directions: Direction[], powerLevel: number): Position[] {
        const targets: Position[] = [];
        targets.push({ x: tilePosition.x, y: tilePosition.y }); // add the original target.
        if (directions.length === 2) {
            if (directions.includes('UP') && directions.includes('RIGHT')) {
                targets.push({ x: tilePosition.x - 1, y: tilePosition.y });
                targets.push({ x: tilePosition.x, y: tilePosition.y + 1 });
                if (powerLevel >= 2) {
                    targets.push({ x: tilePosition.x + 1, y: tilePosition.y - 1 });
                    targets.push({ x: tilePosition.x, y: tilePosition.y - 1 });
                    targets.push({ x: tilePosition.x + 1, y: tilePosition.y });
                    if (powerLevel >= 3) {
                        targets.push({ x: tilePosition.x + 2, y: tilePosition.y - 2 });
                        targets.push({ x: tilePosition.x + 1, y: tilePosition.y - 2 });
                        targets.push({ x: tilePosition.x + 2, y: tilePosition.y - 1 });
                        targets.push({ x: tilePosition.x, y: tilePosition.y - 2 });
                        targets.push({ x: tilePosition.x + 2, y: tilePosition.y });
                        if (powerLevel >= 4) {
                            targets.push({ x: tilePosition.x + 3, y: tilePosition.y - 3 });
                            targets.push({ x: tilePosition.x + 2, y: tilePosition.y - 3 });
                            targets.push({ x: tilePosition.x + 3, y: tilePosition.y - 2 });
                            targets.push({ x: tilePosition.x + 1, y: tilePosition.y - 3 });
                            targets.push({ x: tilePosition.x + 3, y: tilePosition.y - 1 });
                        }
                    }
                }
            } else if (directions.includes('UP') && directions.includes('LEFT')) {
                targets.push({ x: tilePosition.x + 1, y: tilePosition.y });
                targets.push({ x: tilePosition.x, y: tilePosition.y + 1 });
                if (powerLevel >= 2) {
                    targets.push({ x: tilePosition.x - 1, y: tilePosition.y - 1 });
                    targets.push({ x: tilePosition.x, y: tilePosition.y - 1 });
                    targets.push({ x: tilePosition.x - 1, y: tilePosition.y });
                    if (powerLevel >= 3) {
                        targets.push({ x: tilePosition.x - 2, y: tilePosition.y - 2 });
                        targets.push({ x: tilePosition.x - 2, y: tilePosition.y - 1 });
                        targets.push({ x: tilePosition.x - 1, y: tilePosition.y - 2 });
                        targets.push({ x: tilePosition.x - 2, y: tilePosition.y });
                        targets.push({ x: tilePosition.x, y: tilePosition.y - 2 });
                        if (powerLevel >= 4) {
                            targets.push({ x: tilePosition.x - 3, y: tilePosition.y - 3 });
                            targets.push({ x: tilePosition.x - 2, y: tilePosition.y - 3 });
                            targets.push({ x: tilePosition.x - 3, y: tilePosition.y - 2 });
                            targets.push({ x: tilePosition.x - 1, y: tilePosition.y - 3 });
                            targets.push({ x: tilePosition.x - 3, y: tilePosition.y - 1 });
                        }
                    }
                }
            } else if (directions.includes('DOWN') && directions.includes('RIGHT')) {
                targets.push({ x: tilePosition.x - 1, y: tilePosition.y });
                targets.push({ x: tilePosition.x, y: tilePosition.y - 1 });
                if (powerLevel >= 2) {
                    targets.push({ x: tilePosition.x + 1, y: tilePosition.y + 1 });
                    targets.push({ x: tilePosition.x, y: tilePosition.y + 1 });
                    targets.push({ x: tilePosition.x + 1, y: tilePosition.y });
                    if (powerLevel >= 3) {
                        targets.push({ x: tilePosition.x + 2, y: tilePosition.y + 2 });
                        targets.push({ x: tilePosition.x + 1, y: tilePosition.y + 2 });
                        targets.push({ x: tilePosition.x + 2, y: tilePosition.y + 1 });
                        targets.push({ x: tilePosition.x, y: tilePosition.y + 2 });
                        targets.push({ x: tilePosition.x + 2, y: tilePosition.y });
                        if (powerLevel >= 4) {
                            targets.push({ x: tilePosition.x + 3, y: tilePosition.y + 3 });
                            targets.push({ x: tilePosition.x + 2, y: tilePosition.y + 3 });
                            targets.push({ x: tilePosition.x + 3, y: tilePosition.y + 2 });
                            targets.push({ x: tilePosition.x + 1, y: tilePosition.y + 3 });
                            targets.push({ x: tilePosition.x + 3, y: tilePosition.y + 1 });
                        }
                    }
                }
            } else if (directions.includes('DOWN') && directions.includes('LEFT')) {
                targets.push({ x: tilePosition.x + 1, y: tilePosition.y });
                targets.push({ x: tilePosition.x, y: tilePosition.y - 1 });
                if (powerLevel >= 2) {
                    targets.push({ x: tilePosition.x - 1, y: tilePosition.y + 1 });
                    targets.push({ x: tilePosition.x, y: tilePosition.y + 1 });
                    targets.push({ x: tilePosition.x - 1, y: tilePosition.y });
                    if (powerLevel >= 3) {
                        targets.push({ x: tilePosition.x - 2, y: tilePosition.y + 2 });
                        targets.push({ x: tilePosition.x - 2, y: tilePosition.y + 1 });
                        targets.push({ x: tilePosition.x - 1, y: tilePosition.y + 2 });
                        targets.push({ x: tilePosition.x - 2, y: tilePosition.y });
                        targets.push({ x: tilePosition.x, y: tilePosition.y + 2 });
                        if (powerLevel >= 4) {
                            targets.push({ x: tilePosition.x - 3, y: tilePosition.y + 3 });
                            targets.push({ x: tilePosition.x - 2, y: tilePosition.y + 3 });
                            targets.push({ x: tilePosition.x - 3, y: tilePosition.y + 2 });
                            targets.push({ x: tilePosition.x - 1, y: tilePosition.y + 3 });
                            targets.push({ x: tilePosition.x - 3, y: tilePosition.y + 1 });
                        }
                    }
                }
            }

        } else if (directions.length === 1) {
            switch (directions[0]) {
                case 'UP':
                    targets.push({ x: tilePosition.x - 1, y: tilePosition.y });
                    targets.push({ x: tilePosition.x + 1, y: tilePosition.y });
                    if (powerLevel >= 2) {
                        targets.push({ x: tilePosition.x, y: tilePosition.y - 1 });
                        targets.push({ x: tilePosition.x - 1, y: tilePosition.y - 1 });
                        targets.push({ x: tilePosition.x + 1, y: tilePosition.y - 1 });
                        if (powerLevel >= 3) {
                            targets.push({ x: tilePosition.x, y: tilePosition.y - 2 });
                            targets.push({ x: tilePosition.x - 1, y: tilePosition.y - 2 });
                            targets.push({ x: tilePosition.x + 1, y: tilePosition.y - 2 });
                            targets.push({ x: tilePosition.x - 2, y: tilePosition.y - 2 });
                            targets.push({ x: tilePosition.x + 2, y: tilePosition.y - 2 });
                            if (powerLevel >= 4) {
                                targets.push({ x: tilePosition.x, y: tilePosition.y - 3 });
                                targets.push({ x: tilePosition.x - 1, y: tilePosition.y - 3 });
                                targets.push({ x: tilePosition.x + 1, y: tilePosition.y - 3 });
                                targets.push({ x: tilePosition.x - 2, y: tilePosition.y - 3 });
                                targets.push({ x: tilePosition.x + 2, y: tilePosition.y - 3 });
                            }
                        }
                    }
                    break;
                case 'DOWN':
                    targets.push({ x: tilePosition.x - 1, y: tilePosition.y });
                    targets.push({ x: tilePosition.x + 1, y: tilePosition.y });
                    if (powerLevel >= 2) {
                        targets.push({ x: tilePosition.x, y: tilePosition.y + 1 });
                        targets.push({ x: tilePosition.x - 1, y: tilePosition.y + 1 });
                        targets.push({ x: tilePosition.x + 1, y: tilePosition.y + 1 });
                        if (powerLevel >= 3) {
                            targets.push({ x: tilePosition.x, y: tilePosition.y + 2 });
                            targets.push({ x: tilePosition.x - 1, y: tilePosition.y + 2 });
                            targets.push({ x: tilePosition.x + 1, y: tilePosition.y + 2 });
                            targets.push({ x: tilePosition.x - 2, y: tilePosition.y + 2 });
                            targets.push({ x: tilePosition.x + 2, y: tilePosition.y + 2 });
                            if (powerLevel >= 4) {
                                targets.push({ x: tilePosition.x, y: tilePosition.y + 3 });
                                targets.push({ x: tilePosition.x - 1, y: tilePosition.y + 3 });
                                targets.push({ x: tilePosition.x + 1, y: tilePosition.y + 3 });
                                targets.push({ x: tilePosition.x - 2, y: tilePosition.y + 3 });
                                targets.push({ x: tilePosition.x + 2, y: tilePosition.y + 3 });
                            }
                        }
                    }
                    break;
                case 'LEFT':
                    targets.push({ x: tilePosition.x, y: tilePosition.y - 1 });
                    targets.push({ x: tilePosition.x, y: tilePosition.y + 1 });
                    if (powerLevel >= 2) {
                        targets.push({ x: tilePosition.x - 1, y: tilePosition.y });
                        targets.push({ x: tilePosition.x - 1, y: tilePosition.y - 1 });
                        targets.push({ x: tilePosition.x - 1, y: tilePosition.y + 1 });
                        if (powerLevel >= 3) {
                            targets.push({ x: tilePosition.x - 2, y: tilePosition.y });
                            targets.push({ x: tilePosition.x - 2, y: tilePosition.y - 1 });
                            targets.push({ x: tilePosition.x - 2, y: tilePosition.y + 1 });
                            targets.push({ x: tilePosition.x - 2, y: tilePosition.y - 2 });
                            targets.push({ x: tilePosition.x - 2, y: tilePosition.y + 2 });
                            if (powerLevel >= 4) {
                                targets.push({ x: tilePosition.x - 3, y: tilePosition.y });
                                targets.push({ x: tilePosition.x - 3, y: tilePosition.y - 1 });
                                targets.push({ x: tilePosition.x - 3, y: tilePosition.y + 1 });
                                targets.push({ x: tilePosition.x - 3, y: tilePosition.y - 2 });
                                targets.push({ x: tilePosition.x - 3, y: tilePosition.y + 2 });
                            }
                        }
                    }
                    break;
                case 'RIGHT':
                    targets.push({ x: tilePosition.x, y: tilePosition.y - 1 });
                    targets.push({ x: tilePosition.x, y: tilePosition.y + 1 });
                    if (powerLevel >= 2) {
                        targets.push({ x: tilePosition.x + 1, y: tilePosition.y });
                        targets.push({ x: tilePosition.x + 1, y: tilePosition.y - 1 });
                        targets.push({ x: tilePosition.x + 1, y: tilePosition.y + 1 });
                        if (powerLevel >= 3) {
                            targets.push({ x: tilePosition.x + 2, y: tilePosition.y });
                            targets.push({ x: tilePosition.x + 2, y: tilePosition.y - 1 });
                            targets.push({ x: tilePosition.x + 2, y: tilePosition.y + 1 });
                            targets.push({ x: tilePosition.x + 2, y: tilePosition.y - 2 });
                            targets.push({ x: tilePosition.x + 2, y: tilePosition.y + 2 });
                            if (powerLevel >= 4) {
                                targets.push({ x: tilePosition.x + 3, y: tilePosition.y });
                                targets.push({ x: tilePosition.x + 3, y: tilePosition.y - 1 });
                                targets.push({ x: tilePosition.x + 3, y: tilePosition.y + 1 });
                                targets.push({ x: tilePosition.x + 3, y: tilePosition.y - 2 });
                                targets.push({ x: tilePosition.x + 3, y: tilePosition.y + 2 });
                            }
                        }
                    }
                    break;
            }
        }
        return targets;
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

    get4NeighborTiles(tilePosition: Position): Tile[] {
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

    private key(x: number, y: number): string {
        return `${x},${y}`;
    }
}

function DecideBiome(creationConfig: EarthCastingConfig, casterBiome: number, neighborTiles: Tile[]): number {
    const possibleBiomes = new Map<number, number>(); // biomeId, weight
    if (casterBiome === BIOME.ROCK) {
        possibleBiomes.set(BIOME.ROCK, 100);
    } else {
        possibleBiomes.set(BIOME.ROCK, 20);
    }
    if (creationConfig.isDesertUnlocked) {
        let weight = 10;
        if (casterBiome === BIOME.DESERT) {
            weight += 100;
        }
        for (const neighbor of neighborTiles) {
            if (neighbor.biome === BIOME.DESERT) {
                weight += 10;
            }
        }
        possibleBiomes.set(BIOME.DESERT, weight);
    }
    if (creationConfig.isGrassUnlocked) {
        let weight = 10;
        if (casterBiome === BIOME.GRASS) {
            weight += 100;
        }
        for (const neighbor of neighborTiles) {
            if (neighbor.biome === BIOME.GRASS) {
                weight += 10;
            }
        }
        possibleBiomes.set(BIOME.GRASS, weight);
    }
    if (creationConfig.isForestUnlocked) {
        let weight = 10;
        if (casterBiome === BIOME.FOREST) {
            weight += 100;
        }
        for (const neighbor of neighborTiles) {
            if (neighbor.biome === BIOME.FOREST) {
                weight += 10;
            }
        }
        possibleBiomes.set(BIOME.FOREST, weight);
    }
    if (creationConfig.isWaterUnlocked) {
        let weight = 10;
        if (casterBiome === BIOME.WATER) {
            weight += 100;
        }
        for (const neighbor of neighborTiles) {
            if (neighbor.biome === BIOME.WATER) {
                weight += 10;
            }
        }
        possibleBiomes.set(BIOME.WATER, weight);
    }
    if (creationConfig.isSwampUnlocked) {
        let weight = 10;
        if (casterBiome === BIOME.SWAMP) {
            weight += 100;
        }
        for (const neighbor of neighborTiles) {
            if (neighbor.biome === BIOME.SWAMP) {
                weight += 10;
            }
        }
        possibleBiomes.set(BIOME.SWAMP, weight);
    }
    if (creationConfig.isCrystalUnlocked) {
        let weight = 10;
        if (casterBiome === BIOME.CRYSTAL) {
            weight += 100;
        }
        for (const neighbor of neighborTiles) {
            if (neighbor.biome === BIOME.CRYSTAL) {
                weight += 10;
            }
        }
        possibleBiomes.set(BIOME.CRYSTAL, weight);
    }
    if (creationConfig.isLavaUnlocked) {
        let weight = 10;
        if (casterBiome === BIOME.LAVA) {
            weight += 100;
        }
        for (const neighbor of neighborTiles) {
            if (neighbor.biome === BIOME.LAVA) {
                weight += 10;
            }
        }
        possibleBiomes.set(BIOME.LAVA, weight);
    }
    if (creationConfig.isMountainUnlocked) {
        let weight = 10;
        if (casterBiome === BIOME.MOUNTAIN) {
            weight += 100;
        }
        for (const neighbor of neighborTiles) {
            if (neighbor.biome === BIOME.MOUNTAIN) {
                weight += 10;
            }
        }
        possibleBiomes.set(BIOME.MOUNTAIN, weight);
    }
    // Now pick between posisible biomes based on weights.
    if (possibleBiomes.size > 1) {
        let sumOfWeights = 0;
        for (const [_, weight] of possibleBiomes) {
            sumOfWeights += weight;
        }
        let randomWeight = Phaser.Math.RND.realInRange(0, sumOfWeights);
        let cumulativeWeight = 0;
        for (const [biomeId, weight] of possibleBiomes) {
            cumulativeWeight += weight;
            if (randomWeight < cumulativeWeight) {
                return biomeId;
            }
        }
    }
    return BIOME.ROCK;
}

function DicedeDecoration(biome: number, countOfNeighborDecorations: number, casterGotDecoration: boolean, powerLevel: number): number {
    let decoration = -1;
    switch (biome) {
        case BIOME.ROCK: // rock
            const minRockDecorationIndex = 18;
            const maxRockDecorationIndex = 32;
            let rockDecorationChance = 0.3;
            if (casterGotDecoration) { rockDecorationChance += 0.2; }
            rockDecorationChance += countOfNeighborDecorations * 0.1;
            rockDecorationChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < rockDecorationChance) {
                decoration = Phaser.Math.RND.integerInRange(minRockDecorationIndex, maxRockDecorationIndex);
            }
            break;
        case BIOME.DESERT: // desert            
            const minDesertDecorationIndex = 28;
            const maxDesertDecorationIndex = 32;
            let desertDecorationChance = 0.12;
            if (casterGotDecoration) { desertDecorationChance += 0.15; }
            desertDecorationChance += countOfNeighborDecorations * 0.02;
            desertDecorationChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < desertDecorationChance) {
                decoration = Phaser.Math.RND.integerInRange(minDesertDecorationIndex, maxDesertDecorationIndex);
            }
            break;
        case BIOME.GRASS: // grass            
            const minGrassDecorationIndex = 33;
            const maxGrassDecorationIndex = 46;
            let grassDecorationChance = 0.30;
            if (casterGotDecoration) { grassDecorationChance += 0.20; }
            grassDecorationChance += countOfNeighborDecorations * 0.15;
            grassDecorationChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < grassDecorationChance) {
                decoration = Phaser.Math.RND.integerInRange(minGrassDecorationIndex, maxGrassDecorationIndex);
            }
            break;
        case BIOME.FOREST: // forest            
            const minForestDecorationIndex = 47;
            const maxForestDecorationIndex = 52;
            let forestDecorationChance = 0.25;
            if (casterGotDecoration) { forestDecorationChance += 0.20; }
            forestDecorationChance += countOfNeighborDecorations * 0.1;
            forestDecorationChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < forestDecorationChance) {
                decoration = Phaser.Math.RND.integerInRange(minForestDecorationIndex, maxForestDecorationIndex);
            }
            break;
        // Water has no decorations. 
        case BIOME.SWAMP: // swamp            
            const minSwampDecorationIndex = 9;
            const maxSwampDecorationIndex = 17;
            let swampDecorationChance = 0.20;
            if (casterGotDecoration) { swampDecorationChance += 0.15; }
            swampDecorationChance += countOfNeighborDecorations * 0.1;
            swampDecorationChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < swampDecorationChance) {
                decoration = Phaser.Math.RND.integerInRange(minSwampDecorationIndex, maxSwampDecorationIndex);
            }
            break;
        case BIOME.CRYSTAL: // crystal            
            const minCrystalDecorationIndex = 0;
            const maxCrystalDecorationIndex = 8;
            let crystalDecorationChance = 0.20;
            if (casterGotDecoration) { crystalDecorationChance += 0.15; }
            crystalDecorationChance += countOfNeighborDecorations * 0.1;
            crystalDecorationChance += powerLevel * 0.1;
            if (Phaser.Math.RND.realInRange(0, 1) < crystalDecorationChance) {
                decoration = Phaser.Math.RND.integerInRange(minCrystalDecorationIndex, maxCrystalDecorationIndex);
            }
            break;
        // Lava and mountains has no decorations. 
    }
    return decoration;
}

function DicedeBlockingAndFloating(biome: number, countOfNeighborDecorations: number, casterGotDecoration: boolean,
    powerLevel: number, decoration: number, countOfNeighborBolcking: number): [number, number] {
    let blocking = -1;
    let floating = -1;
    switch (biome) {
        case BIOME.ROCK:
            const minRockBlockingIndex = 0;
            const maxRockBlockingIndex = 19;
            let rockBlockingChance = 0.1;
            if (casterGotDecoration) { rockBlockingChance += 0.05; }
            rockBlockingChance += countOfNeighborDecorations * 0.1;
            rockBlockingChance -= countOfNeighborBolcking * 0.1;
            rockBlockingChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < rockBlockingChance) {
                blocking = Phaser.Math.RND.integerInRange(minRockBlockingIndex, maxRockBlockingIndex);
            }
            break;
        case BIOME.DESERT:
            const minDesertBlockingIndex = 94;
            const maxDesertBlockingIndex = 101;
            let desertBlockingChance = 0.01;
            if (casterGotDecoration) { desertBlockingChance += 0.01; }
            desertBlockingChance += countOfNeighborDecorations * 0.01;
            desertBlockingChance += countOfNeighborBolcking * 0.02;
            desertBlockingChance += powerLevel * 0.01;
            if (Phaser.Math.RND.realInRange(0, 1) < desertBlockingChance) {
                blocking = Phaser.Math.RND.integerInRange(minDesertBlockingIndex, maxDesertBlockingIndex);
            }
            break;
        case BIOME.GRASS:
            break;
        case BIOME.FOREST: // forest            
            const minForestBlockingIndex = 20;
            const maxForestBlockingIndex = 46;
            let forestBlockingChance = 0.25;
            if (casterGotDecoration) { forestBlockingChance += 0.20; }
            forestBlockingChance += countOfNeighborDecorations * 0.05;
            forestBlockingChance -= countOfNeighborBolcking * 0.10;
            forestBlockingChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < forestBlockingChance) {
                blocking = Phaser.Math.RND.integerInRange(minForestBlockingIndex, maxForestBlockingIndex);
                if (blocking >= 37) {
                    floating = blocking - 37;
                }
            }
            break;
        case BIOME.WATER:
            break;
        case BIOME.SWAMP: // swamp            
            const minSwampBlockingIndex = 47;
            const maxSwampBlockingIndex = 58;
            let swampBlockingChance = 0.112;
            if (casterGotDecoration) { swampBlockingChance += 0.05; }
            swampBlockingChance += countOfNeighborDecorations * 0.01;
            swampBlockingChance -= countOfNeighborBolcking * 0.02;
            swampBlockingChance += powerLevel * 0.02;
            if (Phaser.Math.RND.realInRange(0, 1) < swampBlockingChance) {
                blocking = Phaser.Math.RND.integerInRange(minSwampBlockingIndex, maxSwampBlockingIndex);
                if (blocking >= 53) { // floating blockings
                    floating = blocking + 10 - 53;
                }
            }
            break;
        case BIOME.CRYSTAL:
            const minCrystalBlockingIndex = 60;
            const maxCrystalBlockingIndex = 83;
            let crystalBlockingChance = 0.20;
            if (casterGotDecoration) { crystalBlockingChance += 0.15; }
            crystalBlockingChance += countOfNeighborDecorations * 0.1;
            crystalBlockingChance += powerLevel * 0.1;
            if (Phaser.Math.RND.realInRange(0, 1) < crystalBlockingChance) {
                blocking = Phaser.Math.RND.integerInRange(minCrystalBlockingIndex, maxCrystalBlockingIndex);
            }
            break;
        case BIOME.LAVA:
            break;
        case BIOME.MOUNTAIN:
            break; // Mountains is missing in sprite sheet.
    }

    return [blocking, floating];
}

