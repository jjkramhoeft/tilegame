import { CASTING_UNLOCKS, CHEST_STATE, GEAR, POTION, WEAPON } from '../common/common';
import type { Gear, Potion, Weapon } from '../common/common';
import { GameDataManager } from '../common/game-data-manager';
import { CastingUnlocks, Position } from '../common/types';
import { ChestJJK } from '../game-objects/objects/chestJJK';

type ChestContents = {
  gear: Gear;
  weapon: Weapon;
  potion: Potion;
  music: boolean;
};

type ChestCastingUnlock = Extract<keyof typeof CASTING_UNLOCKS, `CHEST${number}`>;

const CHEST_CONTENTS: Record<number, ChestContents> = {
  1: { gear: GEAR.BARE, weapon: WEAPON.NONE, potion: POTION.NONE, music: false },
  2: { gear: GEAR.NONE, weapon: WEAPON.DAGGER, potion: POTION.NONE, music: false },
  3: { gear: GEAR.BASIC, weapon: WEAPON.NONE, potion: POTION.NONE, music: false },
  4: { gear: GEAR.NONE, weapon: WEAPON.STAFF, potion: POTION.NONE, music: false },
  5: { gear: GEAR.NONE, weapon: WEAPON.SWORD, potion: POTION.NONE, music: false },
  6: { gear: GEAR.ARMOR, weapon: WEAPON.NONE, potion: POTION.NONE, music: false },
  7: { gear: GEAR.NONE, weapon: WEAPON.NONE, potion: POTION.FRUIT, music: false },
  8: { gear: GEAR.NONE, weapon: WEAPON.NONE, potion: POTION.NONE, music: true },
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
      return existingChest;
    }

    const contents = CHEST_CONTENTS[chestNumber] ?? {
      gear: GEAR.NONE,
      weapon: WEAPON.NONE,
      potion: POTION.NONE,
      music: false,
    };
    const worldPosition = {
      x: tilePosition.x * this.#tileSize,
      y: tilePosition.y * this.#tileSize + this.#tileSize,
    };

    const chest = new ChestJJK(this.#scene, {
      id: chestNumber,
      tilePosition,
      worldPosition,
      contents: { ...contents },
    }, CHEST_STATE.REVEALED);

    this.#chests.push(chest);
    this.#chestGroup.add(chest);
    GameDataManager.instance.increaseTilesPlaced(getChestCastingUnlock(chestNumber));
    return chest;
  }

  getById(chestId: number | undefined): ChestJJK | undefined {
    const chest = this.#chests.find((candidate) => candidate.id === chestId);
    return chest;
  }

  getAll(): ChestJJK[] {
    return this.#chests;
  }
}