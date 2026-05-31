import * as Phaser from 'phaser';
import { BIOME } from '../common/common';
import { GameDataManager } from '../common/game-data-manager';
import { CreatureType, Position } from '../common/types';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { Bull } from '../game-objects/enemies/bull';
import { Calf } from '../game-objects/enemies/calf';
import { Chicken } from '../game-objects/enemies/chicken';
import { Lamb } from '../game-objects/enemies/lamb';
import { Piglet } from '../game-objects/enemies/piglet';
import { Rooster } from '../game-objects/enemies/rooster';
import { Sheep } from '../game-objects/enemies/sheep';
import { Snake } from '../game-objects/enemies/snake';
import { Spider } from '../game-objects/enemies/spider';
import { Turkey } from '../game-objects/enemies/turkey';
import { Plant } from '../game-objects/enemies/plant';

type CreatureGroupKind = 'enemy' | 'critter';

type CreatureSpawnOption = {
  type: CreatureType;
  group: CreatureGroupKind;
  create: (scene: Phaser.Scene, position: Position) => CharacterGameObject;
};

const ANIMALS_BY_BIOME: Partial<Record<BIOME, CreatureSpawnOption[]>> = {
  [BIOME.ROCK]: [
    { type: 'spider', group: 'enemy', create: (scene, position) => new Spider({ scene, position }) },
  ],
  [BIOME.DESERT]: [
    { type: 'snake', group: 'enemy', create: (scene, position) => new Snake({ scene, position }) },
  ],
  [BIOME.GRASS]: [
    { type: 'chicken', group: 'critter', create: (scene, position) => new Chicken({ scene, position }) },
    { type: 'lamb', group: 'critter', create: (scene, position) => new Lamb({ scene, position }) },
    { type: 'sheep', group: 'critter', create: (scene, position) => new Sheep({ scene, position }) },
    { type: 'rooster', group: 'critter', create: (scene, position) => new Rooster({ scene, position }) },
    { type: 'bull', group: 'critter', create: (scene, position) => new Bull({ scene, position }) },
    { type: 'calf', group: 'critter', create: (scene, position) => new Calf({ scene, position }) },
  ],
  [BIOME.FOREST]: [
    { type: 'turkey', group: 'critter', create: (scene, position) => new Turkey({ scene, position }) },
    { type: 'piglet', group: 'critter', create: (scene, position) => new Piglet({ scene, position }) },
    { type: 'spider', group: 'enemy', create: (scene, position) => new Spider({ scene, position }) },
  ],
  [BIOME.SWAMP]: [
    { type: 'spider', group: 'enemy', create: (scene, position) => new Spider({ scene, position }) },
    { type: 'plant', group: 'enemy', create: (scene, position) => new Plant({ scene, position }) },
  ],
  [BIOME.CRYSTAL]: [
    { type: 'spider', group: 'enemy', create: (scene, position) => new Spider({ scene, position }) },
  ],
};

export class AnimalSpawnService {
  readonly #scene: Phaser.Scene;
  readonly #enemyGroup: Phaser.GameObjects.Group;
  readonly #critterGroup: Phaser.GameObjects.Group;
  readonly #tileSize: number;

  constructor(
    scene: Phaser.Scene,
    enemyGroup: Phaser.GameObjects.Group,
    critterGroup: Phaser.GameObjects.Group,
    tileSize: number,
  ) {
    this.#scene = scene;
    this.#enemyGroup = enemyGroup;
    this.#critterGroup = critterGroup;
    this.#tileSize = tileSize;
  }

  spawnForBiome(tilePosition: Position, biome: BIOME): CharacterGameObject | undefined {
    const options = ANIMALS_BY_BIOME[biome];
    if (!options || options.length === 0) {
      return undefined;
    }

    const option = Phaser.Utils.Array.GetRandom(options);
    const animal = option.create(this.#scene, this.#getTileCenterPosition(tilePosition));
    animal.enableObject();

    if (option.group === 'enemy') {
      this.#enemyGroup.add(animal);
    } else {
      this.#critterGroup.add(animal);
    }

    GameDataManager.instance.markCreatureEverCreated(option.type);
    GameDataManager.instance.increaseLivingCreatureCount();
    return animal;
  }

  #getTileCenterPosition(tilePosition: Position): Position {
    return {
      x: tilePosition.x * this.#tileSize + this.#tileSize / 2,
      y: tilePosition.y * this.#tileSize + this.#tileSize / 2,
    };
  }
}