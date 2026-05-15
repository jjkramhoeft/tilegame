import type { ChestDialogInfo } from './chest-dialog';
import { DIFFICULTY } from './common';
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

export type PlayerData = {
  currentHealth: number;
  maxHealth: number;
  currentPower: number;
  maxPower: number;
  currentProgress: number;
  maxProgress: number;
  currentLivingCreatures: number;
  maxLivingCreaturesThisGame: number;
  sex: string;
  gear: string;
  weapon: string;
  potion: string;
  lastDialogOptionSelected: number;
  lastDialogResultInfo?: ChestDialogInfo;
  languageIsDanish: boolean;
  isDebugMode: boolean;
  difficulty: string;
};

export class DataManager {
  static #instance: DataManager;

  #data: PlayerData;

  private constructor() {
    this.#data = {
      currentHealth: PLAYER_START_MAX_HEALTH,
      maxHealth: PLAYER_START_MAX_HEALTH,
      currentPower: 1,
      maxPower: 1,
      currentProgress: 0,
      maxProgress: 0,
      currentLivingCreatures: 0,
      maxLivingCreaturesThisGame: 0,
      sex: 'male',
      gear: '',
      weapon: '',
      potion: '',
      lastDialogOptionSelected: 0,
      languageIsDanish: false,
      isDebugMode: false,
      difficulty: DIFFICULTY.EASY,
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
