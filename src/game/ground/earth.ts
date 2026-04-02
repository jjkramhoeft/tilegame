import { Tile } from './tile';
import { Position, Direction } from '../common/types';
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
    protected decorationLayer!: Phaser.Tilemaps.Tilemap;
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

        this.biomeLayer = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width,
            height,
        });

        const tilesetBase = this.biomeLayer.addTilesetImage(
            ASSET_KEYS.TILESET_BASE,
            ASSET_KEYS.TILESET_BASE,
            this.tileSize,
            this.tileSize
        );

        if (!tilesetBase) {
            throw new Error(`Tileset not found for key: ${ASSET_KEYS.TILESET_BASE}`);
        }

        this.biomeLayer.createBlankLayer('biome', tilesetBase);

        if (!this.biomeLayer) {
            console.error('Failed to create biome layer');
            return;
        }

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
                this.AddTile(this.CreateNewTile(creationConfig, target, casterTile));
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

    private CreateNewTile(creationConfig: EarthCastingConfig, tilePosition: Position, casterTile: Tile | undefined): Tile {
        let biome = 1;
        let casterBiome = casterTile?.biome ?? 1;
        const possibleBiomes = new Map<number, number>(); // biomeId, weight
        if (casterBiome === 1) {
            possibleBiomes.set(1, 100);
        }
        let neighborTiles = [];
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

        if (creationConfig.isDesertUnlocked || creationConfig.isGrassUnlocked || creationConfig.isForestUnlocked || creationConfig.isWaterUnlocked || creationConfig.isSwampUnlocked || creationConfig.isCrystalUnlocked || creationConfig.isLavaUnlocked || creationConfig.isMountainUnlocked) {
            if (creationConfig.isDesertUnlocked) {
                let key=2;
                let weight = 10;
                if (casterBiome === key) {
                    weight+=100;
                }
                for (const neighbor of neighborTiles) {
                    if (neighbor.biome === key) {
                        weight += 10;
                    }
                }
                possibleBiomes.set(key,weight);
            }
            if (creationConfig.isGrassUnlocked) {
                let key=3;
                let weight = 10;
                if (casterBiome === key) {
                    weight+=100;
                }
                for (const neighbor of neighborTiles) {
                    if (neighbor.biome === key) {
                        weight += 10;
                    }
                }
                possibleBiomes.set(key,weight);
            }
            if (creationConfig.isForestUnlocked) {
                let key=4;
                let weight = 10;
                if (casterBiome === key) {
                    weight+=100;
                }
                for (const neighbor of neighborTiles) {
                    if (neighbor.biome === key) {
                        weight += 10;
                    }
                }
                possibleBiomes.set(key,weight);
            }
            if (creationConfig.isWaterUnlocked) {
                let key=5;
                let weight = 10;
                if (casterBiome === key) {
                    weight+=100;
                }
                for (const neighbor of neighborTiles) {
                    if (neighbor.biome === key) {
                        weight += 10;
                    }
                }
                possibleBiomes.set(key,weight);
            }
            if (creationConfig.isSwampUnlocked) {
                let key=6;
                let weight = 10;
                if (casterBiome === key) {
                    weight+=100;
                }
                for (const neighbor of neighborTiles) {
                    if (neighbor.biome === key) {
                        weight += 10;
                    }
                }
                possibleBiomes.set(key,weight);
            }
            if (creationConfig.isCrystalUnlocked) {
                let key=7;
                let weight = 10;
                if (casterBiome === key) {
                    weight+=100;
                }
                for (const neighbor of neighborTiles) {
                    if (neighbor.biome === key) {
                        weight += 10;
                    }
                }
                possibleBiomes.set(key,weight);                
            }
            if (creationConfig.isLavaUnlocked) {
                let key=8;
                let weight = 10;
                if (casterBiome === key) {
                    weight+=100;
                }
                for (const neighbor of neighborTiles) {
                    if (neighbor.biome === key) {
                        weight += 10;
                    }
                }
                possibleBiomes.set(key,weight);
            }
            if (creationConfig.isMountainUnlocked) {
                let key=9;
                let weight = 10;
                if (casterBiome === key) {
                    weight+=100;
                }
                for (const neighbor of neighborTiles) {
                    if (neighbor.biome === key) {
                        weight += 10;
                    }
                }
                possibleBiomes.set(key,weight);
            }
            if (possibleBiomes.size > 0) {
                let sumOfWeights = 0;
                possibleBiomes.forEach((weight) => {
                    sumOfWeights += weight;
                });
                let randomWeight = Phaser.Math.RND.realInRange(0, sumOfWeights);//   Math.floor(Math.random() * sumOfWeights);
                let cumulativeWeight = 0;
                let found = false;
                possibleBiomes.forEach((  weight ,biomeId)=> {
                    cumulativeWeight += weight;
                    if (randomWeight < cumulativeWeight && !found) {
                        biome = biomeId;
                        found = true;
                    
                    }
                });
            }
        }
        let decoration = -1;
        const tile = new Tile({
            tilenumber: tilePosition,
            biome: biome,
            decoration: decoration,
        });
        return tile;
    }

    public AddTile(tile: Tile) {
        this.allTiles.set(this.key(tile.tileX, tile.tileY), tile);
        if (tile.biome >= 0) {
            this.biomeLayer.putTileAt(tile.biome, tile.tileX, tile.tileY);
        }
        if (tile.decoration >= 0) {
            this.decorationLayer.putTileAt(tile.decoration, tile.tileX, tile.tileY);
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
