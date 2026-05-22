import * as Phaser from 'phaser';
import { CHARACTER_ANIMATIONS } from './assets';
import { CASTING_UNLOCKS, CHEST_STATE, CREATURE_TYPES, DIRECTION, INTERACTIVE_OBJECT_TYPE, } from './common';

export type CharacterAnimation = keyof typeof CHARACTER_ANIMATIONS;

export type Position = {
  x: number;
  y: number;
  atBorder?: boolean;
};

export type GameObject2 = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

export type Direction = keyof typeof DIRECTION;

export type ChestState = keyof typeof CHEST_STATE;

export type InteractiveObjectType = keyof typeof INTERACTIVE_OBJECT_TYPE;

export interface CustomGameObject {
  enableObject(): void;
  disableObject(): void;
}

export type CreatureType = (typeof CREATURE_TYPES)[number];

export type CastingUnlocks = keyof typeof CASTING_UNLOCKS;
