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
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0 }, biome: 1, blocking:0   }));//Rocks    
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
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+4 }, biome: 4, blocking:20   }));//Forest    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+4 }, biome: 4, blocking:21   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+4 }, biome: 4, blocking:22   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+4 }, biome: 4, blocking:23   }));    
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+6 }, biome: 4, blocking:24   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+6 }, biome: 4, blocking:25   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+6 }, biome: 4, blocking:26   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+6 }, biome: 4, blocking:27   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+6 }, biome: 4, blocking:28   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+6 }, biome: 4, blocking:29   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+6 }, biome: 4, blocking:30   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+6 }, biome: 4, blocking:31   })); 
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+8 }, biome: 4, blocking:32   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+8 }, biome: 4, blocking:33   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+8 }, biome: 4, blocking:34   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+8 }, biome: 4, blocking:35   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+8 }, biome: 4, blocking:36   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+8 }, biome: 4, blocking:37   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+8 }, biome: 4, blocking:38   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+8 }, biome: 4, blocking:39   }));
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+10 }, biome: 4, blocking:40   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+10 }, biome: 4, blocking:41   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+10 }, biome: 4, blocking:42   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+10 }, biome: 4, blocking:43   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+10 }, biome: 4, blocking:44   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+10 }, biome: 4, blocking:45   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+10 }, biome: 4, blocking:46   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+10 }, biome: 6, blocking:47   }));//Swamp (Mushroom)
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+12 }, biome: 6, blocking:48   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+12 }, biome: 6, blocking:49   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+12 }, biome: 6, blocking:50   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+12 }, biome: 6, blocking:51   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+12 }, biome: 6, blocking:52   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+12 }, biome: 6, blocking:53   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+12 }, biome: 6, blocking:54   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+12 }, biome: 6, blocking:55   }));
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+14 }, biome: 6, blocking:56   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+14 }, biome: 6, blocking:57   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+14 }, biome: 6, blocking:58   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+14 }, biome: 7, blocking:59   }));//Crystal
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+14 }, biome: 7, blocking:60   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+14 }, biome: 7, blocking:61   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+14 }, biome: 7, blocking:62   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+14 }, biome: 7, blocking:63   }));
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+16 }, biome: 7, blocking:64   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+16 }, biome: 7, blocking:65   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+16 }, biome: 7, blocking:66   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+16 }, biome: 7, blocking:67   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+16 }, biome: 7, blocking:68   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+16 }, biome: 7, blocking:69   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+16 }, biome: 7, blocking:70   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+16 }, biome: 7, blocking:71   }));
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+18 }, biome: 7, blocking:72   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+18 }, biome: 7, blocking:73   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+18 }, biome: 7, blocking:74   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+18 }, biome: 7, blocking:75   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+18 }, biome: 7, blocking:76   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+18 }, biome: 7, blocking:77   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+18 }, biome: 7, blocking:78   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+18 }, biome: 7, blocking:79   }));
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+20 }, biome: 7, blocking:80   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+20 }, biome: 7, blocking:81   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+20 }, biome: 7, blocking:82   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+20 }, biome: 7, blocking:83   }));
    earth.AddTile(new Tile({tilenumber: { x: x0+8, y: y0+20 }, biome: 2, blocking:84   }));// Desert    
    earth.AddTile(new Tile({tilenumber: { x: x0+10, y: y0+20 }, biome: 2, blocking:85   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+12, y: y0+20 }, biome: 2, blocking:86   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+14, y: y0+20 }, biome: 2, blocking:87   }));    
    
    earth.AddTile(new Tile({tilenumber: { x: x0, y: y0+22 }, biome: 2, blocking:86   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+2, y: y0+22 }, biome: 2, blocking:87   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+4, y: y0+22 }, biome: 2, blocking:88   }));    
    earth.AddTile(new Tile({tilenumber: { x: x0+6, y: y0+22 }, biome: 2, blocking:89   }));

    //R0ck path
    let debugPathTile: Position[] = [];
    for (let dx = -1; dx < 16; dx++) {
        debugPathTile.push({ x: dx+x0, y: y0-1 });
        debugPathTile.push({ x: dx+x0, y: y0+1 });
        debugPathTile.push({ x: dx+x0, y: y0+3 });
    }
    for (let dx = -1; dx < 16; dx+=2) {
        debugPathTile.push({ x: dx+x0, y: y0 });
        debugPathTile.push({ x: dx+x0, y: y0+2 });
        debugPathTile.push({ x: dx+x0, y: y0+4 });
    }
    debugPathTile.forEach((p) => {
        const tile = new Tile({tilenumber: { x: p.x, y: p.y },biome: 1});
        earth.AddTile(tile);
    });
    //Forest path
    debugPathTile = [];
    for (let dx = -1; dx < 16; dx++) {
        debugPathTile.push({ x: dx+x0, y: y0+5 });
        debugPathTile.push({ x: dx+x0, y: y0+7 });
        debugPathTile.push({ x: dx+x0, y: y0+9 });
    }
    for (let dx = -1; dx < 16; dx+=2) {
        debugPathTile.push({ x: dx+x0, y: y0+6});
        debugPathTile.push({ x: dx+x0, y: y0+8 });
        debugPathTile.push({ x: dx+x0, y: y0+10 });
    }
    debugPathTile.forEach((p) => {
        const tile = new Tile({tilenumber: { x: p.x, y: p.y },biome: 4});
        earth.AddTile(tile);
    });
    //Swamp path
    debugPathTile = [];
    for (let dx = -1; dx < 16; dx++) {
        debugPathTile.push({ x: dx+x0, y: y0+11 });
        debugPathTile.push({ x: dx+x0, y: y0+13 });
    }
    for (let dx = -1; dx < 16; dx+=2) {
        debugPathTile.push({ x: dx+x0, y: y0+12});
    }
    debugPathTile.forEach((p) => {
        const tile = new Tile({tilenumber: { x: p.x, y: p.y },biome: 6});
        earth.AddTile(tile);
    });
    //Crystal path
    debugPathTile = [];    
    for (let dx = -1; dx < 16; dx++) {
        debugPathTile.push({ x: dx+x0, y: y0+15 });
        debugPathTile.push({ x: dx+x0, y: y0+17 });
        debugPathTile.push({ x: dx+x0, y: y0+19 });
    }
    for (let dx = -1; dx < 16; dx+=2) {
        debugPathTile.push({ x: dx+x0, y: y0+14});
        debugPathTile.push({ x: dx+x0, y: y0+16});
        debugPathTile.push({ x: dx+x0, y: y0+18});
    }
    debugPathTile.forEach((p) => {
        const tile = new Tile({tilenumber: { x: p.x, y: p.y },biome: 7});
        earth.AddTile(tile);
    });
    // Desert path
    debugPathTile = [];
    for (let dx = -1; dx < 16; dx++) {
        debugPathTile.push({ x: dx+x0, y: y0+21 });
        debugPathTile.push({ x: dx+x0, y: y0+23 });
    }
    for (let dx = -1; dx < 16; dx+=2) {
        debugPathTile.push({ x: dx+x0, y: y0+20});
        debugPathTile.push({ x: dx+x0, y: y0+22});
    }
    debugPathTile.forEach((p) => {
        const tile = new Tile({tilenumber: { x: p.x, y: p.y },biome: 1});
        earth.AddTile(tile);
    });

}
