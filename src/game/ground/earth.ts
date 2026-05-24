import * as Phaser from 'phaser';
import { Tile } from './tile';
import { Position, Direction } from '../common/types';
import { BASE_DEPTH, CASTING_UNLOCKS, BIOME, BLOCKING_TILE_DEPTH, BORDER_DEPTH, CRYSTAL_GLIMTS_DEPTH, DECORATION_DEPTH, FLOATING_DEPTH, LAVA_DEPTH, VOID_ANIM_DEPTH, VOID_SOLID_DEPTH, WATER_DEPTH } from '../common/common';
import { ASSET_KEYS } from '../common/assets';
import { findTargetTiles, DecideBiome, DecideDecoration, DecideBlockingAndFloating, DecideBorder, PickDecoration } from './creator';
import { TileCollisionObject, getBlockingBoxesData } from './blocking-boxes';
import { CHEST_CHANCE, ENABLE_LOGGING } from '../common/config';
import { CUSTOM_EVENTS, EVENT_BUS, type TilePlacedPayload } from '../common/event-bus';
import { DataManager } from '../common/data-manager';
import { CastingUnlocks } from '../common/types';

export type ChestPlacementHandler = (position: Position, chestNumber: number) => void;

/**
 * @deprecated This constant will be replaced with the Datamanager instance's unlockedSpellCasting.
 */
export type EarthCastingConfig = {
    // Void and rock are unlocked from the start.
    isRockDecorationUnlocked: boolean;
    isRockBlockingUnlocked: boolean;
    isRockAnimalsUnlocked: boolean;
    isChest1Placable: boolean;
    isChest1Placed: boolean;
    // Desert
    isDesertUnlocked: boolean;
    isDesertDecorationUnlocked: boolean;
    isDesertBlockingUnlocked: boolean;
    isDesertAnimalsUnlocked: boolean;
    isChest2Placable: boolean;
    isChest2Placed: boolean;
    // Grass
    isGrassUnlocked: boolean;
    isGrassDecorationUnlocked: boolean;
    isGrassBlockingUnlocked: boolean;
    isGrassAnimalsUnlocked: boolean;
    isChest3Placable: boolean;
    isChest3Placed: boolean;
    //Forest
    isForestUnlocked: boolean;
    isForestDecorationUnlocked: boolean;
    isForestBlockingUnlocked: boolean;
    isForestAnimalsUnlocked: boolean;
    isChest4Placable: boolean;
    isChest4Placed: boolean;
    // Swamp
    isSwampUnlocked: boolean;
    isSwampDecorationUnlocked: boolean;
    isSwampBlockingUnlocked: boolean;
    isSwampAnimalsUnlocked: boolean;
    isChest5Placable: boolean;
    isChest5Placed: boolean;
    // Crystal
    isCrystalUnlocked: boolean;
    isCrystalDecorationUnlocked: boolean;
    isCrystalBlockingUnlocked: boolean;
    isCrystalAnimalsUnlocked: boolean;
    isChest6Placable: boolean;
    isChest6Placed: boolean;
    // Water
    isWaterUnlocked: boolean;
    isWaterAnimalsUnlocked: boolean;
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
    private firstTilePosition?: Position;

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

    /**
     * @deprecated This class will be replaced by the SpellCastingService and new functions in Creator
     */
    public AddTiles(
        creationConfig: EarthCastingConfig,
        casterPosition: Position,
        primeTargetPosition: Position,
        directions: Direction[],
        isLimitedCast: boolean): CastingFeedback {
        const castingFeedback = this.createCastingFeedback();
        let numberOfPlacedTiles = 0;
        let casterTile = this.getTile(casterPosition.x, casterPosition.y);
        let allTargets = findTargetTiles(primeTargetPosition, directions, creationConfig.powerLevel);
        const firstTilePosition = this.getFirstTilePosition();
        if (isLimitedCast && firstTilePosition) {
            // For limited casts, filter targets to only include tiles close to the firstTilePosition (less than 4 tiles away).)
            allTargets = allTargets.filter(targetTile => {
                const maxXDistance = Math.abs(targetTile.x - firstTilePosition.x);
                const maxYDistance = Math.abs(targetTile.y - firstTilePosition.y);
                return maxXDistance <= 4 &&
                    maxYDistance <= 4;
            });
        }

        // Place regular tiles according to power level
        let chestAlreadyPlaced = false;
        while (numberOfPlacedTiles < creationConfig.powerLevel) {
            const target = allTargets.shift();
            if (target == undefined) {
                break;
            }
            const targetTile = this.getTile(target.x, target.y);
            if (!this.canPlaceNewTile(targetTile)) {
                continue;
            }
            const newTile = this.CreateNewTile(creationConfig, target, creationConfig.powerLevel, casterTile, castingFeedback, isLimitedCast, chestAlreadyPlaced);
            if (newTile === undefined ||
                (isLimitedCast && newTile.biome != BIOME.ROCK)) {
                break; // Limited casts can only place rock tiles.
            }
            this.AddTile(newTile);
            if (newTile.chest !== undefined && newTile.chest > 0) { chestAlreadyPlaced = true; }
            this.addMissingVoidNeighbors(target);
            numberOfPlacedTiles++;
            if (isLimitedCast) break; // Limited casts can only place one tile, even if power level is higher.
        }

        if (numberOfPlacedTiles === 0) {
            // Placing blocking on existing tiles.
            allTargets = findTargetTiles(primeTargetPosition, directions, creationConfig.powerLevel);
            if (isLimitedCast && firstTilePosition) {
                // For limited casts, filter targets to only include tiles close to the firstTilePosition (less than 4 tiles away).)
                allTargets = allTargets.filter(targetTile => {
                    const maxXDistance = Math.abs(targetTile.x - firstTilePosition.x);
                    const maxYDistance = Math.abs(targetTile.y - firstTilePosition.y);
                    return maxXDistance <= 4 && maxYDistance <= 4 &&
                        (targetTile.x != firstTilePosition.x || targetTile.y != firstTilePosition.y) && // Don't include the first tile itself as a target for limited casts blocking.
                        (targetTile.x != firstTilePosition.x + 1 || targetTile.y != firstTilePosition.y); // Don't include the tile to the right of the first tile as a target for limited casts, because that's where the fruit chest shall spawn.
                });
            }
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
                if (isLimitedCast) break; // Limited casts can only place one blocking, even if power level is higher.
            }
        }
        return castingFeedback;
    }

    /**
     * @deprecated This class will be replaced by the SpellCastingService and new functions in Creator
     */
    private CreateNewTile(
        creationConfig: EarthCastingConfig,
        tilePosition: Position,
        powerLevel: number,
        casterTile: Tile | undefined,
        castingFeedback: CastingFeedback,
        isLimited: boolean = false,
        chestAlreadyPlaced: boolean = false,
    ): Tile {

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
        if (!chestAlreadyPlaced && !isLimited) {
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

    public findAnimalTargetTiles(targetPosition: Position, directions: Direction[], powerLevel: number, biome: number): Position[] {
        const allTargets = findTargetTiles(targetPosition, directions, powerLevel);
        return allTargets.filter(target => {
            const targetTile = this.getTile(target.x, target.y);
            return targetTile?.biome === biome && (targetTile.blocking === undefined || targetTile.blocking < 0);
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
            this.isBlockingUnlockedForBiome(creationConfig, targetTile.biome) &&
            (targetTile.chest === undefined || targetTile.chest < 1); // Don't place blocking on tiles with chests.
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

    // Used to add visual distinct viod tiles.
    public AddVoidMarkerTile(tileX: number, tileY: number): void {
        const existing = this.allTiles.get(this.key(tileX, tileY));
        if (existing !== undefined && existing.biome !== BIOME.VOID) {
            return; // Don't overwrite a real tile with a void marker.
        }
        const voidMarkerTile = new Tile({
            tilenumber: { x: tileX, y: tileY },
            biome: BIOME.VOID
        });
        this.allTiles.set(this.key(tileX, tileY), voidMarkerTile);
        //voidMarkerTile?.setCollision(true, true, true, true); collision not need on maker void tiles, they are use early in the game when there are no animals, so no bounce is needed.
        this.scene.add
            .sprite(voidMarkerTile.tileX * this.tileSize + this.tileSize / 2, voidMarkerTile.tileY * this.tileSize + this.tileSize / 2, 'tile-animated')
            .setOrigin(0.5, 0.5)
            .setAngle(Phaser.Math.RND.pick([0, 90, 180, 270]))
            .setDepth(VOID_ANIM_DEPTH)
            .play('void-marker-flow');
    }

    AddDecorationToTile(position: Position): void {
        let existingTile = this.allTiles.get(this.key(position.x, position.y));
        if (existingTile === undefined || existingTile?.biome === BIOME.VOID) return;
        if(existingTile.decoration !== undefined && existingTile.decoration >= 0) return; // Don't place a decoration if there is already one.
        const decoration = PickDecoration(existingTile.biome);
        existingTile.decoration = decoration;
        this.decorationLayer.putTileAt(decoration, position.x, position.y);
        this.allTiles.set(this.key(position.x, position.y), existingTile);
        let placedTileAsCastingUnlock: CastingUnlocks | undefined = undefined;
        switch (existingTile.biome) {
            case BIOME.ROCK:
                placedTileAsCastingUnlock = CASTING_UNLOCKS.ROCK_DECORATION;
                break;
            case BIOME.DESERT:
                placedTileAsCastingUnlock = CASTING_UNLOCKS.DESERT_DECORATION;
                break;
            case BIOME.GRASS:
                placedTileAsCastingUnlock = CASTING_UNLOCKS.GRASS_DECORATION;
                break;
            case BIOME.FOREST:
                placedTileAsCastingUnlock = CASTING_UNLOCKS.FOREST_DECORATION;
                break;
            case BIOME.SWAMP:
                placedTileAsCastingUnlock = CASTING_UNLOCKS.SWAMP_DECORATION;
                break;
            case BIOME.CRYSTAL:
                placedTileAsCastingUnlock = CASTING_UNLOCKS.CRYSTAL_DECORATION;
                break;
        }
        if (placedTileAsCastingUnlock) DataManager.instance.increaseTilesPlaced(placedTileAsCastingUnlock);
    }

    AddBaseTile(position: Position, biome: BIOME, allowVariation: boolean): void {
        let placedTileAsCastingUnlock: CastingUnlocks | undefined = undefined;
        const existingTile = this.allTiles.get(this.key(position.x, position.y));
        if (existingTile !== undefined && existingTile?.biome !== BIOME.VOID) return;
        const neighborBiomes = this.get4NeighborBiomes(position);
        let actualBiome = biome;
        if (allowVariation && BIOME.VOID < biome) {
            let rockFactor = 0;
            if (DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.ROCK_BASIC)) {
                rockFactor = 1;
                if (biome === BIOME.ROCK) rockFactor += 10;
            }
            let desertFactor = 0;
            if (DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.DESERT_BASIC)) {
                desertFactor = 1;
                if (biome === BIOME.DESERT) desertFactor += 10;
            }
            let waterFactor = 0;
            if (DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.WATER_BASIC)) {
                waterFactor = 1;
                if (biome === BIOME.WATER) waterFactor += 10;
            }

            let grassFactor = 0;
            if (DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.GRASS_BASIC)) {
                grassFactor = 1;
                if (biome === BIOME.GRASS) grassFactor += 10;
            }
            let forestFactor = 0;
            if (DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.FOREST_BASIC)) {
                forestFactor = 1;
                if (biome === BIOME.FOREST) forestFactor += 10;
            }
            let mountainFactor = 0;
            if (DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.MOUNTAIN_BASIC)) {
                mountainFactor = 1;
                if (biome === BIOME.MOUNTAIN) mountainFactor += 10;
            }

            let swampFactor = 0;
            if (DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.SWAMP_BASIC)) {
                swampFactor = 1;
                if (biome === BIOME.SWAMP) swampFactor += 10;
            }
            let crystalFactor = 0;
            if (DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CRYSTAL_BASIC)) {
                crystalFactor = 1;
                if (biome === BIOME.CRYSTAL) crystalFactor += 10;
            }
            let lavaFactor = 0;
            if (DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.LAVA_BASIC)) {
                lavaFactor = 1;
                if (biome === BIOME.LAVA) lavaFactor += 10;
            }
            const totalFactor = rockFactor + desertFactor + waterFactor + grassFactor + forestFactor + mountainFactor + swampFactor + crystalFactor + lavaFactor;
            const randomValue = Phaser.Math.RND.integerInRange(1, totalFactor);
            if (randomValue <= rockFactor) {
                actualBiome = BIOME.ROCK;
                placedTileAsCastingUnlock = CASTING_UNLOCKS.ROCK_BASIC;
            } else if (randomValue <= rockFactor + desertFactor) {
                actualBiome = BIOME.DESERT;
                placedTileAsCastingUnlock = CASTING_UNLOCKS.DESERT_BASIC;
            } else if (randomValue <= rockFactor + desertFactor + waterFactor) {
                actualBiome = BIOME.WATER;
                placedTileAsCastingUnlock = CASTING_UNLOCKS.WATER_BASIC;
            } else if (randomValue <= rockFactor + desertFactor + waterFactor + grassFactor) {
                actualBiome = BIOME.GRASS;
                placedTileAsCastingUnlock = CASTING_UNLOCKS.GRASS_BASIC;
            } else if (randomValue <= rockFactor + desertFactor + waterFactor + grassFactor + forestFactor) {
                actualBiome = BIOME.FOREST;
                placedTileAsCastingUnlock = CASTING_UNLOCKS.FOREST_BASIC;
            } else if (randomValue <= rockFactor + desertFactor + waterFactor + grassFactor + forestFactor + mountainFactor) {
                actualBiome = BIOME.MOUNTAIN;
                placedTileAsCastingUnlock = CASTING_UNLOCKS.MOUNTAIN_BASIC;
            } else if (randomValue <= rockFactor + desertFactor + waterFactor + grassFactor + forestFactor + mountainFactor + swampFactor) {
                actualBiome = BIOME.SWAMP;
                placedTileAsCastingUnlock = CASTING_UNLOCKS.SWAMP_BASIC;
            } else if (randomValue <= rockFactor + desertFactor + waterFactor + grassFactor + forestFactor + mountainFactor + swampFactor + crystalFactor) {
                actualBiome = BIOME.CRYSTAL;
                placedTileAsCastingUnlock = CASTING_UNLOCKS.CRYSTAL_BASIC;
            } else if (randomValue <= rockFactor + desertFactor + waterFactor + grassFactor + forestFactor + mountainFactor + swampFactor + crystalFactor + lavaFactor) {
                actualBiome = BIOME.LAVA;
                placedTileAsCastingUnlock = CASTING_UNLOCKS.LAVA_BASIC;
            }
        }
        const border: number = DecideBorder(actualBiome, neighborBiomes);
        const neighborPositions: Position[] = [
            { x: position.x - 1, y: position.y },
            { x: position.x + 1, y: position.y },
            { x: position.x, y: position.y - 1 },
            { x: position.x, y: position.y + 1 },
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
        let tile = new Tile({
            tilenumber: position,
            biome: actualBiome,
            border: border,
            decoration: -1,
            blocking: -1,
            floating: -1,
        });
        this.AddTile(tile);
        DataManager.instance.increaseTilesPlaced(placedTileAsCastingUnlock);
        this.addMissingVoidNeighbors(position);
    }

    public targetWithNeighborCountAndBiome(positions: Position[]): { pos: Position, neighborCount: number, biome: BIOME, decorated: boolean }[] {
        const result: { pos: Position, neighborCount: number, biome: BIOME, decorated: boolean }[] = [];
        for (const position of positions) {
            const tile = this.getTile(position.x, position.y);
            const biome = tile?.biome ?? BIOME.VOID;
            const decorated = tile?.decoration !== undefined && tile.decoration >= 0;
            const neighborTiles = this.get4NeighborTiles(position);
            const neighborCount = neighborTiles.filter(n => 0 < n.biome).length;
            result.push({ pos: position, neighborCount, biome, decorated });
        }
        return result;
    }

    public AddTile(tile: Tile): void {
        this.allTiles.set(this.key(tile.tileX, tile.tileY), tile);
        if (tile.biome >= 0) {
            if (ENABLE_LOGGING) { console.log(`Placing biome tile with index ${tile.biome} at (${tile.tileX}, ${tile.tileY})`); }
            if (tile.biome === BIOME.VOID) {
                const voidTile = this.voidLayer.putTileAt(tile.biome, tile.tileX, tile.tileY);
                voidTile?.setCollision(true, true, true, true);
                this.biomeLayer.removeTileAt(tile.tileX, tile.tileY, true, true);
            }
            else {
                this.voidLayer.removeTileAt(tile.tileX, tile.tileY, true, true);
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
                        .sprite(tile.tileX * this.tileSize + this.tileSize / 2, tile.tileY * this.tileSize + this.tileSize / 2, 'tile-animated')
                        .setOrigin(0.5, 0.5)
                        .setAngle(Phaser.Math.RND.pick([0, 90, 180, 270]))
                        .setDepth(CRYSTAL_GLIMTS_DEPTH)
                        .play('crystal-flow');
                }
            } else if (tile.biome === BIOME.VOID) {
                {
                    this.scene.add
                        .sprite(tile.tileX * this.tileSize + this.tileSize / 2, tile.tileY * this.tileSize + this.tileSize / 2, 'tile-animated')
                        .setOrigin(0.5, 0.5)
                        .setAngle(Phaser.Math.RND.pick([0, 90, 180, 270]))
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

        // Notify listeners (game progression, etc.) that a tile was placed.
        const payload: TilePlacedPayload = {
            tileX: tile.tileX,
            tileY: tile.tileY,
            biome: tile.biome,
            hasBlocking: tile.blocking >= 0,
        };
        EVENT_BUS.emit(CUSTOM_EVENTS.TILE_PLACED, payload);
    }

    public getTile(x: number, y: number): Tile | undefined {
        return this.allTiles.get(this.key(x, y));
    }

    /** World-tile coordinates of the very first tile placed by `placeStartingTile`. */
    public getFirstTilePosition(): Position | undefined {
        return this.firstTilePosition;
    }

    public getTileSize(): number {
        return this.tileSize;
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

    public placeStartingTile(playerStartPosition: Position): Position {
        this.firstTilePosition = this.getTileXYFromScreenCoordinates(playerStartPosition.x, playerStartPosition.y, true);
        const firstTile = new Tile({
            tilenumber: this.firstTilePosition,
            biome: 1,
        });
        this.AddTile(firstTile);
        return this.firstTilePosition!;
    }

    public placeTargetVoidTiles(): void {
        if (!this.firstTilePosition) {
            return;
        }
        for (let dx = -3; dx <= 3; dx++) {
            for (let dy = -3; dy <= 3; dy++) {
                if (Math.abs(dx) === 3 && Math.abs(dy) === 3) continue; // Skip the 4 outermost corners
                if (dx === 0 && dy === 0) continue; // Skip the center tile (already the starting tile)
                this.AddVoidMarkerTile(this.firstTilePosition.x + dx, this.firstTilePosition.y + dy);
            }
        }
    }

    public placeGardenTiles(staggerMs = 0, currentPlayerTilePosition: Position, onComplete?: () => void): void {
        //ToDo: Implement changing the center tiles to a lush green garden, using forest, grass and water tiles, then add the big-tree.
        //For now it just simple forest bioms and the big tree.
        if (!this.firstTilePosition) {
            onComplete?.();
            return;
        }
        const first = this.firstTilePosition;
        const tilesToPlace: Tile[] = [
            // A stream of water.
            new Tile({ tilenumber: { x: first.x - 2, y: first.y + 4 }, biome: BIOME.WATER, blocking: -1 }),
            new Tile({ tilenumber: { x: first.x - 2, y: first.y + 3 }, biome: BIOME.WATER, blocking: -1 }),
            new Tile({ tilenumber: { x: first.x - 1, y: first.y + 3 }, biome: BIOME.WATER, blocking: -1 }),
            new Tile({ tilenumber: { x: first.x - 1, y: first.y + 2 }, biome: BIOME.WATER, blocking: -1 }),
            new Tile({ tilenumber: { x: first.x, y: first.y + 2 }, biome: BIOME.WATER, blocking: -1 }),
            new Tile({ tilenumber: { x: first.x, y: first.y + 1 }, biome: BIOME.WATER, blocking: -1 }),
            // bigTree tile & fruit chest tile.
            new Tile({ tilenumber: { x: first.x, y: first.y }, biome: BIOME.FOREST, blocking: -1 }),
            new Tile({ tilenumber: { x: first.x + 1, y: first.y }, biome: BIOME.FOREST, blocking: -1 }),//Chest will be placed later.
            // Center forest tiles.
            new Tile({ tilenumber: { x: first.x - 1, y: first.y + 1 }, biome: BIOME.FOREST, blocking: -1, decoration: -1 }),
            new Tile({ tilenumber: { x: first.x + 1, y: first.y + 1 }, biome: BIOME.FOREST, blocking: -1, decoration: -1 }),
            new Tile({ tilenumber: { x: first.x - 1, y: first.y }, biome: BIOME.FOREST, blocking: -1, decoration: -1 }),
            new Tile({ tilenumber: { x: first.x + 1, y: first.y - 1 }, biome: BIOME.FOREST, blocking: -1, decoration: -1 }),
            new Tile({ tilenumber: { x: first.x - 1, y: first.y - 1 }, biome: BIOME.FOREST, blocking: -1, decoration: -1 }),
            new Tile({ tilenumber: { x: first.x, y: first.y - 1 }, biome: BIOME.FOREST, blocking: -1, decoration: -1 }),
            // Center forest tiles again with decorations
            new Tile({ tilenumber: { x: first.x - 1, y: first.y + 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 49 }),
            new Tile({ tilenumber: { x: first.x + 1, y: first.y + 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 50 }),
            new Tile({ tilenumber: { x: first.x - 1, y: first.y }, biome: BIOME.FOREST, blocking: -1, decoration: 51 }),
            new Tile({ tilenumber: { x: first.x + 1, y: first.y - 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 52 }),
            new Tile({ tilenumber: { x: first.x - 1, y: first.y - 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 53 }),
            new Tile({ tilenumber: { x: first.x, y: first.y - 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 54 }),
            // Next ring. (12 tiles)           
            new Tile({ tilenumber: { x: first.x + 1, y: first.y + 2 }, biome: BIOME.FOREST, blocking: -1, decoration: 55 }),
            new Tile({ tilenumber: { x: first.x - 2, y: first.y + 2 }, biome: BIOME.FOREST, blocking: -1, decoration: 49 }),
            new Tile({ tilenumber: { x: first.x - 2, y: first.y + 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 50 }),
            new Tile({ tilenumber: { x: first.x + 2, y: first.y + 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 51 }),
            //
            new Tile({ tilenumber: { x: first.x - 2, y: first.y }, biome: BIOME.FOREST, blocking: -1, decoration: 52 }),
            new Tile({ tilenumber: { x: first.x, y: first.y - 2 }, biome: BIOME.FOREST, blocking: -1, decoration: 53 }),
            new Tile({ tilenumber: { x: first.x, y: first.y + 3 }, biome: BIOME.FOREST, blocking: -1, decoration: 54 }),
            new Tile({ tilenumber: { x: first.x - 2, y: first.y - 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 55 }),
            //            
            new Tile({ tilenumber: { x: first.x + 1, y: first.y - 2 }, biome: BIOME.FOREST, blocking: -1, decoration: 49 }),
            new Tile({ tilenumber: { x: first.x - 1, y: first.y - 2 }, biome: BIOME.FOREST, blocking: -1, decoration: 50 }),
            new Tile({ tilenumber: { x: first.x + 2, y: first.y - 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 51 }),
            new Tile({ tilenumber: { x: first.x + 2, y: first.y }, biome: BIOME.FOREST, blocking: -1, decoration: 52 }),
            // 11 tiles from the outer ring.            
            new Tile({ tilenumber: { x: first.x + 1, y: first.y + 3 }, biome: BIOME.FOREST, blocking: -1, decoration: 53 }),
            new Tile({ tilenumber: { x: first.x - 3, y: first.y + 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 54 }),
            new Tile({ tilenumber: { x: first.x + 2, y: first.y + 2 }, biome: BIOME.FOREST, blocking: -1, decoration: 55 }),
            new Tile({ tilenumber: { x: first.x - 3, y: first.y }, biome: BIOME.FOREST, blocking: -1, decoration: 49 }),
            //
            new Tile({ tilenumber: { x: first.x - 2, y: first.y - 2 }, biome: BIOME.FOREST, blocking: -1, decoration: 50 }),
            new Tile({ tilenumber: { x: first.x + 3, y: first.y }, biome: BIOME.FOREST, blocking: -1, decoration: 51 }),
            new Tile({ tilenumber: { x: first.x + 3, y: first.y - 1 }, biome: BIOME.FOREST, blocking: -1, decoration: 52 }),
            new Tile({ tilenumber: { x: first.x + 1, y: first.y - 3 }, biome: BIOME.FOREST, blocking: -1, decoration: 53 }),
            //
            new Tile({ tilenumber: { x: first.x + 2, y: first.y - 2 }, biome: BIOME.FOREST, blocking: -1, decoration: 54 }),
            new Tile({ tilenumber: { x: first.x, y: first.y - 3 }, biome: BIOME.FOREST, blocking: -1, decoration: 55 }),
            new Tile({ tilenumber: { x: first.x - 1, y: first.y - 3 }, biome: BIOME.FOREST, blocking: -1, decoration: 49 }),
        ];

        const tryPlaceTree = (): void => {
            if (currentPlayerTilePosition.x !== first.x + pos.x || currentPlayerTilePosition.y !== first.y + pos.y) {
                const currentTile: Tile | undefined = this.getTile(first.x + pos.x, first.y + pos.y);
                if (currentTile === undefined || currentTile.blocking < 0) {
                    tilesToPlace.push(new Tile({
                        tilenumber: { x: first.x + pos.x, y: first.y + pos.y },
                        biome: BIOME.FOREST,
                        blocking: blokking,
                        decoration: docoration
                    }));
                }
            }
        };
        const tryPlaceVoid = (): void => {
            const currentTile: Tile | undefined = this.getTile(first.x + pos.x, first.y + pos.y);
            if (currentTile === undefined) {
                tilesToPlace.push(new Tile({
                    tilenumber: { x: first.x + pos.x, y: first.y + pos.y },
                    biome: BIOME.VOID
                }));
            }
        };

        // Now again with blocking (if not on players tile)
        let pos = { x: -1, y: 1 }; let blokking = 20; let docoration = 49;// center 1
        tryPlaceTree();
        pos = { x: -1, y: 0 }; blokking = 22; docoration = 51;// center 3
        tryPlaceTree();
        pos = { x: 0, y: 3 }; blokking = 24; docoration = 54;// next 7
        tryPlaceTree();
        pos = { x: 2, y: -2 }; blokking = 26; docoration = 54;// outer 9
        tryPlaceTree();
        pos = { x: -2, y: -2 }; blokking = 27; docoration = 50;// outer 5
        tryPlaceTree();
        pos = { x: 2, y: 2 }; blokking = 32; docoration = 55;// outer 3
        tryPlaceTree();

        // Now place void at the edges of the garden if needed.
        pos = { x: 0, y: 4 }; tryPlaceVoid();
        pos = { x: 1, y: 4 }; tryPlaceVoid();
        pos = { x: 2, y: 3 }; tryPlaceVoid();
        pos = { x: 3, y: 2 }; tryPlaceVoid();
        pos = { x: 4, y: 0 }; tryPlaceVoid();
        pos = { x: 4, y: -1 }; tryPlaceVoid();
        pos = { x: 3, y: -2 }; tryPlaceVoid();
        pos = { x: 2, y: -3 }; tryPlaceVoid();
        pos = { x: 1, y: -4 }; tryPlaceVoid();
        pos = { x: 0, y: -4 }; tryPlaceVoid();
        pos = { x: -1, y: -4 }; tryPlaceVoid();
        pos = { x: -2, y: -3 }; tryPlaceVoid();
        pos = { x: -3, y: -2 }; tryPlaceVoid();
        pos = { x: -4, y: 0 }; tryPlaceVoid();
        pos = { x: -4, y: 1 }; tryPlaceVoid();
        pos = { x: -3, y: 2 }; tryPlaceVoid();

        this.createBlockingGeometryBody(first.x, first.y, 42);// The big tree trunk blocking. (Currently hardcoded at nor ready for Save Game). ToDo: Fix blocking bigTree.

        const placeTileAt = (tile: Tile): void => { this.AddTile(tile); };

        const spawnBigTree = (): void => {
            this.scene.add
                .sprite(first.x * this.tileSize, first.y * this.tileSize, 'big-tree')
                .setOrigin(0.25, 0.85)
                .setDepth(first.y * this.tileSize + 32)
                .play('big-tree-growth', true);

            onComplete?.();
        };

        // Staged: place tiles one by one with a delay, then the big tree.
        tilesToPlace.forEach((tile, index) => {
            this.scene.time.delayedCall(staggerMs * index, () => placeTileAt(tile));
        });
        this.scene.time.delayedCall(staggerMs * tilesToPlace.length, spawnBigTree);
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




