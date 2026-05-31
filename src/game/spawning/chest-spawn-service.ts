import { CASTING_UNLOCKS, CHEST_STATE, GEAR, POTION, WEAPON } from '../common/common';
import { GameDataManager } from '../common/game-data-manager';
import { CastingUnlocks, Position } from '../common/types';
import { ChestJJK } from '../game-objects/objects/chestJJK';

type ChestContents = {
  gear: string;
  weapon: string;
  potion: string;
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
    const contents = CHEST_CONTENTS[chestNumber] ?? {
      gear: GEAR.NONE,
      weapon: WEAPON.NONE,
      potion: POTION.NONE,
    };

    const chest = new ChestJJK(this.#scene, {
      id: chestNumber,
      tilePosition,
      worldPosition: {
        x: tilePosition.x * this.#tileSize,
        y: tilePosition.y * this.#tileSize + this.#tileSize,
      },
      contents: { ...contents },
    }, CHEST_STATE.REVEALED);

    this.#chests.push(chest);
    this.#chestGroup.add(chest);
    GameDataManager.instance.increaseTilesPlaced(getChestCastingUnlock(chestNumber));
    return chest;
  }

  getById(chestId: number | undefined): ChestJJK | undefined {
    return this.#chests.find((chest) => chest.id === chestId);
  }

  getAll(): ChestJJK[] {
    return this.#chests;
  }
}