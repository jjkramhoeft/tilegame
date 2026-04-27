import { ChestDialogInfo } from '../scenes/ui-scene';
import { PLAYER_START_MAX_HEALTH } from './config';
import {
  CUSTOM_EVENTS,
  EVENT_BUS,
  PLAYER_UPDATE_TYPE,
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
  sex: string;
  gear: string;
  weapon: string;
  lastDialogOptionSelected: number;
  lastDialogResultInfo?: ChestDialogInfo;
  languageIsDanish: boolean;
  isDebugMode: boolean;
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
      sex: 'male',
      gear: '',
      weapon: '',
      lastDialogOptionSelected: 0,
      languageIsDanish: false,
      isDebugMode: false,
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
    let powerUpdateType: PlayerUpdateType = PLAYER_UPDATE_TYPE.DECREASE;
    if (power > this.#data.currentPower) {
      powerUpdateType = PLAYER_UPDATE_TYPE.INCREASE;
    }
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
