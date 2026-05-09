import * as Phaser from 'phaser';
import { Tile } from './tile';
import { Position, Direction } from '../common/types';
import { BASE_DEPTH, BIOME, BLOCKING_TILE_DEPTH, BORDER_DEPTH, CRYSTAL_GLIMTS_DEPTH, DECORATION_DEPTH, FLOATING_DEPTH, LAVA_DEPTH, VOID_ANIM_DEPTH, VOID_SOLID_DEPTH, WATER_DEPTH } from '../common/common';
import { ASSET_KEYS } from '../common/assets';
import { findTargetTiles, DecideBiome, DecideDecoration, DecideBlockingAndFloating, DecideBorder } from './creator';
import { TileCollisionObject, getBlockingBoxesData } from './blocking-boxes';
import { CHEST_CHANCE, ENABLE_LOGGING } from '../common/config';

export type ChestPlacementHandler = (position: Position, chestNumber: number) => void;

export type EarthCastingConfig = {
    // Void and rock are unlocked from the start.
    isRockDecorationUnlocked: boolean;
    isRockBlockingUnlocked: boolean;
    isChest1Placable: boolean;
    isChest1Placed: boolean;
    // Desert
    isDesertUnlocked: boolean;
    isDesertDecorationUnlocked: boolean;
    isDesertBlockingUnlocked: boolean;
    isChest2Placable: boolean;
    isChest2Placed: boolean;
    // Grass
    isGrassUnlocked: boolean;
    isGrassDecorationUnlocked: boolean;
    isGrassBlockingUnlocked: boolean;
    isChest3Placable: boolean;
    isChest3Placed: boolean;
    //Forest
    isForestUnlocked: boolean;
    isForestDecorationUnlocked: boolean;
    isForestBlockingUnlocked: boolean;
    isChest4Placable: boolean;
    isChest4Placed: boolean;
    // Swamp
    isSwampUnlocked: boolean;
    isSwampDecorationUnlocked: boolean;
    isSwampBlockingUnlocked: boolean;
    isChest5Placable: boolean;
    isChest5Placed: boolean;
    // Crystal
    isCrystalUnlocked: boolean;
    isCrystalDecorationUnlocked: boolean;
    isCrystalBlockingUnlocked: boolean;
    isChest6Placable: boolean;
    isChest6Placed: boolean;
    // Water
    isWaterUnlocked: boolean;
    // Lava
    isLavaUnlocked: boolean;
    // Mountain
    isMountainUnlocked: boolean;
    // Current player power level
    powerLevel: number;
};

export type CastingFeedback = {
    rockTilesPlaced: number;
    rockDecorationsPlaced: number;
    rockBlockingPlaced: number;
    desertTilesPlaced: number;
    desertDecorationsPlaced: number;
    desertBlockingPlaced: number;
    grassTilesPlaced: number;
    grassDecorationsPlaced: number;
    grassBlockingPlaced: number;
    forestTilesPlaced: number;
    forestDecorationsPlaced: number;
    forestBlockingPlaced: number;
    swampTilesPlaced: number;
    swampDecorationsPlaced: number;
    swampBlockingPlaced: number;
    crystalTilesPlaced: number;
    crystalDecorationsPlaced: number;
    crystalBlockingPlaced: number;
    waterTilesPlaced: number;
    lavaTilesPlaced: number;
    mountainTilesPlaced: number;
    chestNumberPlaced: number | undefined;
};

export class Earth {

    protected allTiles: Map<string, Tile> = new Map<string, Tile>();
    protected scene: Phaser.Scene;
    protected tilemap!: Phaser.Tilemaps.Tilemap;
    protected voidLayer!: Phaser.Tilemaps.TilemapLayer;
    protected biomeLayer!: Phaser.Tilemaps.TilemapLayer;
    protected borderLayer!: Phaser.Tilemaps.TilemapLayer;
    protected decorationLayer!: Phaser.Tilemaps.TilemapLayer;
    protected blockingLayer!: Phaser.Tilemaps.TilemapLayer;
    protected floatingLayer!: Phaser.Tilemaps.TilemapLayer;
    protected blockingGeometryGroup!: Phaser.Physics.Arcade.StaticGroup;
    private isInitialized = false;
    private blockingData: Map<number, TileCollisionObject> = new Map<number, TileCollisionObject>();
    private tileSize = 64;
    private placeChest?: ChestPlacementHandler;

    constructor(scene: Phaser.Scene, placeChest?: ChestPlacementHandler) {
        this.scene = scene;
        this.placeChest = placeChest;
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
        // Set up void layer.
        const tilesetVoid = this.tilemap.addTilesetImage(
            ASSET_KEYS.TILESET_BASE,
            ASSET_KEYS.TILESET_BASE,
            this.tileSize,
            this.tileSize,
            2,
            4
        );
        if (!tilesetVoid) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_BASE}`);
        }
        const voidLayer = this.tilemap.createBlankLayer('void', tilesetVoid);
        if (!voidLayer) {
            console.error('Failed to create void tile layer');
            return;
        }
        voidLayer.setDepth(VOID_SOLID_DEPTH);
        // Mark void tiles as colliding so Arcade physics can overlap against the layer.
        voidLayer.setCollision(BIOME.VOID);
        this.voidLayer = voidLayer;

        // Set up base biome layer.
        const tilesetBase = this.tilemap.addTilesetImage(
            ASSET_KEYS.TILESET_BASE,
            ASSET_KEYS.TILESET_BASE,
            this.tileSize,
            this.tileSize,
            2,
            4
        );
        if (!tilesetBase) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_BASE}`);
        }
        const biomeLayer = this.tilemap.createBlankLayer('biome', tilesetBase);
        if (!biomeLayer) {
            console.error('Failed to create biome tile layer');
            return;
        }
        biomeLayer.setDepth(BASE_DEPTH);
        this.biomeLayer = biomeLayer;

        // Set up border layer.
        const tilesetBorder = this.tilemap.addTilesetImage(
            ASSET_KEYS.TILESET_BORDER,
            ASSET_KEYS.TILESET_BORDER,
            this.tileSize,
            this.tileSize
        );
        if (!tilesetBorder) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_BORDER}`);
        }
        const borderLayer = this.tilemap.createBlankLayer('border', tilesetBorder);
        if (!borderLayer) {
            console.error('Failed to create border layer');
            return;
        }
        borderLayer.setDepth(BORDER_DEPTH);
        this.borderLayer = borderLayer;

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
        decorationLayer.setDepth(DECORATION_DEPTH);
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
        this.blockingData = getBlockingBoxesData(tilesetBlocking); // get in blocking-boxes.ts
        const blockingLayer = this.tilemap.createBlankLayer('blocking', tilesetBlocking);
        if (!blockingLayer) {
            console.error('Failed to create blocking tile layer');
            return;
        }
        blockingLayer.setDepth(BLOCKING_TILE_DEPTH);
        blockingLayer.setVisible(false);
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
        floatingLayer.setDepth(FLOATING_DEPTH);
        this.floatingLayer = floatingLayer;

        this.isInitialized = true;
    }

    public AddTiles(creationConfig: EarthCastingConfig, casterPosition: Position, primeTargetPosition: Position, directions: Direction[]): CastingFeedback {
        const castingFeedback = this.createCastingFeedback();
        let numberOfPlacedTiles = 0;
        let casterTile = this.getTile(casterPosition.x, casterPosition.y);
        let allTargets = findTargetTiles(primeTargetPosition, directions, creationConfig.powerLevel);

        //Place regular tiles according to power level
        while (numberOfPlacedTiles < creationConfig.powerLevel) {
            const target = allTargets.shift();
            if (target == undefined) {
                break;
            }
            const targetTile = this.getTile(target.x, target.y);
            if (!this.canPlaceNewTile(targetTile)) {
                continue;
            }

            this.AddTile(this.CreateNewTile(creationConfig, target, creationConfig.powerLevel, casterTile, castingFeedback));
            this.addMissingVoidNeighbors(target);
            numberOfPlacedTiles++;
        }

        if (numberOfPlacedTiles === 0) {
            //Placing blocking on existing tiles.
            allTargets = findTargetTiles(primeTargetPosition, directions, creationConfig.powerLevel);
            let numberOfPlacedBlockings = 0;
            while (numberOfPlacedBlockings * 2 < creationConfig.powerLevel) {
                const target = allTargets.shift();
                if (target == undefined) {
                    return castingFeedback;
                }
                const targetTile = this.getTile(target.x, target.y);
                if (targetTile === undefined || !this.canPlaceBlockingOnExistingTile(creationConfig, casterTile, targetTile)) {
                    continue;
                }

                if (this.tryPlaceBlockingOnExistingTile(creationConfig, casterTile, targetTile, castingFeedback)) {
                    numberOfPlacedBlockings++;
                }
            }
        }
        return castingFeedback;
    }

    private CreateNewTile(creationConfig: EarthCastingConfig, tilePosition: Position, powerLevel: number, casterTile: Tile | undefined, castingFeedback: CastingFeedback): Tile {

        const casterBiome = casterTile?.biome ?? BIOME.ROCK;
        const neighborTiles = this.get4NeighborTiles(tilePosition);
        const neighborBiomes = this.get4NeighborBiomes(tilePosition);
        const biome: number = DecideBiome(creationConfig, casterBiome, neighborTiles);
        const border: number = DecideBorder(biome, neighborBiomes);
        const countOfNeighborDecorations = neighborTiles.filter(n => n.decoration >= 0).length;
        const casterGotDecoration = casterTile?.decoration !== undefined && casterTile.decoration >= 0;
        let decoration: number = -1;
        if ((creationConfig.isRockDecorationUnlocked && biome === BIOME.ROCK) ||
            (creationConfig.isDesertDecorationUnlocked && biome === BIOME.DESERT) ||
            (creationConfig.isGrassDecorationUnlocked && biome === BIOME.GRASS) ||
            (creationConfig.isForestDecorationUnlocked && biome === BIOME.FOREST) ||
            (creationConfig.isSwampDecorationUnlocked && biome === BIOME.SWAMP) ||
            (creationConfig.isCrystalDecorationUnlocked && biome === BIOME.CRYSTAL)) {
            decoration = DecideDecoration(biome, countOfNeighborDecorations, casterGotDecoration, powerLevel);
        }
        let floating = -1;
        this.addBiomePlacementFeedback(castingFeedback, biome, decoration);

        //Test if chests should be placed
        if (biome === BIOME.ROCK && 0 < decoration && creationConfig.isChest1Placable) {
            if (Math.random() < CHEST_CHANCE) {
                castingFeedback.chestNumberPlaced = 1;
                return new Tile({ tilenumber: tilePosition, biome: biome, border: border, decoration: decoration, blocking: -1, floating: floating, chest: 1, });
            }
        } else if (biome === BIOME.DESERT && 0 < decoration && creationConfig.isChest2Placable) {
            if (Math.random() < CHEST_CHANCE) {
                castingFeedback.chestNumberPlaced = 2;
                return new Tile({ tilenumber: tilePosition, biome: biome, border: border, decoration: decoration, blocking: -1, floating: floating, chest: 2, });
            }
        } else if (biome === BIOME.GRASS && 0 < decoration && creationConfig.isChest3Placable) {
            if (Math.random() < CHEST_CHANCE) {
                castingFeedback.chestNumberPlaced = 3;
                return new Tile({ tilenumber: tilePosition, biome: biome, border: border, decoration: decoration, blocking: -1, floating: floating, chest: 3, });
            }
        } else if (biome === BIOME.FOREST && 0 < decoration && creationConfig.isChest4Placable) {
            if (Math.random() < CHEST_CHANCE) {
                castingFeedback.chestNumberPlaced = 4;
                return new Tile({ tilenumber: tilePosition, biome: biome, border: border, decoration: decoration, blocking: -1, floating: floating, chest: 4, });
            }
        } else if (biome === BIOME.SWAMP && 0 < decoration && creationConfig.isChest5Placable) {
            if (Math.random() < CHEST_CHANCE) {
                castingFeedback.chestNumberPlaced = 5;
                return new Tile({ tilenumber: tilePosition, biome: biome, border: border, decoration: decoration, blocking: -1, floating: floating, chest: 5, });
            }
        } else if (biome === BIOME.CRYSTAL && 0 < decoration && creationConfig.isChest6Placable) {
            if (Math.random() < CHEST_CHANCE) {
                castingFeedback.chestNumberPlaced = 6;
                return new Tile({ tilenumber: tilePosition, biome: biome, border: border, decoration: decoration, blocking: -1, floating: floating, chest: 6, });
            }
        }
        // Return regular tile if no chest should be placed.
        return new Tile({
            tilenumber: tilePosition,
            biome: biome,
            border: border,
            decoration: decoration,
            blocking: -1,
            floating: floating,
        });
    }

    private createCastingFeedback(): CastingFeedback {
        return {
            rockTilesPlaced: 0,
            rockDecorationsPlaced: 0,
            rockBlockingPlaced: 0,
            desertTilesPlaced: 0,
            desertDecorationsPlaced: 0,
            desertBlockingPlaced: 0,
            grassTilesPlaced: 0,
            grassDecorationsPlaced: 0,
            grassBlockingPlaced: 0,
            forestTilesPlaced: 0,
            forestDecorationsPlaced: 0,
            forestBlockingPlaced: 0,
            swampTilesPlaced: 0,
            swampDecorationsPlaced: 0,
            swampBlockingPlaced: 0,
            crystalTilesPlaced: 0,
            crystalDecorationsPlaced: 0,
            crystalBlockingPlaced: 0,
            waterTilesPlaced: 0,
            lavaTilesPlaced: 0,
            mountainTilesPlaced: 0,
            chestNumberPlaced: undefined,
        };
    }

    private canPlaceNewTile(targetTile: Tile | undefined): boolean {
        return targetTile === undefined || targetTile.biome === BIOME.VOID;
    }

    private addMissingVoidNeighbors(tilePosition: Position): void {
        const neighborPositions: Position[] = [
            { x: tilePosition.x - 1, y: tilePosition.y },
            { x: tilePosition.x + 1, y: tilePosition.y },
            { x: tilePosition.x, y: tilePosition.y - 1 },
            { x: tilePosition.x, y: tilePosition.y + 1 },
        ];

        for (const neighborPosition of neighborPositions) {
            if (this.getTile(neighborPosition.x, neighborPosition.y) !== undefined) {
                continue;
            }

            this.AddTile(new Tile({
                tilenumber: neighborPosition,
                biome: BIOME.VOID,
            }));
        }
    }

    private canPlaceBlockingOnExistingTile(creationConfig: EarthCastingConfig, casterTile: Tile | undefined, targetTile: Tile): boolean {
        return targetTile.biome !== BIOME.VOID &&
            targetTile.blocking < 0 &&
            casterTile?.biome === targetTile.biome &&
            this.isBlockingUnlockedForBiome(creationConfig, targetTile.biome);
    }

    private isBlockingUnlockedForBiome(creationConfig: EarthCastingConfig, biome: number): boolean {
        switch (biome) {
            case BIOME.ROCK: return creationConfig.isRockBlockingUnlocked;
            case BIOME.DESERT: return creationConfig.isDesertBlockingUnlocked;
            case BIOME.GRASS: return creationConfig.isGrassBlockingUnlocked;
            case BIOME.FOREST: return creationConfig.isForestBlockingUnlocked;
            case BIOME.SWAMP: return creationConfig.isSwampBlockingUnlocked;
            case BIOME.CRYSTAL: return creationConfig.isCrystalBlockingUnlocked;
            default: return false;
        }
    }

    private tryPlaceBlockingOnExistingTile(creationConfig: EarthCastingConfig, casterTile: Tile | undefined, targetTile: Tile, castingFeedback: CastingFeedback): boolean {
        const neighborTiles = this.get4NeighborTiles({ x: targetTile.tileX, y: targetTile.tileY });
        const countOfNeighborDecorations = neighborTiles.filter(n => n.decoration >= 0).length;
        const casterGotDecoration = casterTile?.decoration !== undefined && casterTile.decoration >= 0;
        const countOfNeighborBlocking = neighborTiles.filter(n => n.blocking >= 0).length;
        const [blocking, floating] = DecideBlockingAndFloating(
            targetTile.biome,
            countOfNeighborDecorations,
            casterGotDecoration,
            creationConfig.powerLevel,
            targetTile.decoration,
            countOfNeighborBlocking);

        if (blocking < 0) {
            return false;
        }

        const updatedTile = new Tile({
            tilenumber: { x: targetTile.tileX, y: targetTile.tileY },
            biome: targetTile.biome,
            border: targetTile.border,
            decoration: targetTile.decoration,
            blocking: blocking,
            floating: floating,
        });
        this.AddTile(updatedTile);
        this.addBlockingPlacementFeedback(castingFeedback, targetTile.biome);
        return true;
    }

    private addBiomePlacementFeedback(castingFeedback: CastingFeedback, biome: number, decoration: number): void {
        if (biome === BIOME.ROCK) {
            castingFeedback.rockTilesPlaced++;
            if (decoration >= 0) { castingFeedback.rockDecorationsPlaced++; }
        } else if (biome === BIOME.DESERT) {
            castingFeedback.desertTilesPlaced++;
            if (decoration >= 0) { castingFeedback.desertDecorationsPlaced++; }
        } else if (biome === BIOME.GRASS) {
            castingFeedback.grassTilesPlaced++;
            if (decoration >= 0) { castingFeedback.grassDecorationsPlaced++; }
        } else if (biome === BIOME.FOREST) {
            castingFeedback.forestTilesPlaced++;
            if (decoration >= 0) { castingFeedback.forestDecorationsPlaced++; }
        } else if (biome === BIOME.SWAMP) {
            castingFeedback.swampTilesPlaced++;
            if (decoration >= 0) { castingFeedback.swampDecorationsPlaced++; }
        } else if (biome === BIOME.CRYSTAL) {
            castingFeedback.crystalTilesPlaced++;
            if (decoration >= 0) { castingFeedback.crystalDecorationsPlaced++; }
        } else if (biome === BIOME.WATER) {
            castingFeedback.waterTilesPlaced++;
        } else if (biome === BIOME.LAVA) {
            castingFeedback.lavaTilesPlaced++;
        } else if (biome === BIOME.MOUNTAIN) {
            castingFeedback.mountainTilesPlaced++;
        }
    }

    private addBlockingPlacementFeedback(castingFeedback: CastingFeedback, biome: number): void {
        if (biome === BIOME.ROCK) {
            castingFeedback.rockBlockingPlaced++;
        } else if (biome === BIOME.DESERT) {
            castingFeedback.desertBlockingPlaced++;
        } else if (biome === BIOME.GRASS) {
            castingFeedback.grassBlockingPlaced++;
        } else if (biome === BIOME.FOREST) {
            castingFeedback.forestBlockingPlaced++;
        } else if (biome === BIOME.SWAMP) {
            castingFeedback.swampBlockingPlaced++;
        } else if (biome === BIOME.CRYSTAL) {
            castingFeedback.crystalBlockingPlaced++;
        }
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

    private get4NeighborBiomes(tilePosition: Position): number[] {
        const neighborBiomes: number[] = [];
        let neighborUp = this.getTile(tilePosition.x, tilePosition.y - 1);
        let neighborDown = this.getTile(tilePosition.x, tilePosition.y + 1);
        let neighborLeft = this.getTile(tilePosition.x - 1, tilePosition.y);
        let neighborRight = this.getTile(tilePosition.x + 1, tilePosition.y);
        // Borders in tilesheet are ordered as follows: 0: up, 1: right, 2: down, 3: left.
        if (neighborUp) {
            if (neighborUp.border < 0) {
                neighborBiomes.push(neighborUp.biome);
            } else {
                const remainderOfBorder = neighborUp.border % 4;
                if (remainderOfBorder === 2) {
                    neighborBiomes.push(BIOME.NONE);// Not working Up got an border down.
                } else {
                    neighborBiomes.push(neighborUp.biome);
                }
            }
        } else {
            neighborBiomes.push(BIOME.NONE);
        }

        if (neighborRight) {
            if (neighborRight.border < 0) {
                neighborBiomes.push(neighborRight.biome);
            } else {
                const remainderOfBorder = neighborRight.border % 4;
                if (remainderOfBorder === 3) {
                    neighborBiomes.push(BIOME.NONE);// Not working Right got an border left.
                } else {
                    neighborBiomes.push(neighborRight.biome);
                }
            }
        } else {
            neighborBiomes.push(BIOME.NONE);
        }

        if (neighborDown) {
            if (neighborDown.border < 0) {
                neighborBiomes.push(neighborDown.biome);
            } else {
                const remainderOfBorder = neighborDown.border % 4;
                if (remainderOfBorder === 0) {
                    neighborBiomes.push(BIOME.NONE);// Not working Down got an border up.
                } else {
                    neighborBiomes.push(neighborDown.biome);
                }
            }
        } else {
            neighborBiomes.push(BIOME.NONE);
        }

        if (neighborLeft) {
            if (neighborLeft.border < 0) {
                neighborBiomes.push(neighborLeft.biome);
            } else {
                const remainderOfBorder = neighborLeft.border % 4;
                if (remainderOfBorder === 1) {
                    neighborBiomes.push(BIOME.NONE);// Not working Left got an border right.
                } else {
                    neighborBiomes.push(neighborLeft.biome);
                }
            }
        } else {
            neighborBiomes.push(BIOME.NONE);
        }

        return neighborBiomes;
    }

    public AddTile(tile: Tile) {
        this.allTiles.set(this.key(tile.tileX, tile.tileY), tile);
        if (tile.biome >= 0) {
            if (ENABLE_LOGGING) { console.log(`Placing biome tile with index ${tile.biome} at (${tile.tileX}, ${tile.tileY})`); }
            if (tile.biome === BIOME.VOID) {
                this.voidLayer.putTileAt(tile.biome, tile.tileX, tile.tileY);
            }
            else {
                this.biomeLayer.putTileAt(tile.biome, tile.tileX, tile.tileY);
            }
            if (tile.biome === BIOME.WATER) {
                this.scene.add
                    .sprite(tile.tileX * this.tileSize, tile.tileY * this.tileSize, 'tile-animated')
                    .setOrigin(0, 0)
                    .setDepth(WATER_DEPTH)
                    .play('water-flow');
            } else if (tile.biome === BIOME.LAVA) {
                this.scene.add
                    .sprite(tile.tileX * this.tileSize, tile.tileY * this.tileSize, 'tile-animated')
                    .setOrigin(0, 0)
                    .setDepth(LAVA_DEPTH)
                    .play('lava-flow');
            } else if (tile.biome === BIOME.CRYSTAL) {
                const crystalAnimationChance = 0.7;
                if (Phaser.Math.RND.realInRange(0, 1) < crystalAnimationChance) {
                    this.scene.add
                        .sprite(tile.tileX * this.tileSize, tile.tileY * this.tileSize, 'tile-animated')
                        .setOrigin(0, 0)
                        .setDepth(CRYSTAL_GLIMTS_DEPTH)
                        .play('crystal-flow');
                }
            } else if (tile.biome === BIOME.VOID) {
                //const voidAnimationChance = 0.6;
                //if (Phaser.Math.RND.realInRange(0, 1) < voidAnimationChance)
                {
                    this.scene.add
                        .sprite(tile.tileX * this.tileSize, tile.tileY * this.tileSize, 'tile-animated')
                        .setOrigin(0, 0)
                        .setDepth(VOID_ANIM_DEPTH)
                        .play('void-border-flow');
                }
            }
        }
        if (tile.border >= 0) {
            if (tile.border > 39) {
                console.warn(`Border tile index ${tile.border} is out of expected range!`);
            }
            if (ENABLE_LOGGING) { console.log(`Placing border tile with index ${tile.border} at (${tile.tileX}, ${tile.tileY})`); }
            this.borderLayer.putTileAt(tile.border, tile.tileX, tile.tileY);
        }
        if (tile.decoration >= 0) {
            if (tile.decoration > 55) {
                console.warn(`Decoration tile index ${tile.decoration} is out of expected range!`);
            }
            if (ENABLE_LOGGING) { console.log(`Placing decoration tile with index ${tile.decoration} at (${tile.tileX}, ${tile.tileY})`); }
            this.decorationLayer.putTileAt(tile.decoration, tile.tileX, tile.tileY);
        }
        if (tile.blocking >= 0) {
            if (tile.blocking > 91) {
                console.warn(`Blocking tile index ${tile.blocking} is out of expected range!`);
            }
            if (ENABLE_LOGGING) { console.log(`Placing blocking tile with index ${tile.blocking} at (${tile.tileX}, ${tile.tileY})`); }
            this.blockingLayer.putTileAt(tile.blocking, tile.tileX, tile.tileY);
            this.createBlockingGeometryBody(tile.tileX, tile.tileY, tile.blocking);
            const worldX = tile.tileX * 64;
            const worldY = tile.tileY * 64;
            const sprite = this.scene.add.image(worldX, worldY, ASSET_KEYS.TILESET_BLOCKING, tile.blocking).setOrigin(0, 0);
            sprite.setDepth(worldY + 64);
        }
        if (tile.floating >= 0) {
            if (tile.floating > 15) {
                console.warn(`Floating tile index ${tile.floating} is out of expected range!`);
            }
            if (ENABLE_LOGGING) { console.log(`Placing floating tile with index ${tile.floating} at (${tile.tileX}, ${tile.tileY})`); }
            this.floatingLayer.putTileAt(tile.floating, tile.tileX, tile.tileY - 1);
        }
        if (0 < tile.chest) {
            this.placeChest?.({ x: tile.tileX, y: tile.tileY }, tile.chest);
        }
    }

    public getTile(x: number, y: number): Tile | undefined {
        return this.allTiles.get(this.key(x, y));
    }

    public getBorderTile(screenX: number, screenY: number): Tile | undefined {
        let playOffsetX = 0;
        let playOffsetY = 20;
        const playerTileX = Math.floor((screenX + playOffsetX) / this.tileSize);
        const playerTileY = Math.floor((screenY + playOffsetY) / this.tileSize);
        const borderTileX = playerTileX;
        const borderTileY = playerTileY;
        if ((screenX + playOffsetX) % this.tileSize < 10) { // Left border
            return this.allTiles.get(this.key(borderTileX - 1, borderTileY));
        } else if ((screenX + playOffsetX) % this.tileSize > this.tileSize - 10) { // Right border
            return this.allTiles.get(this.key(borderTileX + 1, borderTileY));
        } else if ((screenY + playOffsetY) % this.tileSize < 10) { // Up border
            return this.allTiles.get(this.key(borderTileX, borderTileY - 1));
        } else if ((screenY + playOffsetY) % this.tileSize > this.tileSize - 10) { // Down border
            return this.allTiles.get(this.key(borderTileX, borderTileY + 1));
        }
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
        let atBorder = false;
        if ((screenX + playOffsetX) % this.tileSize < 10 || (screenX + playOffsetX) % this.tileSize > this.tileSize - 10 ||
            (screenY + playOffsetY) % this.tileSize < 10 || (screenY + playOffsetY) % this.tileSize > this.tileSize - 10) {
            atBorder = true;
        }
        return { x: tileX, y: tileY, atBorder: atBorder };
    }

    // Used by game-scene when setting up collision between player and map 
    public getBlockingGeometryGroup(): Phaser.Physics.Arcade.StaticGroup {
        return this.blockingGeometryGroup;
    }

    // Used by game-scene when setting up overlap between enemies and void tiles
    public getVoidLayer(): Phaser.Tilemaps.TilemapLayer {
        return this.voidLayer;
    }

    private key(x: number, y: number): string {
        return `${x},${y}`;
    }

    private createBlockingGeometryBody(tileX: number, tileY: number, tileIndex: number): void {
        const geometry = this.blockingData.get(tileIndex) ?? { x: 32, y: 32, width: 16, height: 16 };
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




