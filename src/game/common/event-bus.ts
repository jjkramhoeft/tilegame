import * as Phaser from 'phaser';
import type { TextKey } from './texts';

export const EVENT_BUS = new Phaser.Events.EventEmitter();

export const CUSTOM_EVENTS = {
  OPENED_CHEST: 'OPENED_CHEST',
  ENEMY_DESTROYED: 'ENEMY_DESTROYED',
  PLAYER_DEFEATED: 'PLAYER_DEFEATED',
  PLAYER_HEALTH_UPDATED: 'PLAYER_HEALTH_UPDATED',
  PLAYER_POWER_UPDATED: 'PLAYER_POWER_UPDATED',
  PLAYER_PROGRESS_UPDATED: 'PLAYER_PROGRESS_UPDATED',
  LIVING_CREATURES_UPDATED: 'LIVING_CREATURES_UPDATED',
  SHOW_CHEST_DIALOG: 'SHOW_CHEST_DIALOG',
  CHEST_DIALOG_CLOSED: 'CHEST_DIALOG_CLOSED',
  SHOW_NARRATOR_DIALOG: 'SHOW_NARRATOR_DIALOG',
  NARRATOR_DIALOG_CLOSED: 'NARRATOR_DIALOG_CLOSED',
  TILE_PLACED: 'TILE_PLACED',
  FIRST_TREE_PLACED: 'FIRST_TREE_PLACED',
  FIRST_ANIMAL_SPAWNED: 'FIRST_ANIMAL_SPAWNED',
  SHOW_HEALTH_HUD: 'SHOW_HEALTH_HUD',
  SHOW_POWER_HUD: 'SHOW_POWER_HUD',
  SHOW_PROGRESS_HUD: 'SHOW_PROGRESS_HUD',
} as const;

export const PLAYER_UPDATE_TYPE = {
  INCREASE: 'INCREASE',
  DECREASE: 'DECREASE',
} as const;

export type PlayerUpdateType = keyof typeof PLAYER_UPDATE_TYPE;

export type PlayerHealthUpdated = {
  currentHealth: number;
  previousHealth: number;
  type: PlayerUpdateType;
};

export type PlayerPowerUpdated = {
  currentPower: number;
  previousPower: number;
  type: PlayerUpdateType;
};

export type PlayerProgressUpdated = {
  currentProgress: number;
  previousProgress: number;
  type: PlayerUpdateType;
};

export type LivingCreaturesUpdated = {
  currentLivingCreatures: number;
  maxLivingCreaturesThisGame: number;
  previousLivingCreatures: number;
};

export type ProgressionHelpCloseAction = 'close' | 'mainMenu' | 'restart';

export type ProgressionHelpPayload = {
  textKey: TextKey;
  closeAction?: ProgressionHelpCloseAction;
};

export type ProgressionHelpClosed = {
  closeAction: ProgressionHelpCloseAction;
};

export type TilePlacedPayload = {
  tileX: number;
  tileY: number;
  biome: number;
  hasBlocking: boolean;
  hasDecoration: boolean;
};
