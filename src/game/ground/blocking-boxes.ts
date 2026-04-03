export interface TileCollisionObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TileCollisionData {
    objectgroup?: {
        objects?: TileCollisionObject[];
    };
}

export function getBlockingBoxesData(tileset: Phaser.Tilemaps.Tileset): Record<number, TileCollisionData> {

    const blockingData: Map<number, TileCollisionObject> = new Map<number, TileCollisionObject>();
    blockingData.set(0, { x: 8, y: 5, width: 48, height: 52 });
    blockingData.set(1, { x: 8, y: 6, width: 48, height: 50 });
    blockingData.set(2, { x: 9, y: 5, width: 48, height: 52 });
    blockingData.set(3, { x: 5, y: 4, width: 55, height: 54 });
    blockingData.set(4, { x: 6, y: 5, width: 48, height: 52 });
    blockingData.set(5, { x: 8, y: 6, width: 48, height: 52 });
    blockingData.set(6, { x: 5, y: 4, width: 55, height: 54 });
    blockingData.set(7, { x: 32, y: 25, width: 14, height: 11 });
    blockingData.set(8, { x: 20, y: 20, width: 42, height: 34 });
    blockingData.set(9, { x: 16, y: 16, width: 38, height: 32 });
    blockingData.set(12, { x: 22, y: 20, width: 18, height: 22 });
    blockingData.set(15, { x: 20, y: 10, width: 38, height: 30 });
    blockingData.set(18, { x: 8, y: 8, width: 16, height: 16 });
    blockingData.set(19, { x: 16, y: 16, width: 16, height: 16 });

    return (tileset.tileData || {}) as Record<number, TileCollisionData>;
}
