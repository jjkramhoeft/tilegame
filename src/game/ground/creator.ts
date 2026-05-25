import * as Phaser from 'phaser';
import { Position, Direction } from '../common/types';
import { BIOME } from '../common/common';

type Offset = readonly [number, number];
type TargetPattern = readonly (readonly Offset[])[];

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

const DECORATION_MAP = new Map<number, {minIndex: number, maxIndex: number}>([
    [BIOME.ROCK, { minIndex: 18, maxIndex: 32}],
    [BIOME.DESERT, { minIndex: 30, maxIndex: 34}],
    [BIOME.GRASS, { minIndex: 35, maxIndex: 48}],
    [BIOME.FOREST, { minIndex: 49, maxIndex: 55}],
    [BIOME.SWAMP, { minIndex: 9, maxIndex: 17}],
    [BIOME.CRYSTAL, { minIndex: 0, maxIndex: 8}],
]);

const BLOCKING_MAP = new Map<number, {minIndex: number, maxIndex: number}>([
    [BIOME.ROCK, { minIndex: 0, maxIndex: 19, }],
    [BIOME.DESERT, { minIndex: 84, maxIndex: 91}],
    [BIOME.FOREST, { minIndex: 20, maxIndex: 46}],
    [BIOME.SWAMP, { minIndex: 47, maxIndex: 58}],
    [BIOME.CRYSTAL, { minIndex: 60, maxIndex: 83}],
]);

const BORDER_SKIP_CHANCE = 0.002;

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

export function PickDecoration(biome: number): number {
    const rule = DECORATION_MAP.get(biome);
    if (rule === undefined) {
        return -1;
    }
    return Phaser.Math.RND.integerInRange(rule.minIndex, rule.maxIndex);
}

export function PickBlocking(biome: number): number {
    const rule = BLOCKING_MAP.get(biome);
    if (rule === undefined) {
        return -1;
    }
    return Phaser.Math.RND.integerInRange(rule.minIndex, rule.maxIndex);
}

export function PickFloating(biome: number, blocking: number): number {
    switch (biome) {
        case BIOME.FOREST:
            return blocking >= 37 ? blocking - 37 : -1;
        case BIOME.SWAMP:
            return blocking >= 53 ? blocking + 10 - 53 : -1;
        default:
            return -1;
    }
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