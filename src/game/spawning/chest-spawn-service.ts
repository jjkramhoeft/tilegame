import { CASTING_UNLOCKS, CHEST_STATE, GEAR, POTION, WEAPON } from '../common/common';
import { logChestDebug } from '../common/chest-debug';
import type { Gear, Potion, Weapon } from '../common/common';
import { GameDataManager } from '../common/game-data-manager';
import { CastingUnlocks, Position } from '../common/types';
import { ChestJJK } from '../game-objects/objects/chestJJK';

type ChestContents = {
  gear: Gear;
  weapon: Weapon;
  potion: Potion;
};

type ChestCastingUnlock = Extract<keyof typeof CASTING_UNLOCKS, `CHEST${number}`>;

const CHEST_CONTENTS: Record<number, ChestContents> = {
  1: { gear: GEAR.BARE, weapon: WEAPON.NONE, potion: POTION.NONE },
  2: { gear: GEAR.NONE, weapon: WEAPON.DAGGER, potion: POTION.NONE },
  3: { gear: GEAR.BASIC, weapon: WEAPON.NONE, potion: POTION.NONE },
  4: { gear: GEAR.NONE, weapon: WEAPON.STAFF, potion: POTION.NONE },
  5: { gear: GEAR.NONE, weapon: WEAPON.SWORD, potion: POTION.NONE },
  6: { gear: GEAR.ARMOR, weapon: WEAPON.NONE, potion: POTION.NONE },
  7: { gear: GEAR.NONE, weapon: WEAPON.NONE, potion: POTION.FRUIT },
};

function getChestCastingUnlock(chestNumber: number): CastingUnlocks | undefined {
  const key = `CHEST${chestNumber}` as ChestCastingUnlock;
  return CASTING_UNLOCKS[key];
}

export class ChestSpawnService {
  readonly #scene: Phaser.Scene;
  readonly #chestGroup: Phaser.GameObjects.Group;
  readonly #tileSize: number;
  readonly #chests: ChestJJK[] = [];

  constructor(scene: Phaser.Scene, chestGroup: Phaser.GameObjects.Group, tileSize: number) {
    this.#scene = scene;
    this.#chestGroup = chestGroup;
    this.#tileSize = tileSize;
  }

  spawn(tilePosition: Position, chestNumber: number): ChestJJK {
    const existingChest = this.#chests.find((chest) => chest.id === chestNumber);
    if (existingChest !== undefined) {
      logChestDebug('ChestSpawnService blocked duplicate chest spawn', {
        chestNumber,
        requestedTilePosition: tilePosition,
        existingChest: existingChest.debugInfo,
        chestCount: this.#chests.length,
        groupSize: this.#chestGroup.getLength(),
        isDebugMode: GameDataManager.instance.data.isDebugMode,
      });
      return existingChest;
    }

    const contents = CHEST_CONTENTS[chestNumber] ?? {
      gear: GEAR.NONE,
      weapon: WEAPON.NONE,
      potion: POTION.NONE,
    };
    const worldPosition = {
      x: tilePosition.x * this.#tileSize,
      y: tilePosition.y * this.#tileSize + this.#tileSize,
    };
    logChestDebug('ChestSpawnService spawning chest', {
      chestNumber,
      tilePosition,
      worldPosition,
      contents,
      unlock: getChestCastingUnlock(chestNumber),
      existingChestCount: this.#chests.length,
      isDebugMode: GameDataManager.instance.data.isDebugMode,
    });

    const chest = new ChestJJK(this.#scene, {
      id: chestNumber,
      tilePosition,
      worldPosition,
      contents: { ...contents },
    }, CHEST_STATE.REVEALED);

    this.#chests.push(chest);
    this.#chestGroup.add(chest);
    GameDataManager.instance.increaseTilesPlaced(getChestCastingUnlock(chestNumber));
    logChestDebug('ChestSpawnService spawned chest', {
      chest: chest.debugInfo,
      chestCount: this.#chests.length,
      groupSize: this.#chestGroup.getLength(),
    });
    return chest;
  }

  getById(chestId: number | undefined): ChestJJK | undefined {
    const chest = this.#chests.find((candidate) => candidate.id === chestId);
    logChestDebug('ChestSpawnService getById', {
      chestId,
      found: chest?.debugInfo,
      chestCount: this.#chests.length,
    });
    return chest;
  }

  getAll(): ChestJJK[] {
    logChestDebug('ChestSpawnService getAll', { chestCount: this.#chests.length });
    return this.#chests;
  }
}