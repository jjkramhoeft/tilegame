export const TILE_SIZE = 64;

export const WATER_TILE_INDEX = 5;
export const LAVA_TILE_INDEX = 9;

export const WATER_ANIM_KEY = 'water-flow';
export const LAVA_ANIM_KEY = 'lava-flow';

/** Tile indexes that are replaced by animated sprites (excluded from the static tilemap layer). */
export const ANIMATED_TILE_OVERRIDES: Readonly<Record<number, string>> = {
    [WATER_TILE_INDEX]: WATER_ANIM_KEY,
    [LAVA_TILE_INDEX]: LAVA_ANIM_KEY,
};

export const MAP_DATA: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 9, 9, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 5, 5, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3, 3, 3, 4, 4, 0],
    [0, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3, 3, 3, 4, 4, 0],
    [0, 6, 6, 6, 6, 1, 1, 1, 1, 3, 3, 3, 3, 0, 0, 0],
    [0, 6, 6, 6, 6, 1, 1, 1, 1, 3, 3, 3, 3, 0, 0, 0],
    [0, 6, 6, 6, 6, 6, 4, 4, 4, 3, 3, 3, 3, 0, 0, 0],
    [0,10,10, 1, 1, 4, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0],
    [0,10,10, 1, 1, 4, 4, 4, 4, 4, 7, 7, 7, 0, 0, 0],
    [0,10,10, 1, 1, 4, 4, 4, 4, 4, 7, 7, 7, 0, 0, 0],
    [0, 9, 9, 1, 1, 4, 4, 4, 4, 4, 7, 7, 7, 0, 0, 0],
    [0, 9, 9, 1, 1, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
