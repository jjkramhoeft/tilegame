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
    const debugTileOffsets: Position[] = [
        { x: 0, y: -1 },
        { x: -1, y: -2 }, { x: 0, y: -2 }, { x: 1, y: -2 },
        { x: -2, y: -3 }, { x: -1, y: -3 }, { x: 0, y: -3 }, { x: 1, y: -3 }, { x: 2, y: -3 },
        { x: 0, y: 1 },
        { x: -1, y: 2 }, { x: 0, y: 2 }, { x: 1, y: 2 },
        { x: -2, y: 3 }, { x: -1, y: 3 }, { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
    ];
    const debugVoidBorderTileOffsets: Position[] = [
        { x: -2, y: -4 }, { x: -1, y: -4 }, { x: 0, y: -4 }, { x: 1, y: -4 }, { x: 2, y: -4 }, 
        { x: -3, y: -3 }, { x: 3, y: -3 },
        { x: -2, y: -2 }, { x: 2, y: -2 },
        { x: -1, y: -1 }, { x: 1, y: -1 },        
        { x: -1, y: 0 },{ x: 1, y: 0 },        
        { x: -1, y: 1 }, { x: 1, y: 1 },    
        { x: -2, y: 2 }, { x: 2, y: 2 },    
        { x: -3, y: 3 }, { x: 3, y: 3 },        
        { x: -2, y: 4 }, { x: -1, y: 4 }, { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, 
    ];


    debugTileOffsets.forEach((offset) => {
        let chestGear: string = GEAR.NONE;
        let chestWeapon: string = WEAPON.NONE;
        let debugChestNumber = undefined;
        if (offset.y === -3) {
            if (offset.x === -2) { debugChestNumber = 1; chestGear = GEAR.BARE }
            if (offset.x === 0) { debugChestNumber = 2; chestGear = GEAR.BASIC }
            if (offset.x === 2) { debugChestNumber = 3; chestGear = GEAR.ARMOR }
        } else if (offset.y === 3) {
            if (offset.x === -2) { debugChestNumber = 4; chestWeapon = WEAPON.DAGGER }
            if (offset.x === 0) { debugChestNumber = 5; chestWeapon = WEAPON.STAFF }
            if (offset.x === 2) { debugChestNumber = 6; chestWeapon = WEAPON.SWORD }
        }

        const tile = new Tile({
            tilenumber: { x: firstTilePosition.x + offset.x, y: firstTilePosition.y + offset.y },
            biome: 1,
            chest: debugChestNumber,
        });
        earth.AddTile(tile);

        
        if (debugChestNumber !== undefined) {
            const chest = new ChestJJK(scene, {
                id: debugChestNumber,
                tilePosition: { x: tile.tileX, y: tile.tileY },
                worldPosition: { x: tile.tileX * 64, y: tile.tileY * 64 + 64 },
                contents: {
                    gear: chestGear,
                    weapon: chestWeapon,
                }
            }, CHEST_STATE.REVEALED);
            chests.push(chest);
            chestGroup.add(chest);
        }
    });

    debugVoidBorderTileOffsets.forEach((offset) => {
        const tile = new Tile({
            tilenumber: { x: firstTilePosition.x + offset.x, y: firstTilePosition.y + offset.y },
            biome: 0,
        });
        earth.AddTile(tile);
    });

    return chests;
}
