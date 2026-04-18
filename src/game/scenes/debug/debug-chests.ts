import { Earth } from '../../ground/earth';
import { Tile } from '../../ground/tile';
import { WEAPON, GEAR, CHEST_STATE } from '../../common/common';
import { ChestJJK } from '../../game-objects/objects/chestJJK';
import { Position } from '../../common/types';

export function setupDebugChests(
    scene: Phaser.Scene,
    earth: Earth,
    firstTilePosition: Position,
    chestGroup: Phaser.GameObjects.Group,
): ChestJJK[] {
    const chests: ChestJJK[] = [];

    const chest1Tile = new Tile({
        tilenumber: { x: firstTilePosition.x + 2, y: firstTilePosition.y },
        biome: 1,
        chest: 1,
    });
    earth.AddTile(chest1Tile);
    chests.push(new ChestJJK(scene, {
        id: 1,
        tilePosition: { x: chest1Tile.tileX, y: chest1Tile.tileY },
        worldPosition: { x: chest1Tile.tileX * 64, y: chest1Tile.tileY * 64 + 64 },
        contents: {
            gear: GEAR.BASIC,
            weapon: WEAPON.DAGGER,
        }
    }, CHEST_STATE.REVEALED));
    chestGroup.add(chests[0]);

    const chest2Tile = new Tile({
        tilenumber: { x: firstTilePosition.x + 3, y: firstTilePosition.y + 3 },
        biome: 1,
        chest: 2,
    });
    earth.AddTile(chest2Tile);
    chests.push(new ChestJJK(scene, {
        id: 2,
        tilePosition: { x: chest2Tile.tileX, y: chest2Tile.tileY },
        worldPosition: { x: chest2Tile.tileX * 64, y: chest2Tile.tileY * 64 + 64 },
        contents: {
            gear: GEAR.NONE,
            weapon: WEAPON.STAFF,
        }
    }, CHEST_STATE.REVEALED));
    chestGroup.add(chests[1]);

    return chests;
}
