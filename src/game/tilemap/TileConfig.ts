export const TILE_SIZE = 64;
export const EMPTY_TILE = -1;

export const BASE_LAYER_DEPTH = -10000;
export const ANIMATED_LAYER_DEPTH = -9000;
export const BORDER_LAYER_DEPTH = -8000;
export const DECORATION_LAYER_DEPTH = -7000;
export const ACTOR_DEPTH_BASE = 1000;
export const FLOATING_LAYER_DEPTH = 200000;

export const BASE_TILESET_KEY = 'tile-base';
export const ANIMATED_TILESET_KEY = 'tile-animated';
export const BORDER_TILESET_KEY = 'tile-border';
export const DECORATION_TILESET_KEY = 'tile-decoration';
export const BLOCKING_TILESET_KEY = 'tile-blocking';
export const FLOATING_TILESET_KEY = 'tile-floating';

export const WATER_TILE_INDEX = 5;
export const LAVA_TILE_INDEX = 8;
export const VOID_TILE_INDEX = 0;
export const CRYSTAL_TILE_INDEX = 7;

export const VOID_ANIM_KEY = 'void-flow';
export const WATER_ANIM_KEY = 'water-flow';
export const CRYSTAL_ANIM_KEY = 'crystal-flow';
export const LAVA_ANIM_KEY = 'lava-flow';

export interface AnimatedTileConfig
{
    animKey: string;
    startFrame: number;
    endFrame: number;
    frameRate: number;
}

export interface BlockingTileMetadata
{
    collisionOffsetY: number;
    collisionHeight: number;
    sortOffsetY: number;
}

export interface DemoBlockingPlacement
{
    x: number;
    y: number;
    blocking: number;
    floating?: number;
}

export const ANIMATED_BASE_TILE_CONFIG: Readonly<Record<number, AnimatedTileConfig>> = {
    [VOID_TILE_INDEX]: { animKey: VOID_ANIM_KEY, startFrame: 24, endFrame: 31, frameRate: 3 },
    [WATER_TILE_INDEX]: { animKey: WATER_ANIM_KEY, startFrame: 8, endFrame: 15, frameRate: 8 },
    [CRYSTAL_TILE_INDEX]: { animKey: CRYSTAL_ANIM_KEY, startFrame: 0, endFrame: 7, frameRate: 9 },
    [LAVA_TILE_INDEX]: { animKey: LAVA_ANIM_KEY, startFrame: 32, endFrame: 39, frameRate: 2 },
};

export const ANIMATED_TILE_OVERRIDES: Readonly<Record<number, string>> = {
    [VOID_TILE_INDEX]: VOID_ANIM_KEY,
    [WATER_TILE_INDEX]: WATER_ANIM_KEY,
    [CRYSTAL_TILE_INDEX]: CRYSTAL_ANIM_KEY,
    [LAVA_TILE_INDEX]: LAVA_ANIM_KEY,
};

export const DEFAULT_BLOCKING_TILE_METADATA: Readonly<BlockingTileMetadata> = {
    collisionOffsetY: 34,
    collisionHeight: 18,
    sortOffsetY: 52,
};

export const BLOCKING_TILE_METADATA: Readonly<Record<number, BlockingTileMetadata>> = {
    0: { collisionOffsetY: 30, collisionHeight: 20, sortOffsetY: 50 },
    1: { collisionOffsetY: 30, collisionHeight: 20, sortOffsetY: 50 },
    2: { collisionOffsetY: 32, collisionHeight: 18, sortOffsetY: 52 },
    3: { collisionOffsetY: 32, collisionHeight: 18, sortOffsetY: 52 },
    8: { collisionOffsetY: 38, collisionHeight: 16, sortOffsetY: 56 },
    9: { collisionOffsetY: 38, collisionHeight: 16, sortOffsetY: 56 },
    10: { collisionOffsetY: 38, collisionHeight: 16, sortOffsetY: 56 },
    11: { collisionOffsetY: 38, collisionHeight: 16, sortOffsetY: 56 },
    16: { collisionOffsetY: 36, collisionHeight: 18, sortOffsetY: 54 },
    17: { collisionOffsetY: 36, collisionHeight: 18, sortOffsetY: 54 },
    18: { collisionOffsetY: 40, collisionHeight: 14, sortOffsetY: 58 },
    19: { collisionOffsetY: 40, collisionHeight: 14, sortOffsetY: 58 },
};

export const DEMO_BASE_LAYER: readonly (readonly number[])[] = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 3, 3, 3, 5, 5, 0],
    [0, 3, 4, 4, 5, 7, 0],
    [0, 2, 2, 4, 3, 7, 0],
    [0, 2, 1, 1, 3, 8, 0],
    [0, 6, 6, 9, 9, 8, 0],
    [0, 0, 0, 0, 0, 0, 0],
];

export const DEMO_BORDER_LAYER: readonly (readonly number[])[] = [
    [EMPTY_TILE, 14, 14, 14, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE],
    [13, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, 30,         EMPTY_TILE],
    [13, 10,         15,         EMPTY_TILE, 29,         EMPTY_TILE, 31],
    [9, EMPTY_TILE, 17,         13,         EMPTY_TILE, 15,         31],
    [9, EMPTY_TILE, 8,          6,          EMPTY_TILE, 1,          EMPTY_TILE],
    [25        , 8,          4,          EMPTY_TILE, EMPTY_TILE, 1,          EMPTY_TILE],
    [EMPTY_TILE, 24,         24,         36,         36,         32,         EMPTY_TILE],
];

export const DEMO_DECORATION_LAYER: readonly (readonly number[])[] = [
    [EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE],
    [EMPTY_TILE, 42, 43, 44, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE],
    [EMPTY_TILE, 45, 49, 50, EMPTY_TILE, 0, EMPTY_TILE],
    [EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, 51, 40, 1, EMPTY_TILE],
    [EMPTY_TILE, EMPTY_TILE, 18, 19, 41, EMPTY_TILE, EMPTY_TILE],
    [EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE],
    [EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE, EMPTY_TILE],
];

export const DEMO_BLOCKING_PLACEMENTS: readonly DemoBlockingPlacement[] = [
    { x: 1, y: 1, blocking: 30 },
    { x: 2, y: 1, blocking: EMPTY_TILE, floating: 0 },
    { x: 2, y: 2, blocking: 52 },
    { x: 3, y: 1, blocking: EMPTY_TILE, floating: 3 },
    { x: 3, y: 2, blocking: 55 },
    { x: 5, y: 2, blocking: 15 },
    { x: 4, y: 3, blocking: EMPTY_TILE, floating: 8 },
    { x: 4, y: 4, blocking: 60 },
    { x: 2, y: 4, blocking: 0 },
];

export function getAnimatedTileConfig (tileIndex: number): AnimatedTileConfig | undefined
{
    return ANIMATED_BASE_TILE_CONFIG[tileIndex];
}

export function getBlockingTileMetadata (tileIndex: number): BlockingTileMetadata
{
    return BLOCKING_TILE_METADATA[tileIndex] ?? DEFAULT_BLOCKING_TILE_METADATA;
}

export function toTileKey (x: number, y: number): string
{
    return `${x},${y}`;
}
