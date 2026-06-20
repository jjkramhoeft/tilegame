import * as Phaser from 'phaser';
import {
  ASSET_KEYS,
  BULL_ANIMATION_KEYS,
  CALF_ANIMATION_KEYS,
  CHICKEN_ANIMATION_KEYS,
  LAMB_ANIMATION_KEYS,
  PIGLET_ANIMATION_KEYS,
  PLANT1_ANIMATION_KEYS,
  PLANT2_ANIMATION_KEYS,
  PLANT3_ANIMATION_KEYS,
  ROOSTER_ANIMATION_KEYS,
  SHEEP_ANIMATION_KEYS,
  LIZARD_ANIMATION_KEYS,
  SKELETON_ANIMATION_KEYS,
  SNAKE_ANIMATION_KEYS,
  SPIN_HUD_ANIMATIONS,
  TURKEY_ANIMATION_KEYS,
} from './assets';
import { GEAR, SEX, WEAPON } from './common';

type AnimationManager = Phaser.Animations.AnimationManager;

type FourDirectionAnimationKeys = {
  WALK_UP: string;
  WALK_LEFT: string;
  WALK_DOWN: string;
  WALK_RIGHT: string;
  IDLE_UP: string;
  IDLE_LEFT: string;
  IDLE_DOWN: string;
  IDLE_RIGHT: string;
};

type PlantAnimationKeys = {
  ATTACK_UP: string;
  ATTACK_DOWN: string;
  ATTACK_LEFT: string;
  ATTACK_RIGHT: string;
  IDLE_UP: string;
  IDLE_DOWN: string;
  IDLE_LEFT: string;
  IDLE_RIGHT: string;
  DEATH_UP: string;
  DEATH_DOWN: string;
  DEATH_LEFT: string;
  DEATH_RIGHT: string;
};

const playerSexes = Object.values(SEX);
const playerGears = Object.values(GEAR);
const playerWeapons = Object.values(WEAPON);

export function createAnimations(scene: Phaser.Scene): void {
  const anims = scene.anims;

  createUiAnimations(anims);
  createAdamAndEveAnimations(anims);
  createMobAnimations(anims);
  createTileAnimations(anims);
  createOtherAnimations(anims);
}

export function createUiAnimations(anims: AnimationManager): void {
  anims.create({
    key: SPIN_HUD_ANIMATIONS.HEARTH,
    frames: anims.generateFrameNumbers(ASSET_KEYS.HUD_ICONS, { start: 9, end: 16 }),
    frameRate: 12,
    repeat: 1,
  });
  anims.create({
    key: SPIN_HUD_ANIMATIONS.POWER,
    frames: anims.generateFrameNumbers(ASSET_KEYS.HUD_ICONS, { start: 0, end: 7 }),
    frameRate: 12,
    repeat: 1,
  });
  anims.create({
    key: SPIN_HUD_ANIMATIONS.PROGRESS,
    frames: anims.generateFrameNumbers(ASSET_KEYS.HUD_ICONS, { start: 18, end: 25 }),
    frameRate: 12,
    repeat: 1,
  });

  //anims.createFromAseprite(ASSET_KEYS.HUD_NUMBERS);
}

export function createAdamAndEveAnimations(anims: AnimationManager): void {
  playerSexes.forEach((sex) => {
    playerGears.forEach((gear) => {
      playerWeapons.forEach((weapon) => {
        anims.create({ key: `${sex}-${gear}-${weapon}-walk-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-walk-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 9, end: 17 }), frameRate: 10, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-walk-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 18, end: 26 }), frameRate: 10, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-walk-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 27, end: 35 }), frameRate: 10, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-swim-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-swim-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 9, end: 17 }), frameRate: 10, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-swim-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 18, end: 26 }), frameRate: 10, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-swim-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-walk`, { start: 27, end: 35 }), frameRate: 10, repeat: -1 });
      });
    });
  });

  playerSexes.forEach((sex) => {
    playerGears.forEach((gear) => {
      [WEAPON.NONE, WEAPON.DAGGER, WEAPON.STAFF].forEach((weapon) => {
        anims.create({ key: `${sex}-${gear}-${weapon}-thrust-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 0, end: 7 }), frameRate: 14, repeat: 1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-thrust-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 8, end: 15 }), frameRate: 14, repeat: 1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-thrust-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 16, end: 23 }), frameRate: 14, repeat: 1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-thrust-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust`, { start: 24, end: 31 }), frameRate: 14, repeat: 1 });
      });

      const weapon = WEAPON.SWORD;
      anims.create({ key: `${sex}-${gear}-${weapon}-thrust-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust128`, { start: 0, end: 5 }), frameRate: 14, repeat: 1 });
      anims.create({ key: `${sex}-${gear}-${weapon}-thrust-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust128`, { start: 6, end: 11 }), frameRate: 14, repeat: 1 });
      anims.create({ key: `${sex}-${gear}-${weapon}-thrust-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust128`, { start: 12, end: 17 }), frameRate: 14, repeat: 1 });
      anims.create({ key: `${sex}-${gear}-${weapon}-thrust-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-thrust128`, { start: 18, end: 23 }), frameRate: 14, repeat: 1 });
    });
  });

  playerSexes.forEach((sex) => {
    playerGears.forEach((gear) => {
      playerWeapons.forEach((weapon) => {
        anims.create({ key: `${sex}-${gear}-${weapon}-idle-up`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 0, end: 1 }), frameRate: 2, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-idle-left`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 2, end: 3 }), frameRate: 2, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-idle-down`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 4, end: 5 }), frameRate: 2, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-idle-right`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-idle`, { start: 6, end: 7 }), frameRate: 2, repeat: -1 });
        anims.create({ key: `${sex}-${gear}-${weapon}-die`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-hurt`, { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
        anims.create({ key: `${sex}-${gear}-${weapon}-hurt`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-hurt`, { start: 0, end: 5 }), frameRate: 12, repeat: 0, yoyo: true });
        anims.create({ key: `${sex}-${gear}-${weapon}-fall`, frames: anims.generateFrameNumbers(`${sex}-${gear}-${weapon}-fall`, { start: 0, end: 3 }), frameRate: 13, repeat: 10 });
      });
    });
  });
}

export function createMobAnimations(anims: AnimationManager): void {
  anims.createFromAseprite(ASSET_KEYS.SPIDER);
  anims.create({
    key: ASSET_KEYS.ENEMY_DEATH,
    frames: anims.generateFrameNumbers(ASSET_KEYS.ENEMY_DEATH),
    frameRate: 6,
    repeat: 0,
    delay: 0,
  });

  createFourDirectionAnimalAnimations(anims, LAMB_ANIMATION_KEYS, ASSET_KEYS.LAMB, 6, 4);
  createFourDirectionAnimalAnimations(anims, CHICKEN_ANIMATION_KEYS, ASSET_KEYS.CHICKEN, 10, 6);
  createFourDirectionAnimalAnimations(anims, SHEEP_ANIMATION_KEYS, ASSET_KEYS.SHEEP, 6, 4);
  createFourDirectionAnimalAnimations(anims, TURKEY_ANIMATION_KEYS, ASSET_KEYS.TURKEY, 6, 4);
  createFourDirectionAnimalAnimations(anims, PIGLET_ANIMATION_KEYS, ASSET_KEYS.PIGLET, 6, 4);
  createFourDirectionAnimalAnimations(anims, ROOSTER_ANIMATION_KEYS, ASSET_KEYS.ROOSTER, 6, 4);
  createFourDirectionAnimalAnimations(anims, CALF_ANIMATION_KEYS, ASSET_KEYS.CALF, 6, 4);
  createFourDirectionAnimalAnimations(anims, BULL_ANIMATION_KEYS, ASSET_KEYS.BULL, 6, 4);

  anims.create({ key: SNAKE_ANIMATION_KEYS.WALK_DOWN, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 0, end: 9 }), frameRate: 6, repeat: -1 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.WALK_UP, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 10, end: 19 }), frameRate: 6, repeat: -1 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.WALK_LEFT, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 20, end: 29 }), frameRate: 6, repeat: -1 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.WALK_RIGHT, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 30, end: 39 }), frameRate: 6, repeat: -1 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.IDLE_DOWN, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 0, end: 9 }), frameRate: 4, repeat: -1 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.IDLE_UP, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 10, end: 19 }), frameRate: 4, repeat: -1 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.IDLE_LEFT, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 20, end: 29 }), frameRate: 4, repeat: -1 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.IDLE_RIGHT, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 30, end: 39 }), frameRate: 4, repeat: -1 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.ATTACK_DOWN, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 40, end: 49 }), frameRate: 10, repeat: 0 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.ATTACK_UP, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 60, end: 69 }), frameRate: 10, repeat: 0 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.ATTACK_LEFT, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 40, end: 49 }), frameRate: 10, repeat: 0 });
  anims.create({ key: SNAKE_ANIMATION_KEYS.ATTACK_RIGHT, frames: anims.generateFrameNumbers(ASSET_KEYS.SNAKE, { start: 50, end: 59 }), frameRate: 10, repeat: 0 });

  createPlantAnimations(anims, PLANT1_ANIMATION_KEYS, ASSET_KEYS.PLANT1_ATTACK, ASSET_KEYS.PLANT1_IDLE, ASSET_KEYS.PLANT1_DEATH);
  createPlantAnimations(anims, PLANT2_ANIMATION_KEYS, ASSET_KEYS.PLANT2_ATTACK, ASSET_KEYS.PLANT2_IDLE, ASSET_KEYS.PLANT2_DEATH);
  createPlantAnimations(anims, PLANT3_ANIMATION_KEYS, ASSET_KEYS.PLANT3_ATTACK, ASSET_KEYS.PLANT3_IDLE, ASSET_KEYS.PLANT3_DEATH);
  
  createSkeletonAnimations(anims);
  createLizardAnimations(anims);
}

export function createTileAnimations(anims: AnimationManager): void {
  anims.create({
    key: 'water-flow',
    frames: anims.generateFrameNumbers(ASSET_KEYS.TILESET_ANIMATED, { start: 8, end: 15 }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: 'lava-flow',
    frames: anims.generateFrameNumbers(ASSET_KEYS.TILESET_ANIMATED, { start: 40, end: 47 }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: 'crystal-flow',
    frames: anims.generateFrameNumbers(ASSET_KEYS.TILESET_ANIMATED, { start: 0, end: 7 }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: 'void-marker-flow',
    frames: anims.generateFrameNumbers(ASSET_KEYS.TILESET_ANIMATED, { start: 24, end: 31 }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: 'void-border-flow',
    frames: anims.generateFrameNumbers(ASSET_KEYS.TILESET_ANIMATED, { start: 32, end: 39 }),
    frameRate: 4,
    repeat: -1,
  });
}

export function createOtherAnimations(anims: AnimationManager): void {
  anims.create({
    key: 'big-tree-growth',
    frames: anims.generateFrameNumbers(ASSET_KEYS.BIG_TREE, { start: 0, end: 5 }),
    frameRate: 3,
    repeat: 0,
  });
  anims.create({
    key: ASSET_KEYS.CAST_ORIGIN,
    frames: anims.generateFrameNumbers(ASSET_KEYS.MAGIC_FX_HOLY_EXPLOSION, { start: 0, end: 27 }),
    frameRate: 48,
    repeat: 0,
  });
  anims.create({
    key: ASSET_KEYS.CAST_TARGET_A,
    frames: anims.generateFrameNumbers(ASSET_KEYS.MAGIC_FX_LIGHT_CAST, { start: 0, end: 27 }),
    frameRate: 48,
    repeat: 0,
  });
  anims.create({
    key: ASSET_KEYS.CAST_TARGET_B,
    frames: anims.generateFrameNumbers(ASSET_KEYS.MAGIC_FX_BLUE_CIRCLE_EXPLOSION, { start: 0, end: 9 }),
    frameRate: 48,
    repeat: 0,
  });
}

function createFourDirectionAnimalAnimations(
  anims: AnimationManager,
  keys: FourDirectionAnimationKeys,
  assetKey: string,
  walkFrameRate: number,
  idleFrameRate: number,
): void {
  anims.create({ key: keys.WALK_UP, frames: anims.generateFrameNumbers(assetKey, { start: 6, end: 11 }), frameRate: walkFrameRate, repeat: -1 });
  anims.create({ key: keys.WALK_LEFT, frames: anims.generateFrameNumbers(assetKey, { start: 12, end: 17 }), frameRate: walkFrameRate, repeat: -1 });
  anims.create({ key: keys.WALK_DOWN, frames: anims.generateFrameNumbers(assetKey, { start: 0, end: 5 }), frameRate: walkFrameRate, repeat: -1 });
  anims.create({ key: keys.WALK_RIGHT, frames: anims.generateFrameNumbers(assetKey, { start: 18, end: 23 }), frameRate: walkFrameRate, repeat: -1 });
  anims.create({ key: keys.IDLE_UP, frames: anims.generateFrameNumbers(assetKey, { start: 6, end: 9 }), frameRate: idleFrameRate, repeat: -1 });
  anims.create({ key: keys.IDLE_LEFT, frames: anims.generateFrameNumbers(assetKey, { start: 12, end: 15 }), frameRate: idleFrameRate, repeat: -1 });
  anims.create({ key: keys.IDLE_DOWN, frames: anims.generateFrameNumbers(assetKey, { start: 0, end: 3 }), frameRate: idleFrameRate, repeat: -1 });
  anims.create({ key: keys.IDLE_RIGHT, frames: anims.generateFrameNumbers(assetKey, { start: 18, end: 21 }), frameRate: idleFrameRate, repeat: -1 });
}

function createPlantAnimations(
  anims: AnimationManager,
  keys: PlantAnimationKeys,
  attackAssetKey: string,
  idleAssetKey: string,
  deathAssetKey: string,
): void {
  anims.create({ key: keys.ATTACK_DOWN, frames: anims.generateFrameNumbers(attackAssetKey, { start: 0, end: 6 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.ATTACK_UP, frames: anims.generateFrameNumbers(attackAssetKey, { start: 7, end: 13 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.ATTACK_LEFT, frames: anims.generateFrameNumbers(attackAssetKey, { start: 14, end: 20 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.ATTACK_RIGHT, frames: anims.generateFrameNumbers(attackAssetKey, { start: 21, end: 27 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.IDLE_DOWN, frames: anims.generateFrameNumbers(idleAssetKey, { start: 0, end: 3 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.IDLE_UP, frames: anims.generateFrameNumbers(idleAssetKey, { start: 4, end: 7 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.IDLE_LEFT, frames: anims.generateFrameNumbers(idleAssetKey, { start: 8, end: 11 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.IDLE_RIGHT, frames: anims.generateFrameNumbers(idleAssetKey, { start: 12, end: 15 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.DEATH_DOWN, frames: anims.generateFrameNumbers(deathAssetKey, { start: 0, end: 9 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.DEATH_UP, frames: anims.generateFrameNumbers(deathAssetKey, { start: 10, end: 19 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.DEATH_LEFT, frames: anims.generateFrameNumbers(deathAssetKey, { start: 20, end: 29 }), frameRate: 3, repeat: -1 });
  anims.create({ key: keys.DEATH_RIGHT, frames: anims.generateFrameNumbers(deathAssetKey, { start: 30, end: 29 }), frameRate: 3, repeat: -1 });
}

function createSkeletonAnimations(
  anims: AnimationManager
): void {
  // Attack rows follow the same UP, LEFT, DOWN, RIGHT order as the walk rows.
  anims.create({ key: SKELETON_ANIMATION_KEYS.ATTACK_UP, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_ATTACK, { start: 0, end: 7 }), frameRate: 9, repeat: 0 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.ATTACK_LEFT, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_ATTACK, { start: 8, end: 15 }), frameRate: 9, repeat: 0 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.ATTACK_DOWN, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_ATTACK, { start: 16, end: 23 }), frameRate: 9, repeat: 0 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.ATTACK_RIGHT, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_ATTACK, { start: 24, end: 31 }), frameRate: 9, repeat: 0 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.WALK_UP, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_MOVE, { start: 0, end: 8 }), frameRate: 8, repeat: -1 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.WALK_LEFT, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_MOVE, { start: 9, end: 17 }), frameRate: 8, repeat: -1 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.WALK_DOWN, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_MOVE, { start: 18, end: 26 }), frameRate: 8, repeat: -1 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.WALK_RIGHT, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_MOVE, { start: 27, end: 35 }), frameRate: 8, repeat: -1 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.IDLE_UP, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_MOVE, { start: 0, end: 0 }), frameRate: 8, repeat: -1 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.IDLE_LEFT, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_MOVE, { start: 9, end: 9 }), frameRate: 8, repeat: -1 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.IDLE_DOWN, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_MOVE, { start: 18, end: 18 }), frameRate: 8, repeat: -1 });
  anims.create({ key: SKELETON_ANIMATION_KEYS.IDLE_RIGHT, frames: anims.generateFrameNumbers(ASSET_KEYS.SKELETON_MOVE, { start: 27, end: 27 }), frameRate: 8, repeat: -1 });
}

function createLizardAnimations(
  anims: AnimationManager
): void {
  // Lizard sheets are 13 frames per direction (64x64). Walk and attack rows both
  // follow UP, LEFT, DOWN, RIGHT order.
  anims.create({ key: LIZARD_ANIMATION_KEYS.ATTACK_UP, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_ATTACK, { start: 0, end: 12 }), frameRate: 9, repeat: 0 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.ATTACK_LEFT, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_ATTACK, { start: 13, end: 25 }), frameRate: 9, repeat: 0 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.ATTACK_DOWN, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_ATTACK, { start: 26, end: 38 }), frameRate: 9, repeat: 0 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.ATTACK_RIGHT, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_ATTACK, { start: 39, end: 51 }), frameRate: 9, repeat: 0 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.WALK_UP, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_MOVE, { start: 0, end: 12 }), frameRate: 8, repeat: -1 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.WALK_LEFT, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_MOVE, { start: 13, end: 25 }), frameRate: 8, repeat: -1 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.WALK_DOWN, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_MOVE, { start: 26, end: 38 }), frameRate: 8, repeat: -1 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.WALK_RIGHT, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_MOVE, { start: 39, end: 51 }), frameRate: 8, repeat: -1 });
  // Idle reuses the first two frames of each walk direction as a slow loop.
  anims.create({ key: LIZARD_ANIMATION_KEYS.IDLE_UP, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_MOVE, { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.IDLE_LEFT, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_MOVE, { start: 13, end: 14 }), frameRate: 4, repeat: -1 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.IDLE_DOWN, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_MOVE, { start: 26, end: 27 }), frameRate: 4, repeat: -1 });
  anims.create({ key: LIZARD_ANIMATION_KEYS.IDLE_RIGHT, frames: anims.generateFrameNumbers(ASSET_KEYS.LIZARD_MOVE, { start: 39, end: 40 }), frameRate: 4, repeat: -1 });
}
