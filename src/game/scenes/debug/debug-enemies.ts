import { BIOME } from '../../common/common';
import { Position } from '../../common/types';
import { Spider } from '../../game-objects/enemies/spider';
import { Lamb } from '../../game-objects/enemies/lamb';
import { Chicken } from '../../game-objects/enemies/chicken';
import { Earth } from '../../ground/earth';
import { Tile } from '../../ground/tile';
import { DataManager } from '../../common/data-manager';
//import { Wisp } from '../../game-objects/enemies/wisp';

export function spawnDebugEnemies(
    scene: Phaser.Scene,
    enemyGroup: Phaser.GameObjects.Group,
    critterGroup: Phaser.GameObjects.Group,
    earth: Earth,
    firstTilePosition: Position,
): void {
    
    const spider = new Spider({
        scene: scene,
        position: { x: 32000 + 75, y: 32000 - 180 },
    });
    spider.enableObject();
    enemyGroup.add(spider);
    DataManager.instance.increaseLivingCreatureCount();


    const spider2 = new Spider({
        scene: scene,
        position: { x: 32000 - 50, y: 32000 + 220 },
    });
    spider2.enableObject();
    enemyGroup.add(spider2);
    DataManager.instance.increaseLivingCreatureCount();
    
    // A third spider, added on a empty tile away from chests and the player.
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 3), y: (firstTilePosition.y) }, biome: BIOME.ROCK }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 2), y: (firstTilePosition.y) }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 4), y: (firstTilePosition.y) }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 3), y: (firstTilePosition.y-1) }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 3), y: (firstTilePosition.y+1) }, biome: BIOME.VOID }));

    const spider3 = new Spider({
        scene: scene,
        position: { x: 32000 + 230, y: 32000+20 },
    });
    spider3.enableObject();
    enemyGroup.add(spider3);
    DataManager.instance.increaseLivingCreatureCount();

    // A lamb, added on a empty tile away from chests and the player.
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 5), y: (firstTilePosition.y) }, biome: BIOME.ROCK }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 6), y: (firstTilePosition.y) }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 5), y: (firstTilePosition.y-1) }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 5), y: (firstTilePosition.y+1) }, biome: BIOME.VOID }));
    const lamb = new Lamb({
        scene: scene,
        position: { x: 32000 + 350, y: 32000 +40 },
    });
    lamb.enableObject();
    critterGroup.add(lamb);
    DataManager.instance.increaseLivingCreatureCount();

    // A Chicken, added on a empty tile away from chests and the player.
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 5), y: (firstTilePosition.y-2) }, biome: BIOME.ROCK }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 6), y: (firstTilePosition.y-2) }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 4), y: (firstTilePosition.y-2) }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 5), y: (firstTilePosition.y-3) }, biome: BIOME.VOID }));
    earth.AddTile(new Tile({ tilenumber: { x: (firstTilePosition.x + 5), y: (firstTilePosition.y-1) }, biome: BIOME.VOID }));
    const chicken = new Chicken({
        scene: scene,
        position: { x: 32000 + 350, y: 32000 - 90 },
    });
    chicken.enableObject();
    critterGroup.add(chicken);
    DataManager.instance.increaseLivingCreatureCount();

    /*
    const wisp = new Wisp({
        scene: scene,
        position: { x: 32000 + 200, y: 32000 + 250 },
    });
    wisp.enableObject();
    enemyGroup.add(wisp);
    DataManager.instance.increaseLivingCreatureCount();
    */
}
