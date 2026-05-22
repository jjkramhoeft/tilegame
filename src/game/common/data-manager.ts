import type { ChestDialogInfo } from './chest-dialog';
import { BIOME, CREATURE_TYPES, DIFFICULTY } from './common';
import { PLAYER_START_MAX_HEALTH } from './config';
import {
  CUSTOM_EVENTS,
  EVENT_BUS,
  PLAYER_UPDATE_TYPE,
  LivingCreaturesUpdated,
  PlayerHealthUpdated,
  PlayerPowerUpdated,
  PlayerProgressUpdated,
  PlayerUpdateType,
} from './event-bus';
import { CastingUnlocks, CreatureType } from './types';

export function createEmptyCreaturesEverCreated(): Record<CreatureType, boolean> {
  const result = {} as Record<CreatureType, boolean>;
  for (const type of CREATURE_TYPES) {
    result[type] = false;
  }
  return result;
}

export type PlayerData = {

  sex: string;
  gear: string;
  weapon: string;

  languageIsDanish: boolean;
  isDebugMode: boolean;
  difficulty: string;

  potion: string;
  currentHealth: number;
  maxHealth: number;

  currentPower: number;
  maxPower: number;  
  unlockedSpellCasting: Set<CastingUnlocks>;

  currentProgress: number;
  maxProgress: number;

  currentLivingCreatures: number;
  maxLivingCreaturesThisGame: number;
  creaturesEverCreated: Record<CreatureType, boolean>;
  tilesPlaced: Record<BIOME, number>;

  lastDialogOptionSelected: number;
  lastDialogResultInfo?: ChestDialogInfo;
};

export class DataManager {
  static #instance: DataManager;

  #data: PlayerData;

  private constructor() {
    this.#data = {
      sex: 'male',
      gear: '',
      weapon: '',

      languageIsDanish: false,
      isDebugMode: false,
      difficulty: DIFFICULTY.EASY,

      potion: '',
      currentHealth: PLAYER_START_MAX_HEALTH,
      maxHealth: PLAYER_START_MAX_HEALTH,

      currentPower: 1,
      maxPower: 1,
      unlockedSpellCasting: new Set<CastingUnlocks>(),

      currentProgress: 0,
      maxProgress: 0,

      currentLivingCreatures: 0,
      maxLivingCreaturesThisGame: 0,
      creaturesEverCreated: createEmptyCreaturesEverCreated(),
      tilesPlaced: {} as Record<BIOME, number>,

      lastDialogOptionSelected: 0,
      lastDialogResultInfo: undefined
    };
  }

  public static get instance(): DataManager {
    if (!DataManager.#instance) {
      DataManager.#instance = new DataManager();
    }
    return DataManager.#instance;
  }

  get data(): PlayerData {
    return { ...this.#data };
  }

  set data(data: PlayerData) {
    this.#data = { ...data };
    if (!this.#data.creaturesEverCreated) {
      this.#data.creaturesEverCreated = createEmptyCreaturesEverCreated();
    }
    if (!this.#data.unlockedSpellCasting) {
      this.#data.unlockedSpellCasting = new Set<CastingUnlocks>();
    }
  }

  public resetPlayerHealthToMin(): void {
    this.#data.currentHealth = PLAYER_START_MAX_HEALTH;
  }

  public resetLivingCreatureCount(): void {
    this.#updateLivingCreatureCount(0, 0);
  }

  public increaseLivingCreatureCount(): void {
    const currentLivingCreatures = this.#data.currentLivingCreatures + 1;
    this.#updateLivingCreatureCount(
      currentLivingCreatures,
      Math.max(this.#data.maxLivingCreaturesThisGame, currentLivingCreatures),
    );
  }

  public decreaseLivingCreatureCount(): void {
    this.#updateLivingCreatureCount(
      Math.max(0, this.#data.currentLivingCreatures - 1),
      this.#data.maxLivingCreaturesThisGame,
    );
  }

  public markCreatureEverCreated(type: CreatureType): void {
    if (!this.#data.creaturesEverCreated) {
      this.#data.creaturesEverCreated = createEmptyCreaturesEverCreated();
    }
    this.#data.creaturesEverCreated[type] = true;
  }

  public hasEverCreated(type: CreatureType): boolean {
    return this.#data.creaturesEverCreated?.[type] === true;
  } 

  public increaseTilesPlaced(biome: BIOME): void {
    if (!this.#data.tilesPlaced) {
      this.#data.tilesPlaced = {} as Record<BIOME, number>;
    }
    if (!this.#data.tilesPlaced[biome]) {
      this.#data.tilesPlaced[biome] = 0;
    }
    this.#data.tilesPlaced[biome] += 1;
  }

  public getTilesPlaced(biome: BIOME): number {
    return this.#data.tilesPlaced?.[biome] ?? 0;
  }

  #updateLivingCreatureCount(currentLivingCreatures: number, maxLivingCreaturesThisGame: number): void {
    if (
      currentLivingCreatures === this.#data.currentLivingCreatures &&
      maxLivingCreaturesThisGame === this.#data.maxLivingCreaturesThisGame
    ) {
      return;
    }

    const dataToPass: LivingCreaturesUpdated = {
      previousLivingCreatures: this.#data.currentLivingCreatures,
      currentLivingCreatures,
      maxLivingCreaturesThisGame,
    };
    EVENT_BUS.emit(CUSTOM_EVENTS.LIVING_CREATURES_UPDATED, dataToPass);
    this.#data.currentLivingCreatures = currentLivingCreatures;
    this.#data.maxLivingCreaturesThisGame = maxLivingCreaturesThisGame;
  }

  public updatePlayerMaxHealth(max: number): void {
    this.#data.maxHealth = max;
  }

  public updatePlayerCurrentHealth(health: number): void {
    if (health === this.#data.currentHealth) {
      return;
    }
    let healthUpdateType: PlayerUpdateType = PLAYER_UPDATE_TYPE.DECREASE;
    if (health > this.#data.currentHealth) {
      healthUpdateType = PLAYER_UPDATE_TYPE.INCREASE;
    }
    const dataToPass: PlayerHealthUpdated = {
      previousHealth: this.#data.currentHealth,
      currentHealth: health,
      type: healthUpdateType,
    };
    EVENT_BUS.emit(CUSTOM_EVENTS.PLAYER_HEALTH_UPDATED, dataToPass);
    this.#data.currentHealth = health;
  }

  public updatePlayerCurrentPower(power: number): void {
    if (power === this.#data.currentPower) {
      return;
    }
    let powerUpdateType: PlayerUpdateType = PLAYER_UPDATE_TYPE.INCREASE;
    const dataToPass: PlayerPowerUpdated = {
      previousPower: this.#data.currentPower,
      currentPower: power,
      type: powerUpdateType,
    };
    EVENT_BUS.emit(CUSTOM_EVENTS.PLAYER_POWER_UPDATED, dataToPass);
    this.#data.currentPower = power;
  }

  public updatePlayerCurrentProgress(progress: number): void {
    if (progress === this.#data.currentProgress) {
      return;
    }
    let progressUpdateType: PlayerUpdateType = PLAYER_UPDATE_TYPE.DECREASE;
    if (progress > this.#data.currentProgress) {
      progressUpdateType = PLAYER_UPDATE_TYPE.INCREASE;
    }
    const dataToPass: PlayerProgressUpdated = {
      previousProgress: this.#data.currentProgress,
      currentProgress: progress,
      type: progressUpdateType,
    };
    EVENT_BUS.emit(CUSTOM_EVENTS.PLAYER_PROGRESS_UPDATED, dataToPass);
    this.#data.currentProgress = progress;
  }
}
