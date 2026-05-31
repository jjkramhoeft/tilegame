import type { ChestDialogInfo } from './chest-dialog';
import { CASTING_UNLOCKS, CREATURE_TYPES, DIFFICULTY, GEAR, POTION, SEX, WEAPON } from './common';
import type { Difficulty, Gear, Potion, Sex, Weapon } from './common';
import { ENABLE_LOGGING, LEVEL_UP_TILE_THRESHOLDS, PLAYER_START_MAX_HEALTH } from './config';
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
import { CastingUnlocks, CreatureType, UnlockCriteriaMap, Position } from './types';

export function createEmptyCreaturesEverCreated(): Record<CreatureType, boolean> {
  const result = {} as Record<CreatureType, boolean>;
  for (const type of CREATURE_TYPES) {
    result[type] = false;
  }
  return result;
}

export type PlayerData = {

  sex: Sex;
  gear: Gear;
  weapon: Weapon;

  languageIsDanish: boolean;
  isDebugMode: boolean;
  difficulty: Difficulty;

  potion: Potion;
  currentHealth: number;
  maxHealth: number;

  currentPower: number;
  maxPower: number;
  unlockedSpellCasting: Set<CastingUnlocks>;

  currentProgress: number;
  maxProgress: number;
  startTile: Position;
  gameState: string;

  currentLivingCreatures: number;
  maxLivingCreaturesThisGame: number;
  creaturesEverCreated: Record<CreatureType, boolean>;
  tilesPlaced: Record<CastingUnlocks, number>;

  lastDialogOptionSelected: number;
  lastDialogResultInfo?: ChestDialogInfo;
};

export type NewGameSettings = Pick<PlayerData, 'sex' | 'languageIsDanish' | 'isDebugMode' | 'difficulty'>;

export function createDefaultPlayerData(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    sex: SEX.MALE,
    gear: GEAR.NONE,
    weapon: WEAPON.NONE,

    languageIsDanish: false,
    isDebugMode: false,
    difficulty: DIFFICULTY.EASY,

    potion: POTION.NONE,
    currentHealth: PLAYER_START_MAX_HEALTH,
    maxHealth: PLAYER_START_MAX_HEALTH,

    currentPower: 1,
    maxPower: 1,
    unlockedSpellCasting: new Set<CastingUnlocks>([CASTING_UNLOCKS.ROCK_BASIC]),

    currentProgress: 0,
    maxProgress: 0,
    startTile: { x: 0, y: 0 },
    gameState: 'not-started',

    currentLivingCreatures: 0,
    maxLivingCreaturesThisGame: 0,
    creaturesEverCreated: createEmptyCreaturesEverCreated(),
    tilesPlaced: {} as Record<CastingUnlocks, number>,

    lastDialogOptionSelected: 0,
    lastDialogResultInfo: undefined,
    ...overrides,
  };
}

export class GameDataManager {
  static #instance: GameDataManager;

  #data: PlayerData;
  #totalWeightedTilesPlaced: number = 0;

  #BIG: number = 10;
  #SMALL: number = 4;
  //In this MAP we define how many tiles of each casting unlock needs to be placed before the next unlock(s) is achieved.
  #unlockCriteriaMap: UnlockCriteriaMap = new Map<CastingUnlocks, { requiredAmount: number; nextUnlock: CastingUnlocks[] }>([
    [CASTING_UNLOCKS.ROCK_BASIC, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.ROCK_DECORATION] }],
    [CASTING_UNLOCKS.ROCK_DECORATION, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.ROCK_BLOCKING, CASTING_UNLOCKS.CHEST1] }],
    [CASTING_UNLOCKS.ROCK_BLOCKING, { requiredAmount: this.#SMALL, nextUnlock: [CASTING_UNLOCKS.ROCK_ANIMALS, CASTING_UNLOCKS.DESERT_BASIC] }],
    //ROCK_ANIMALS & CHEST1 has no unlocks after them.
    [CASTING_UNLOCKS.DESERT_BASIC, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.DESERT_DECORATION] }],
    [CASTING_UNLOCKS.DESERT_DECORATION, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.DESERT_BLOCKING, CASTING_UNLOCKS.CHEST2] }],
    [CASTING_UNLOCKS.DESERT_BLOCKING, { requiredAmount: this.#SMALL, nextUnlock: [CASTING_UNLOCKS.DESERT_ANIMALS, CASTING_UNLOCKS.WATER_BASIC, CASTING_UNLOCKS.GRASS_BASIC] }],
    //DESERT_ANIMALS, WATER_BASIC & CHEST2 has no unlocks after them.    
    [CASTING_UNLOCKS.GRASS_BASIC, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.GRASS_DECORATION] }],
    [CASTING_UNLOCKS.GRASS_DECORATION, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.GRASS_BLOCKING, CASTING_UNLOCKS.CHEST3, CASTING_UNLOCKS.GRASS_ANIMALS, CASTING_UNLOCKS.FOREST_BASIC] }],
    //GRASS_BLOCKING, GRASS_ANIMALS & CHEST3 has no unlocks after them.
    [CASTING_UNLOCKS.FOREST_BASIC, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.FOREST_DECORATION] }],
    [CASTING_UNLOCKS.FOREST_DECORATION, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.FOREST_BLOCKING, CASTING_UNLOCKS.CHEST4] }],
    [CASTING_UNLOCKS.FOREST_BLOCKING, { requiredAmount: this.#SMALL, nextUnlock: [CASTING_UNLOCKS.FOREST_ANIMALS, CASTING_UNLOCKS.MOUNTAIN_BASIC, CASTING_UNLOCKS.SWAMP_BASIC] }],
    //FOREST_ANIMALS, MOUNTAIN_BASIC & CHEST4 has no unlocks after them.    
    [CASTING_UNLOCKS.SWAMP_BASIC, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.SWAMP_DECORATION] }],
    [CASTING_UNLOCKS.SWAMP_DECORATION, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.SWAMP_BLOCKING, CASTING_UNLOCKS.CHEST5] }],
    [CASTING_UNLOCKS.SWAMP_BLOCKING, { requiredAmount: this.#SMALL, nextUnlock: [CASTING_UNLOCKS.SWAMP_ANIMALS, CASTING_UNLOCKS.MOUNTAIN_BASIC, CASTING_UNLOCKS.CRYSTAL_BASIC] }],
    //SWAMP_ANIMALS, MOUNTAIN_BASIC & CHEST5 has no unlocks after them.   
    [CASTING_UNLOCKS.CRYSTAL_BASIC, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.CRYSTAL_DECORATION] }],
    [CASTING_UNLOCKS.CRYSTAL_DECORATION, { requiredAmount: this.#BIG, nextUnlock: [CASTING_UNLOCKS.CRYSTAL_BLOCKING, CASTING_UNLOCKS.CHEST6] }],
    [CASTING_UNLOCKS.CRYSTAL_BLOCKING, { requiredAmount: this.#SMALL, nextUnlock: [CASTING_UNLOCKS.CRYSTAL_ANIMALS, CASTING_UNLOCKS.LAVA_BASIC] }],
    //CRYSTAL_ANIMALS, LAVA_BASIC & CHEST6 has no unlocks after them.   
  ]);

  private constructor() {
    this.#data = createDefaultPlayerData();
  }

  public static get instance(): GameDataManager {
    if (!GameDataManager.#instance) {
      GameDataManager.#instance = new GameDataManager();
    }
    return GameDataManager.#instance;
  }

  get data(): PlayerData {
    return { ...this.#data };
  }

  set data(data: PlayerData) {
    this.#data = {
      ...data,
      startTile: { ...data.startTile },
      unlockedSpellCasting: new Set<CastingUnlocks>(data.unlockedSpellCasting ?? [CASTING_UNLOCKS.ROCK_BASIC]),
      creaturesEverCreated: data.creaturesEverCreated ? { ...data.creaturesEverCreated } : createEmptyCreaturesEverCreated(),
      tilesPlaced: data.tilesPlaced ? { ...data.tilesPlaced } : {} as Record<CastingUnlocks, number>,
    };
    if (!this.#data.creaturesEverCreated) {
      this.#data.creaturesEverCreated = createEmptyCreaturesEverCreated();
    }
    if (!this.#data.unlockedSpellCasting) {
      this.#data.unlockedSpellCasting = new Set<CastingUnlocks>([CASTING_UNLOCKS.ROCK_BASIC]);
    }
  }

  public resetForNewGame(settings?: Partial<NewGameSettings>): void {
    const currentData = this.#data;
    this.#totalWeightedTilesPlaced = 0;
    this.#data = createDefaultPlayerData({
      sex: settings?.sex ?? currentData.sex,
      languageIsDanish: settings?.languageIsDanish ?? currentData.languageIsDanish,
      isDebugMode: settings?.isDebugMode ?? currentData.isDebugMode,
      difficulty: settings?.difficulty ?? currentData.difficulty,
    });
  }

  public setStartTile(startTile: Position): void {
    this.#data.startTile = { ...startTile };
  }

  public setGameState(gameState: string): void {
    this.#data.gameState = gameState;
  }

  public setLastDialogOptionSelected(optionIndex: number): void {
    this.#data.lastDialogOptionSelected = optionIndex;
  }

  public setLastDialogResultInfo(info: ChestDialogInfo | undefined): void {
    this.#data.lastDialogResultInfo = info;
  }

  public getLastDialogOptionSelected(): number {
    return this.#data.lastDialogOptionSelected;
  }

  public getLastDialogResultInfo(): ChestDialogInfo | undefined {
    const info = this.#data.lastDialogResultInfo;
    if (!info) {
      return undefined;
    }
    return {
      ...info,
      dialog: {
        ...info.dialog,
        options: [...info.dialog.options],
      },
    };
  }

  public setLanguageIsDanish(languageIsDanish: boolean): void {
    this.#data.languageIsDanish = languageIsDanish;
  }

  public setSex(sex: Sex): void {
    this.#data.sex = sex;
  }

  public setDifficulty(difficulty: Difficulty, isDebugMode: boolean): void {
    this.#data.difficulty = difficulty;
    this.#data.isDebugMode = isDebugMode;
  }

  public getCurrentHealth(): number {
    return this.#data.currentHealth;
  }

  public getMaxHealth(): number {
    return this.#data.maxHealth;
  }

  public getGear(): Gear {
    return this.#data.gear;
  }

  public getWeapon(): Weapon {
    return this.#data.weapon;
  }

  public getPotion(): Potion {
    return this.#data.potion;
  }

  public updatePlayerGear(gear: Gear): void {
    this.#data.gear = gear;
  }

  public updatePlayerWeapon(weapon: Weapon): void {
    this.#data.weapon = weapon;
  }

  public updatePlayerPotion(potion: Potion): void {
    this.#data.potion = potion;
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
    const creaturesEverCreated = this.#data.creaturesEverCreated ?? createEmptyCreaturesEverCreated();
    this.#data.creaturesEverCreated = {
      ...creaturesEverCreated,
      [type]: true,
    };
  }

  public hasEverCreated(type: CreatureType): boolean {
    return this.#data.creaturesEverCreated?.[type] === true;
  }

  public increaseTilesPlaced(castingUnlock: CastingUnlocks | undefined): void {
    if (!castingUnlock) { return; }
    const tilesPlaced = this.#data.tilesPlaced ?? {} as Record<CastingUnlocks, number>;
    this.#data.tilesPlaced = {
      ...tilesPlaced,
      [castingUnlock]: (tilesPlaced[castingUnlock] ?? 0) + 1,
    };

    //test powerlevel for upgrade.
    switch (castingUnlock) {
      case CASTING_UNLOCKS.ROCK_BASIC: this.#totalWeightedTilesPlaced += 1; break;
      case CASTING_UNLOCKS.DESERT_BASIC: this.#totalWeightedTilesPlaced += 1; break;
      case CASTING_UNLOCKS.GRASS_BASIC: this.#totalWeightedTilesPlaced += 1; break;
      case CASTING_UNLOCKS.FOREST_BASIC: this.#totalWeightedTilesPlaced += 1; break;
      case CASTING_UNLOCKS.SWAMP_BASIC: this.#totalWeightedTilesPlaced += 1; break;
      case CASTING_UNLOCKS.CRYSTAL_BASIC: this.#totalWeightedTilesPlaced += 1; break;
      case CASTING_UNLOCKS.WATER_BASIC: this.#totalWeightedTilesPlaced += 10; break;
      case CASTING_UNLOCKS.MOUNTAIN_BASIC: this.#totalWeightedTilesPlaced += 10; break;
      case CASTING_UNLOCKS.LAVA_BASIC: this.#totalWeightedTilesPlaced += 10; break;
      case CASTING_UNLOCKS.ROCK_DECORATION: this.#totalWeightedTilesPlaced += 2; break;
      case CASTING_UNLOCKS.DESERT_DECORATION: this.#totalWeightedTilesPlaced += 2; break;
      case CASTING_UNLOCKS.GRASS_DECORATION: this.#totalWeightedTilesPlaced += 2; break;
      case CASTING_UNLOCKS.FOREST_DECORATION: this.#totalWeightedTilesPlaced += 2; break;
      case CASTING_UNLOCKS.SWAMP_DECORATION: this.#totalWeightedTilesPlaced += 2; break;
      case CASTING_UNLOCKS.CRYSTAL_DECORATION: this.#totalWeightedTilesPlaced += 2; break;
      case CASTING_UNLOCKS.ROCK_BLOCKING: this.#totalWeightedTilesPlaced += 3; break;
      case CASTING_UNLOCKS.DESERT_BLOCKING: this.#totalWeightedTilesPlaced += 3; break;
      case CASTING_UNLOCKS.GRASS_BLOCKING: this.#totalWeightedTilesPlaced += 3; break;
      case CASTING_UNLOCKS.FOREST_BLOCKING: this.#totalWeightedTilesPlaced += 3; break;
      case CASTING_UNLOCKS.SWAMP_BLOCKING: this.#totalWeightedTilesPlaced += 3; break;
      case CASTING_UNLOCKS.CRYSTAL_BLOCKING: this.#totalWeightedTilesPlaced += 3; break;
    }
    const levelUpThreshold = LEVEL_UP_TILE_THRESHOLDS[this.#data.currentPower];
    const debugDivider = GameDataManager.instance.data.isDebugMode ? 10 : 1;
    if (this.#totalWeightedTilesPlaced >= levelUpThreshold / debugDivider) {
      //Power up player.
      this.updatePlayerCurrentPower(this.#data.currentPower + 1);
    }

    //Test if unlock next is achieved.
    const unlockCriteria = this.#unlockCriteriaMap.get(castingUnlock);
    if (!unlockCriteria) { return; }
    const nextUnlocks = unlockCriteria?.nextUnlock ?? [];
    if (nextUnlocks.length === 0) { if (ENABLE_LOGGING) { console.log('Nothing to unlock', { castingUnlock }); } return; }
    //Tests if all next unlocks are achieved, if so return softly.
    if (nextUnlocks.every(unlock => this.#data.unlockedSpellCasting.has(unlock))) {
      if (ENABLE_LOGGING) { console.log('Unlocks already achieved', { castingUnlock, nextUnlocks }); }
      return;
    } else {
      if (ENABLE_LOGGING) { console.log('Pending unlocks', { nextUnlocks }); }
    }

    if (unlockCriteria &&
      this.#data.tilesPlaced[castingUnlock] >= unlockCriteria.requiredAmount) {
      const unlockedSpellCasting = new Set(this.#data.unlockedSpellCasting);
      for (const nextUnlock of unlockCriteria.nextUnlock) {
        unlockedSpellCasting.add(nextUnlock);
        if (ENABLE_LOGGING) { console.log(`Unlock achieved: ${nextUnlock}`); }
      }
      this.#data.unlockedSpellCasting = unlockedSpellCasting;
    } else {
      if (ENABLE_LOGGING) { console.log('No unlock', { castingUnlock, tilesPlaced: this.#data.tilesPlaced[castingUnlock], unlockCriteria }); }
    }
  }

  public getTilesPlaced(castingUnlock: CastingUnlocks): number {
    return this.#data.tilesPlaced?.[castingUnlock] ?? 0;
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
