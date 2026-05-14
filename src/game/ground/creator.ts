import * as Phaser from 'phaser';
import { Position, Direction } from '../common/types';
import { EarthCastingConfig } from './earth';
import { Tile } from './tile';
import { BIOME } from '../common/common';

type Offset = readonly [number, number];
type TargetPattern = readonly (readonly Offset[])[];

type BiomeUnlockKey =
    | 'isDesertUnlocked'
    | 'isGrassUnlocked'
    | 'isForestUnlocked'
    | 'isWaterUnlocked'
    | 'isSwampUnlocked'
    | 'isCrystalUnlocked'
    | 'isLavaUnlocked'
    | 'isMountainUnlocked';

type BiomeWeightRule = {
    biome: number;
    baseWeight: number;
    unlockKey?: BiomeUnlockKey;
};

type PlacementRule = {
    minIndex: number;
    maxIndex: number;
    baseChance: number;
    casterDecorationBonus: number;
    neighborDecorationBonus: number;
    powerLevelBonus: number;
};

type BlockingRule = PlacementRule & {
    neighborBlockingBonus: number;
    noDecorationBonus?: number;
    floatingIndex?: (blocking: number) => number;
};

const TARGET_PATTERNS: Partial<Record<string, TargetPattern>> = {
    UP: [
        [[-1, 0], [1, 0]],
        [[0, -1], [-1, -1], [1, -1]],
        [[0, -2], [-1, -2], [1, -2], [-2, -2], [2, -2]],
        [[0, -3], [-1, -3], [1, -3], [-2, -3], [2, -3]],
    ],
    DOWN: [
        [[-1, 0], [1, 0]],
        [[0, 1], [-1, 1], [1, 1]],
        [[0, 2], [-1, 2], [1, 2], [-2, 2], [2, 2]],
        [[0, 3], [-1, 3], [1, 3], [-2, 3], [2, 3]],
    ],
    LEFT: [
        [[0, -1], [0, 1]],
        [[-1, 0], [-1, -1], [-1, 1]],
        [[-2, 0], [-2, -1], [-2, 1], [-2, -2], [-2, 2]],
        [[-3, 0], [-3, -1], [-3, 1], [-3, -2], [-3, 2]],
    ],
    RIGHT: [
        [[0, -1], [0, 1]],
        [[1, 0], [1, -1], [1, 1]],
        [[2, 0], [2, -1], [2, 1], [2, -2], [2, 2]],
        [[3, 0], [3, -1], [3, 1], [3, -2], [3, 2]],
    ],
    UP_RIGHT: [
        [[-1, 0], [0, 1]],
        [[1, -1], [0, -1], [1, 0]],
        [[2, -2], [1, -2], [2, -1], [0, -2], [2, 0]],
        [[3, -3], [2, -3], [3, -2], [1, -3], [3, -1]],
    ],
    UP_LEFT: [
        [[1, 0], [0, 1]],
        [[-1, -1], [0, -1], [-1, 0]],
        [[-2, -2], [-2, -1], [-1, -2], [-2, 0], [0, -2]],
        [[-3, -3], [-2, -3], [-3, -2], [-1, -3], [-3, -1]],
    ],
    DOWN_RIGHT: [
        [[-1, 0], [0, -1]],
        [[1, 1], [0, 1], [1, 0]],
        [[2, 2], [1, 2], [2, 1], [0, 2], [2, 0]],
        [[3, 3], [2, 3], [3, 2], [1, 3], [3, 1]],
    ],
    DOWN_LEFT: [
        [[1, 0], [0, -1]],
        [[-1, 1], [0, 1], [-1, 0]],
        [[-2, 2], [-2, 1], [-1, 2], [-2, 0], [0, 2]],
        [[-3, 3], [-2, 3], [-3, 2], [-1, 3], [-3, 1]],
    ],
};

const BIOME_WEIGHT_RULES: readonly BiomeWeightRule[] = [
    { biome: BIOME.ROCK, baseWeight: 20 },
    { biome: BIOME.DESERT, baseWeight: 10, unlockKey: 'isDesertUnlocked' },
    { biome: BIOME.GRASS, baseWeight: 10, unlockKey: 'isGrassUnlocked' },
    { biome: BIOME.FOREST, baseWeight: 10, unlockKey: 'isForestUnlocked' },
    { biome: BIOME.WATER, baseWeight: 10, unlockKey: 'isWaterUnlocked' },
    { biome: BIOME.SWAMP, baseWeight: 10, unlockKey: 'isSwampUnlocked' },
    { biome: BIOME.CRYSTAL, baseWeight: 10, unlockKey: 'isCrystalUnlocked' },
    { biome: BIOME.LAVA, baseWeight: 10, unlockKey: 'isLavaUnlocked' },
    { biome: BIOME.MOUNTAIN, baseWeight: 10, unlockKey: 'isMountainUnlocked' },
];

const DECORATION_RULES = new Map<number, PlacementRule>([
    [BIOME.ROCK, { minIndex: 18, maxIndex: 32, baseChance: 0.5, casterDecorationBonus: 0.3, neighborDecorationBonus: 0.1, powerLevelBonus: 0.05 }],
    [BIOME.DESERT, { minIndex: 30, maxIndex: 34, baseChance: 0.15, casterDecorationBonus: 0.3, neighborDecorationBonus: 0.02, powerLevelBonus: 0.05 }],
    [BIOME.GRASS, { minIndex: 35, maxIndex: 48, baseChance: 0.4, casterDecorationBonus: 0.3, neighborDecorationBonus: 0.15, powerLevelBonus: 0.05 }],
    [BIOME.FOREST, { minIndex: 49, maxIndex: 55, baseChance: 0.3, casterDecorationBonus: 0.3, neighborDecorationBonus: 0.1, powerLevelBonus: 0.05 }],
    [BIOME.SWAMP, { minIndex: 9, maxIndex: 17, baseChance: 0.4, casterDecorationBonus: 0.3, neighborDecorationBonus: 0.1, powerLevelBonus: 0.05 }],
    [BIOME.CRYSTAL, { minIndex: 0, maxIndex: 8, baseChance: 0.25, casterDecorationBonus: 0.3, neighborDecorationBonus: 0.1, powerLevelBonus: 0.08 }],
]);

const BLOCKING_RULES = new Map<number, BlockingRule>([
    [BIOME.ROCK, { minIndex: 0, maxIndex: 19, baseChance: 0.2, casterDecorationBonus: 0.05, neighborDecorationBonus: 0.1, neighborBlockingBonus: -0.1, powerLevelBonus: 0.05, noDecorationBonus: 0.01 }],
    [BIOME.DESERT, { minIndex: 84, maxIndex: 91, baseChance: 0.01, casterDecorationBonus: 0.01, neighborDecorationBonus: 0.01, neighborBlockingBonus: 0.02, powerLevelBonus: 0.01 }],
    [BIOME.FOREST, { minIndex: 20, maxIndex: 46, baseChance: 0.25, casterDecorationBonus: 0.20, neighborDecorationBonus: 0.05, neighborBlockingBonus: -0.10, powerLevelBonus: 0.05, floatingIndex: blocking => blocking >= 37 ? blocking - 37 : -1 }],
    [BIOME.SWAMP, { minIndex: 47, maxIndex: 58, baseChance: 0.112, casterDecorationBonus: 0.05, neighborDecorationBonus: 0.01, neighborBlockingBonus: -0.02, powerLevelBonus: 0.02, floatingIndex: blocking => blocking >= 53 ? blocking + 10 - 53 : -1 }],
    [BIOME.CRYSTAL, { minIndex: 60, maxIndex: 83, baseChance: 0.20, casterDecorationBonus: 0.15, neighborDecorationBonus: 0.1, neighborBlockingBonus: 0, powerLevelBonus: 0.1 }],
]);

const BORDER_SKIP_CHANCE = 0.002;
const CASTER_BIOME_WEIGHT_BONUS = 100;
const NEIGHBOR_BIOME_WEIGHT_BONUS = 10;

export function findTargetTiles(tilePosition: Position, directions: Direction[], powerLevel: number): Position[] {
    const targets: Position[] = [{ x: tilePosition.x, y: tilePosition.y }];
    const pattern = TARGET_PATTERNS[getTargetPatternKey(directions)];

    if (pattern === undefined) {
        return targets;
    }

    for (const offsets of pattern.slice(0, Math.max(1, powerLevel))) {
        for (const [offsetX, offsetY] of offsets) {
            targets.push({ x: tilePosition.x + offsetX, y: tilePosition.y + offsetY });
        }
    }

    return targets;
}

export function DecideBiome(creationConfig: EarthCastingConfig, casterBiome: number, neighborTiles: Tile[]): number {
    const possibleBiomes = new Map<number, number>();

    for (const rule of BIOME_WEIGHT_RULES) {
        if (rule.unlockKey !== undefined && !creationConfig[rule.unlockKey]) {
            continue;
        }

        let weight = casterBiome === rule.biome ? CASTER_BIOME_WEIGHT_BONUS : rule.baseWeight;
        if (rule.biome !== BIOME.ROCK) {
            weight += neighborTiles.filter(neighbor => neighbor.biome === rule.biome).length * NEIGHBOR_BIOME_WEIGHT_BONUS;
        }
        possibleBiomes.set(rule.biome, weight);
    }

    if (possibleBiomes.size > 1) {
        let sumOfWeights = 0;
        for (const weight of possibleBiomes.values()) {
            sumOfWeights += weight;
        }

        const randomWeight = Phaser.Math.RND.realInRange(0, sumOfWeights);
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
    const rule = DECORATION_RULES.get(biome);
    if (rule === undefined) {
        return -1;
    }

    const decorationChance = getPlacementChance(rule, countOfNeighborDecorations, casterGotDecoration, powerLevel);
    if (Phaser.Math.RND.realInRange(0, 1) < decorationChance) {
        return Phaser.Math.RND.integerInRange(rule.minIndex, rule.maxIndex);
    }

    return -1;
}

export function DecideBlockingAndFloating(
    biome: number,
    countOfNeighborDecorations: number,
    casterGotDecoration: boolean,
    powerLevel: number,
    decoration: number,
    countOfNeighborBlocking: number
): [number, number] {
    const rule = BLOCKING_RULES.get(biome);
    if (rule === undefined) {
        return [-1, -1];
    }

    let blockingChance = getPlacementChance(rule, countOfNeighborDecorations, casterGotDecoration, powerLevel);
    blockingChance += countOfNeighborBlocking * rule.neighborBlockingBonus;
    if (decoration === -1) {
        blockingChance += rule.noDecorationBonus ?? 0;
    }

    if (Phaser.Math.RND.realInRange(0, 1) >= blockingChance) {
        return [-1, -1];
    }

    const blocking = Phaser.Math.RND.integerInRange(rule.minIndex, rule.maxIndex);
    const floating = rule.floatingIndex?.(blocking) ?? -1;
    return [blocking, floating];
}

export function DecideBorder(biome: number, neighborBiomes: number[]): number {
    if (neighborBiomes.length !== 4) {
        console.warn(`DecideBorder expected 4 neighbor biomes, got ${neighborBiomes.length}`);
        return -1;
    }

    const possibleBorders = neighborBiomes
        .map((neighborBiome, directionIndex) => ({ neighborBiome, directionIndex }))
        .filter(({ neighborBiome }) => neighborBiome >= 1 && neighborBiome !== biome);

    if (possibleBorders.length === 0 || Phaser.Math.RND.realInRange(0, 1) < BORDER_SKIP_CHANCE) {
        return -1;
    }

    const randomOffset = Phaser.Math.RND.integerInRange(0, possibleBorders.length - 1);
    const border = possibleBorders[randomOffset];
    return border.neighborBiome * 4 + border.directionIndex;
}

function getTargetPatternKey(directions: Direction[]): string {
    if (directions.length === 1) {
        return directions[0];
    }

    if (directions.length !== 2) {
        return '';
    }

    if (directions.includes('UP') && directions.includes('RIGHT')) {
        return 'UP_RIGHT';
    }
    if (directions.includes('UP') && directions.includes('LEFT')) {
        return 'UP_LEFT';
    }
    if (directions.includes('DOWN') && directions.includes('RIGHT')) {
        return 'DOWN_RIGHT';
    }
    if (directions.includes('DOWN') && directions.includes('LEFT')) {
        return 'DOWN_LEFT';
    }

    return '';
}

function getPlacementChance(rule: PlacementRule, countOfNeighborDecorations: number, casterGotDecoration: boolean, powerLevel: number): number {
    let chance = rule.baseChance;
    if (casterGotDecoration) {
        chance += rule.casterDecorationBonus;
    }
    chance += countOfNeighborDecorations * rule.neighborDecorationBonus;
    chance += powerLevel * rule.powerLevelBonus;
    return chance;
}
