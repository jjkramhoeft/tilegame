import { Earth } from '../../ground/earth';
import { Tile } from '../../ground/tile';
import { WEAPON, GEAR, CHEST_STATE } from '../../common/common';
import { ChestJJK } from '../../game-objects/objects/chestJJK';
import { Position } from '../../common/types';

export function setupDebugBlocking(
    scene: Phaser.Scene,
    earth: Earth,
    firstTilePosition: Position,
): void {

    const x0 = firstTilePosition.x-20;
    const y0 = firstTilePosition.y-5;
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0 }, biome: 1, blocking:0   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0 }, biome: 1, blocking:1   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0 }, biome: 1, blocking:2   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0 }, biome: 1, blocking:3   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0 }, biome: 1, blocking:4   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0 }, biome: 1, blocking:5   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0 }, biome: 1, blocking:6   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0 }, biome: 1, blocking:7   }));
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+2 }, biome: 1, blocking:8   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+2 }, biome: 1, blocking:9   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+2 }, biome: 1, blocking:10   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+2 }, biome: 1, blocking:11   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+2 }, biome: 1, blocking:12   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+2 }, biome: 1, blocking:13   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+2 }, biome: 1, blocking:14   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+2 }, biome: 1, blocking:15   }));
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+4 }, biome: 1, blocking:16   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+4 }, biome: 1, blocking:17   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+4 }, biome: 1, blocking:18   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+4 }, biome: 1, blocking:19   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+4 }, biome: 4, blocking:20   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+4 }, biome: 4, blocking:21   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+4 }, biome: 4, blocking:22   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+4 }, biome: 4, blocking:23   }));

    let debugPathTileOffsets: Position[] = [];
    for (let i = 0; i < 17; i++) {
        debugPathTileOffsets.push({ x: i, y: 1 });
        debugPathTileOffsets.push({ x: i, y: 3 });
        debugPathTileOffsets.push({ x: i, y: 5 });
    }

    debugPathTileOffsets.forEach((offset) => {
        const tile = new Tile({tilenumber: { x: x0 + offset.x, y: y0 + offset.y },biome: 1});
        earth.AddTile(tile);
    });

}
