import * as Phaser from 'phaser';
import { ASSET_KEYS } from './assets';

export const DIRECTION = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
} as const;

export const CHEST_STATE = {
  HIDDEN: 'HIDDEN',
  REVEALED: 'REVEALED',
  OPEN: 'OPEN',
} as const;

export const INTERACTIVE_OBJECT_TYPE = {
  AUTO: 'AUTO',
  OPEN: 'OPEN',
} as const;

export const DEFAULT_UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  align: 'center',
  fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX,
  fontSize: 22,
  wordWrap: { width: 600 },
  color: '#FFFFFF',
};

export const DEFAULT_UI_HEADING_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  align: 'center',
  fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX,
  fontSize: 22,
  wordWrap: { width: 480 },
  lineSpacing: 4,
  color: '#FFFFFF',
};

export const DEFAULT_UI_OPTION_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  align: 'right',
  fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX,
  fontSize: 22,
  wordWrap: { width: 540 },
  lineSpacing: 2,
  color: '#FFFFFF',
};

export const CHEST_REWARD_TO_DIALOG_MAP = {
  SMALL_KEY: 'You found a small key! You can use this to open locked doors.',
  BOSS_KEY:
    'You got the Big Key! This is the master key of the dungeon. It can open many locks that small keys cannot.',
  MAP: 'You got the Map! You can use it to see your current position and the rest of the dungeon (Press X).',
  COMPASS: "You fond the Compass! Now you can pinpoint the lair of the dungeon's evil master!",
  NOTHING: '...The chest was empty!',
} as const;

export const enum BIOME {
  NONE = -1,
  VOID = 0,
  ROCK = 1,
  DESERT = 2,
  GRASS = 3,
  FOREST = 4,
  WATER = 5,
  SWAMP = 6,
  CRYSTAL = 7,
  LAVA = 8,
  MOUNTAIN = 9,
}

// Rendering dept for the tiles and objects. Higher value means rendered on top of lower value. Negative values are for tiles, positive values are for objects.
export const FLOATING_DEPTH = 9999999;
// BLOCKING_OBJECT_DEPTH MIN:1 MAX:9999998 (depending on y-axis value)
export const BLOCKING_TILE_DEPTH = 0;
export const DECORATION_DEPTH = -10;
export const CRYSTAL_GLIMTS_DEPTH = -12;
export const WATER_DEPTH = -14;
export const LAVA_DEPTH = -16;
export const BORDER_DEPTH = -18;
export const BASE_DEPTH = -20;
export const VOID_ANIM_DEPTH = -30;
export const PLAYER_FALLING_STATE_DEPTH = -40;
export const VOID_SOLID_DEPTH = -50;

export const  GEAR = {
  NONE :'nude',
  BARE :'bare',
  BASIC:'basic',
  ARMOR :'armor'
}

export const SEX = {
  MALE : 'male',
  FEMALE : 'female',
}

export const WEAPON = {
  NONE : 'none',
  DAGGER : 'dagger',
  STAFF : 'staff',
  SWORD : 'sword',
}