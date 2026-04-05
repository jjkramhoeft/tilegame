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

export function getBlockingBoxesData(t: Phaser.Tilemaps.Tileset): Map<number, TileCollisionObject> {
    t.tileData = t.tileData || {};

    const blockingData: Map<number, TileCollisionObject> = new Map<number, TileCollisionObject>();
    //rocks
    blockingData.set(0, { x: 8, y: 5, width: 48, height: 52 });
    blockingData.set(1, { x: 8, y: 6, width: 48, height: 50 });
    blockingData.set(2, { x: 9, y: 5, width: 48, height: 52 });
    blockingData.set(3, { x: 7, y: 10, width: 53, height: 46 });
    blockingData.set(4, { x: 4, y: 9, width: 48, height: 52 });
    blockingData.set(5, { x: 8, y: 6, width: 48, height: 52 });
    blockingData.set(6, { x: 8, y: 9, width: 52, height: 47 });
    blockingData.set(7, { x: 32, y: 30, width: 14, height: 11 });

    blockingData.set(8, { x: 20, y: 28, width: 42, height: 34 });
    blockingData.set(9, { x: 16, y: 16, width: 38, height: 32 });
    blockingData.set(10, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(11, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(12, { x: 32, y: 33, width: 18, height: 21 });
    blockingData.set(13, { x: 10, y: 9, width: 40, height: 50 });
    blockingData.set(14, { x: 12, y: 9, width: 35, height: 50 });
    blockingData.set(15, { x: 22, y: 10, width: 38, height: 30 });

    blockingData.set(16, { x: 20, y: 15, width: 33, height: 30 });
    blockingData.set(17, { x: 17, y: 26, width: 29, height: 23 });
    blockingData.set(18, { x: 9, y: 8, width: 19, height: 16 });
    blockingData.set(19, { x: 16, y: 16, width: 13, height: 16 });   
    // forest
    blockingData.set(20, { x: 8, y: 5, width: 48, height: 52 });
    blockingData.set(21, { x: 8, y: 6, width: 48, height: 50 });
    blockingData.set(22, { x: 9, y: 5, width: 48, height: 52 });
    blockingData.set(23, { x: 7, y: 10, width: 53, height: 46 });
    
    blockingData.set(24, { x: 4, y: 9, width: 48, height: 52 });
    blockingData.set(25, { x: 8, y: 6, width: 48, height: 52 });
    blockingData.set(26, { x: 8, y: 9, width: 52, height: 47 });
    blockingData.set(27, { x: 32, y: 30, width: 14, height: 11 });
    blockingData.set(28, { x: 20, y: 28, width: 42, height: 34 });
    blockingData.set(29, { x: 16, y: 16, width: 38, height: 32 });
    blockingData.set(30, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(31, { x: 14, y: 14, width: 40, height: 36 });

    blockingData.set(32, { x: 4, y: 9, width: 48, height: 52 });
    blockingData.set(33, { x: 8, y: 6, width: 48, height: 52 });
    blockingData.set(34, { x: 8, y: 9, width: 52, height: 47 });
    blockingData.set(35, { x: 32, y: 30, width: 14, height: 11 });
    blockingData.set(36, { x: 20, y: 28, width: 42, height: 34 });
    blockingData.set(37, { x: 16, y: 16, width: 38, height: 32 });
    blockingData.set(38, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(39, { x: 14, y: 14, width: 40, height: 36 });
    
    blockingData.set(40, { x: 4, y: 9, width: 48, height: 52 });
    blockingData.set(41, { x: 8, y: 6, width: 48, height: 52 });
    blockingData.set(42, { x: 8, y: 9, width: 52, height: 47 });
    blockingData.set(43, { x: 32, y: 30, width: 14, height: 11 });
    blockingData.set(44, { x: 20, y: 28, width: 42, height: 34 });
    blockingData.set(45, { x: 16, y: 16, width: 38, height: 32 });
    blockingData.set(46, { x: 14, y: 14, width: 40, height: 36 });
    //swamp
    blockingData.set(47, { x: 14, y: 14, width: 40, height: 36 });
    
    blockingData.set(48, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(49, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(50, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(51, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(52, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(53, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(54, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(55, { x: 14, y: 14, width: 40, height: 36 });
    
    blockingData.set(56, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(57, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(58, { x: 14, y: 14, width: 40, height: 36 });
    //crystal
    blockingData.set(59, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(60, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(61, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(62, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(63, { x: 14, y: 14, width: 40, height: 36 });

    blockingData.set(64, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(65, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(66, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(67, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(68, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(69, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(70, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(71, { x: 14, y: 14, width: 40, height: 36 });

    blockingData.set(72, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(73, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(74, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(75, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(76, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(77, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(78, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(79, { x: 14, y: 14, width: 40, height: 36 });
    
    blockingData.set(80, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(81, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(82, { x: 14, y: 14, width: 40, height: 36 });
    blockingData.set(83, { x: 14, y: 14, width: 40, height: 36 });
    // desert 
    blockingData.set(84, { x: 7, y: 27, width: 25, height: 20 });  
    blockingData.set(85, { x: 18, y: 28, width: 20, height: 20 });  
    blockingData.set(86, { x: 26, y: 26, width: 18, height: 20 });  
    blockingData.set(87, { x: 15, y: 26, width: 18, height: 20 });    

    blockingData.set(88, { x: 26, y: 26, width: 12, height: 33 });   
    blockingData.set(89, { x: 16, y: 26, width: 21, height: 20 });    
    blockingData.set(90, { x: 26, y: 26, width: 18, height: 20 });    
    blockingData.set(91, { x: 16, y: 30, width: 30, height: 27 });    
    t.tileData = blockingData as unknown as Record<number, TileCollisionData>;
   return t.tileData as unknown as Map<number, TileCollisionObject>;
}
