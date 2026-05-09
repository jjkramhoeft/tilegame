import * as Phaser from 'phaser';
import { Position, Direction } from '../common/types';
import { EarthCastingConfig } from './earth';
import { Tile } from './tile';
import { BIOME } from '../common/common';

export function findTargetTiles(tilePosition: Position, directions: Direction[], powerLevel: number): Position[] {
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

export function DecideBiome(creationConfig: EarthCastingConfig, casterBiome: number, neighborTiles: Tile[]): number {
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

export function DecideDecoration(biome: number, countOfNeighborDecorations: number, casterGotDecoration: boolean, powerLevel: number): number {
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
            const minDesertDecorationIndex = 30;
            const maxDesertDecorationIndex = 34;
            let desertDecorationChance = 0.12;
            if (casterGotDecoration) { desertDecorationChance += 0.15; }
            desertDecorationChance += countOfNeighborDecorations * 0.02;
            desertDecorationChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < desertDecorationChance) {
                decoration = Phaser.Math.RND.integerInRange(minDesertDecorationIndex, maxDesertDecorationIndex);
            }
            break;
        case BIOME.GRASS: // grass            
            const minGrassDecorationIndex = 35;
            const maxGrassDecorationIndex = 48;
            let grassDecorationChance = 0.30;
            if (casterGotDecoration) { grassDecorationChance += 0.20; }
            grassDecorationChance += countOfNeighborDecorations * 0.15;
            grassDecorationChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < grassDecorationChance) {
                decoration = Phaser.Math.RND.integerInRange(minGrassDecorationIndex, maxGrassDecorationIndex);
            }
            break;
        case BIOME.FOREST: // forest            
            const minForestDecorationIndex = 49;
            const maxForestDecorationIndex = 55;
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

export function DecideBlockingAndFloating(
    biome: number, 
    countOfNeighborDecorations: number, 
    casterGotDecoration: boolean,
    powerLevel: number, 
    decoration: number, 
    countOfNeighborBlocking: number
): [number, number] {

        let blocking = -1;
        let floating = -1;
    switch (biome) {
        case BIOME.ROCK:
            const minRockBlockingIndex = 0;
            const maxRockBlockingIndex = 19;
            let rockBlockingChance = 0.1;
            if (casterGotDecoration) { rockBlockingChance += 0.05; }
            rockBlockingChance += countOfNeighborDecorations * 0.1;
            rockBlockingChance -= countOfNeighborBlocking * 0.1;
            rockBlockingChance += powerLevel * 0.05;
            if(decoration === -1) {rockBlockingChance += 0.01;} 
            if (Phaser.Math.RND.realInRange(0, 1) < rockBlockingChance) {
                blocking = Phaser.Math.RND.integerInRange(minRockBlockingIndex, maxRockBlockingIndex);
            }
            break;
        case BIOME.DESERT:
            const minDesertBlockingIndex = 84;
            const maxDesertBlockingIndex = 91;
            let desertBlockingChance = 0.01;
            if (casterGotDecoration) { desertBlockingChance += 0.01; }
            desertBlockingChance += countOfNeighborDecorations * 0.01;
            desertBlockingChance += countOfNeighborBlocking * 0.02;
            desertBlockingChance += powerLevel * 0.01;
            if (Phaser.Math.RND.realInRange(0, 1) < desertBlockingChance) {
                blocking = Phaser.Math.RND.integerInRange(minDesertBlockingIndex, maxDesertBlockingIndex);
            }
            break;
        case BIOME.GRASS:
            break;// Grass currently has no blockings.
        case BIOME.FOREST: // forest            
            const minForestBlockingIndex = 20;
            const maxForestBlockingIndex = 46;
            let forestBlockingChance = 0.25;
            if (casterGotDecoration) { forestBlockingChance += 0.20; }
            forestBlockingChance += countOfNeighborDecorations * 0.05;
            forestBlockingChance -= countOfNeighborBlocking * 0.10;
            forestBlockingChance += powerLevel * 0.05;
            if (Phaser.Math.RND.realInRange(0, 1) < forestBlockingChance) {
                blocking = Phaser.Math.RND.integerInRange(minForestBlockingIndex, maxForestBlockingIndex);
                if (blocking >= 37) {
                    floating = blocking - 37;
                }
            }
            break;
        case BIOME.WATER:
            break; // Water has no blockings.
        case BIOME.SWAMP: // swamp            
            const minSwampBlockingIndex = 47;
            const maxSwampBlockingIndex = 58;
            let swampBlockingChance = 0.112;
            if (casterGotDecoration) { swampBlockingChance += 0.05; }
            swampBlockingChance += countOfNeighborDecorations * 0.01;
            swampBlockingChance -= countOfNeighborBlocking * 0.02;
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
            break; // Lava has no blockings.
        case BIOME.MOUNTAIN:
            break; // Mountains is missing in sprite sheet.
    }

    return [blocking, floating];
}

export function DecideBorder(biome: number, neighborBiomes: number[]): number {
    // up right down left
    if (neighborBiomes.length !== 4) {
        console.warn(`DecideBorder expected 4 neighbor biomes, got ${neighborBiomes.length}`);
        return -1;
    }
    const posibleBorderCount = neighborBiomes.filter(n => n >= 1 && n != biome).length;
    if (posibleBorderCount === 0) {
        return -1;// No neighbors, no border.
    }
    const borderSkipChance = 0.002;
    if (Phaser.Math.RND.realInRange(0, 1) < borderSkipChance) {
        return -1;
    }
    let randomOffset = Phaser.Math.RND.integerInRange(0, posibleBorderCount - 1);
    if (neighborBiomes[0] >= 1 && neighborBiomes[0] != biome) // Up
    {
        if (randomOffset > 0) {
            randomOffset--;
        }
        else {
            return neighborBiomes[0] * 4;
        }
    }
    if (neighborBiomes[1] >= 1 && neighborBiomes[1] != biome) // Right
    {
        if (randomOffset > 0) {
            randomOffset--;
        }
        else {
            return neighborBiomes[1] * 4 + 1;
        }
    }
    if (neighborBiomes[2] >= 1 && neighborBiomes[2] != biome) // Down
    {
        if (randomOffset > 0) {
            randomOffset--;
        }
        else {
            return neighborBiomes[2] * 4 + 2;
        }
    }
    if (neighborBiomes[3] >= 1 && neighborBiomes[3] != biome) // Left
    {
        if (randomOffset > 0) {
            randomOffset--;
        }
        else {
            return neighborBiomes[3] * 4 + 3;
        }
    }
    return -1;
}

