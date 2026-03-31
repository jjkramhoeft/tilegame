export const TILE_SIZE = 64;

export const BASE_LAYER_DEPTH = 0;
export const ANIMATED_LAYER_DEPTH = 10;
export const DETAIL_LAYER_DEPTH = 20;

export const WATER_TILE_INDEX = 5;
export const LAVA_TILE_INDEX = 8;

export const WATER_ANIM_KEY = 'water-flow';
export const LAVA_ANIM_KEY = 'lava-flow';

/** Tile indexes that are replaced by animated sprites (excluded from the static tilemap layer). */
export const ANIMATED_TILE_OVERRIDES: Readonly<Record<number, string>> = {
    [WATER_TILE_INDEX]: WATER_ANIM_KEY,
    [LAVA_TILE_INDEX]: LAVA_ANIM_KEY,
};
// 0 void, 1 rock, 2 desert, 3 grass, 4 forest, 5 water, 6 swamp, 7 crystal, 8 lava, 9 mountain. detail overlay
export const MAP_DATA: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 8, 8, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 5, 5, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3, 3, 3, 4, 4, 0],
    [0, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3, 3, 3, 4, 4, 0],
    [0, 6, 6, 6, 6, 1, 1, 1, 1, 3, 3, 3, 3, 0, 0, 0],
    [0, 6, 6, 6, 6, 1, 1, 1, 1, 3, 3, 3, 3, 0, 0, 0],
    [0, 6, 6, 6, 6, 6, 4, 4, 4, 3, 3, 3, 3, 0, 0, 0],
    [0, 9, 9, 1, 1, 4, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0],
    [0, 9, 9, 1, 1, 4, 4, 4, 4, 4, 7, 7, 7, 0, 0, 0],
    [0, 9, 9, 1, 1, 4, 4, 4, 4, 4, 7, 7, 7, 0, 0, 0],
    [0, 8, 8, 1, 1, 4, 4, 4, 4, 4, 7, 7, 7, 0, 0, 0],
    [0, 8, 8, 1, 1, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
// -1 no details, 0-7 crystals, 8-15 mushrooms, 16-31 roks, 32-52 small plants.
export const DETAIL_MAP_DATA: number[][] = [
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,19,-1,-1,-1,28,31,38,39,40,-1,-1,-1,-1],
    [-1,-1,-1,-1,16,-1,-1,30,35,36,37,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,22,-1,38,-1,41,42,43,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,21,-1,-1,-1,44,45,46,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,28,-1,-1,-1,47,48,49,50,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,51,-1,35,37,-1,-1,-1],
    [-1,15,14,13,12,-1,21,-1,-1,39,41,43,45,-1,-1,-1],
    [-1,11,10,-1,15,-1,-1,-1,-1,36,38,40,42,-1,-1,-1],
    [-1,14,12,13,11,10,-1,-1,-1,44,46,48,50,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,20,19,-1,-1,-1,-1,-1, 0, 1, 2,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 3, 4, 5,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 6, 7,-1,-1,-1,-1],
    [-1,-1,-1,25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
];

export function validateLayerDimensions (baseLayerData: number[][], overlayLayerData: number[][], overlayName: string): void
{
    if (baseLayerData.length !== overlayLayerData.length) {
        throw new Error(`${overlayName} row count must match the base layer.`);
    }

    for (let rowIndex = 0; rowIndex < baseLayerData.length; rowIndex++) {
        if (baseLayerData[rowIndex].length !== overlayLayerData[rowIndex].length) {
            throw new Error(`${overlayName} width mismatch at row ${rowIndex}.`);
        }
    }
}
