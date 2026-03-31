export const TILE_SIZE = 64;

export const BASE_LAYER_DEPTH = 0;
export const ANIMATED_LAYER_DEPTH = 10;
export const DECORATION_LAYER_DEPTH = 20;

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
// -1 no details, 0-39 borders.
// 40-48 crystals, 49-57 mushrooms, 58-72 roks, 73-92 small plants.
export const DETAIL_MAP_DATA: number[][] = [
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,59, 0,-1, 0,68,71,78,79,80,-1,-1,-1,-1],
    [-1,-1,-1, 3,56,-1,-1,70,75,76,77,-1,-1,-1,-1,-1],
    [-1,-1, 9,-1,62,-1,78,-1,81,82,83,-1,-1,-1,-1,-1],
    [-1,-1, 9,-1,61, 6,-1, 6,84,85,86,-1,-1,-1,-1,-1],
    [-1,-1,-1, 8, 8,68, 8,-1,12,87,88,89,90,-1,-1,-1],
    [-1,26,-1,26, 5,-1,-1,-1,13,91,-1,75,77,-1,-1,-1],
    [25,55,54,53,52,27,61,-1,-1,79,81,83,85,-1,-1,-1],
    [25,51,50,-1,55,26,-1,18,13,76,78,80,82,-1,-1,-1],
    [25,54,52,53,51,50,27,-1, 4,84,86,88,90,-1,-1,-1],
    [-1,24,24,24,-1,24,-1,-1,-1,12,19,-1,-1,-1,-1,-1],
    [-1,-1,-1,60,59, 7,-1,-1,-1,29,40,41,42,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,43,44,45,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,46,47,-1,-1,-1,-1],
    [-1,-1,-1,65,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
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
