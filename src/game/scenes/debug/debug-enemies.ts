import { Spider } from '../../game-objects/enemies/spider';
//import { Wisp } from '../../game-objects/enemies/wisp';

export function spawnDebugEnemies(
    scene: Phaser.Scene,
    enemyGroup: Phaser.GameObjects.Group,
): void {
    const spider = new Spider({
        scene: scene,
        position: { x: 32000 + 75, y: 32000 - 180 },
    });
    spider.enableObject();
    enemyGroup.add(spider);

    
    const spider2 = new Spider({
        scene: scene,
        position: { x: 32000 - 50, y: 32000 + 220 },
    });
    spider2.enableObject();
    enemyGroup.add(spider2);
    
    /*
    const wisp = new Wisp({
        scene: scene,
        position: { x: 32000 + 200, y: 32000 + 250 },
    });
    wisp.enableObject();
    enemyGroup.add(wisp);
    */
}
