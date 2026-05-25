import { Earth } from '../../ground/earth';
import { Tile } from '../../ground/tile';
import { WEAPON, GEAR, CHEST_STATE, POTION } from '../../common/common';
import { ChestJJK } from '../../game-objects/objects/chestJJK';
import { Position } from '../../common/types';

export function setupDebugChests(
    earth: Earth,
    firstTilePosition: Position,
    placeChest: (position: Position, chestNumber: number) => void,
): void {

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
        { x: -1, y: 0 }, { x: 1, y: 0 },
        { x: -1, y: 1 }, { x: 1, y: 1 },
        { x: -2, y: 2 }, { x: 2, y: 2 },
        { x: -3, y: 3 }, { x: 3, y: 3 },
        { x: -2, y: 4 }, { x: -1, y: 4 }, { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 },
    ];

    debugTileOffsets.forEach((offset) => {
        let debugChestNumber = undefined;
        if (offset.y === -3) {
            if (offset.x === -2) { debugChestNumber = 1; }
            if (offset.x === 0) { debugChestNumber = 2; }
            if (offset.x === 2) { debugChestNumber = 3; }
        } else if (offset.y === 3) {
            if (offset.x === -2) { debugChestNumber = 4; }
            if (offset.x === 0) { debugChestNumber = 5; }
            if (offset.x === 2) { debugChestNumber = 6; }
        }
        if (debugChestNumber !== undefined) {
            earth.AddTile(new Tile({
                tilenumber: { x: firstTilePosition.x + offset.x, y: firstTilePosition.y + offset.y },
                biome: 1,
            }));
            placeChest({ x: firstTilePosition.x + offset.x, y: firstTilePosition.y + offset.y }, debugChestNumber);
        } else {
            earth.AddTile(new Tile({
                tilenumber: { x: firstTilePosition.x + offset.x, y: firstTilePosition.y + offset.y },
                biome: 1,
            }));
        }
    });

    debugVoidBorderTileOffsets.forEach((offset) => {
        const tile = new Tile({
            tilenumber: { x: firstTilePosition.x + offset.x, y: firstTilePosition.y + offset.y },
            biome: 0,
        });
        earth.AddTile(tile);
    });
}

/** @deprecated  */
export function addChest(position: Position, scene: Phaser.Scene, chests: ChestJJK[], chestGroup: Phaser.GameObjects.Group, chestNumber: number) {
    let chestGear: string = GEAR.NONE;
    let chestWeapon: string = WEAPON.NONE;
    let chestPotion: string = POTION.NONE;
    switch (chestNumber) {
        case 1:
            chestGear = GEAR.BARE;
            break;
        case 2:
            chestWeapon = WEAPON.DAGGER;            
            break;
        case 3:
            chestGear = GEAR.BASIC;            
            break;
        case 4:
            chestWeapon = WEAPON.STAFF;
            break;
        case 5:            
            chestWeapon = WEAPON.SWORD;
            break;
        case 6:            
            chestGear = GEAR.ARMOR;
            break;
        case 7:            
            chestPotion = POTION.FRUIT;
            break;
    }

    const chest = new ChestJJK(scene, {
        id: chestNumber,
        tilePosition: position,
        worldPosition: { x: position.x * 64, y: position.y * 64 + 64 },
        contents: {
            gear: chestGear,
            weapon: chestWeapon,
            potion: chestPotion,
        }
    }, CHEST_STATE.REVEALED);
    chests.push(chest);
    chestGroup.add(chest);
}

