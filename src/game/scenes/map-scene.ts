import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { DEFAULT_UI_HEADING_STYLE } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { DataManager, type CreatureType } from '../common/data-manager';
import type { GameScene } from './game-scene';
import type { EarthCastingConfig } from '../ground/earth';

const MAP_WIDTH = 1024;
const MAP_HEIGHT = 768;

type MagicFlagKey = {
  [Key in keyof EarthCastingConfig]: EarthCastingConfig[Key] extends boolean ? Key : never;
}[keyof EarthCastingConfig];

type MapOverlay = {
  flag: MagicFlagKey;
  imageKey: string;
  x: number;
  y: number;
};

// Each unlocked magic flag shows a placeholder image at the configured x,y on the map.
// Coordinates are in the 100..600 range as requested; image keys alternate between the
// two placeholder textures for now.
const MAP_OVERLAYS: MapOverlay[] = [
  { flag: 'isRockDecorationUnlocked', imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 120, y: 120 },
  { flag: 'isRockBlockingUnlocked',   imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 200, y: 120 },
  { flag: 'isRockAnimalsUnlocked',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 280, y: 120 },

  { flag: 'isDesertUnlocked',           imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 120, y: 200 },
  { flag: 'isDesertDecorationUnlocked', imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 200, y: 200 },
  { flag: 'isDesertBlockingUnlocked',   imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 280, y: 200 },
  { flag: 'isDesertAnimalsUnlocked',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 360, y: 200 },

  { flag: 'isGrassUnlocked',           imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 120, y: 280 },
  { flag: 'isGrassDecorationUnlocked', imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 200, y: 280 },
  { flag: 'isGrassBlockingUnlocked',   imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 280, y: 280 },
  { flag: 'isGrassAnimalsUnlocked',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 360, y: 280 },

  { flag: 'isForestUnlocked',           imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 120, y: 360 },
  { flag: 'isForestDecorationUnlocked', imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 200, y: 360 },
  { flag: 'isForestBlockingUnlocked',   imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 280, y: 360 },
  { flag: 'isForestAnimalsUnlocked',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 360, y: 360 },

  { flag: 'isSwampUnlocked',           imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 120, y: 440 },
  { flag: 'isSwampDecorationUnlocked', imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 200, y: 440 },
  { flag: 'isSwampBlockingUnlocked',   imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 280, y: 440 },
  { flag: 'isSwampAnimalsUnlocked',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 360, y: 440 },

  { flag: 'isCrystalUnlocked',           imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 120, y: 520 },
  { flag: 'isCrystalDecorationUnlocked', imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 200, y: 520 },
  { flag: 'isCrystalBlockingUnlocked',   imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 280, y: 520 },
  { flag: 'isCrystalAnimalsUnlocked',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 360, y: 520 },

  { flag: 'isWaterUnlocked',        imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 440, y: 200 },
  { flag: 'isWaterAnimalsUnlocked', imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 520, y: 200 },
  { flag: 'isLavaUnlocked',         imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 440, y: 520 },
  { flag: 'isMountainUnlocked',     imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 600, y: 360 },
];

type CreatureOverlay = {
  type: CreatureType;
  imageKey: string;
  x: number;
  y: number;
};

// One overlay per creature type that has ever been spawned by the player.
// Coordinates are within the 100..600 range, alternating placeholders for now.
const CREATURE_OVERLAYS: CreatureOverlay[] = [
  { type: 'spider',  imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 460, y: 120 },
  { type: 'wisp',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 540, y: 120 },
  { type: 'drow',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 600, y: 120 },
  { type: 'lamb',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 460, y: 280 },
  { type: 'chicken', imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 540, y: 280 },
  { type: 'sheep',   imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 600, y: 280 },
  { type: 'rooster', imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 460, y: 360 },
  { type: 'bull',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 540, y: 440 },
  { type: 'calf',    imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 600, y: 440 },
  { type: 'turkey',  imageKey: ASSET_KEYS.MAP_PLACEHOLDER_2, x: 460, y: 520 },
  { type: 'piglet',  imageKey: ASSET_KEYS.MAP_PLACEHOLDER_1, x: 540, y: 520 },
];

export class MapScene extends Phaser.Scene {
  #controls!: KeyboardComponent;

  constructor() {
    super({ key: SCENE_KEYS.MAP_SCENE });
  }

  public create(): void {
    this.add
      .image(0, 0, ASSET_KEYS.MAP_BACKGROUND)
      .setOrigin(0)
      .setDisplaySize(MAP_WIDTH, MAP_HEIGHT);

    this.#renderUnlockedMagicOverlays();
    this.#renderCreatureOverlays();

    this.add
      .text(MAP_WIDTH / 2, MAP_HEIGHT - 60, "Press 'x' or 'm' to return", DEFAULT_UI_HEADING_STYLE)
      .setOrigin(0.5);

    if (!this.input.keyboard) {
      console.warn('[MapScene] keyboard plugin missing');
      return;
    }
    this.#controls = new KeyboardComponent(this.input.keyboard);
  }

  public update(): void {
    if (!this.#controls) {
      return;
    }
    if (this.#controls.isActionKeyJustDown || this.#controls.isMapKeyJustDown) {
      this.#closeMap();
    }
  }

  #renderUnlockedMagicOverlays(): void {
    const gameScene = this.scene.get(SCENE_KEYS.GAME_SCENE) as GameScene | undefined;
    const magic = gameScene?.debugSpellcasting?.playerCurrentMagic;
    if (!magic) {
      return;
    }
    for (const overlay of MAP_OVERLAYS) {
      if (magic[overlay.flag]) {
        this.add.image(overlay.x, overlay.y, overlay.imageKey).setOrigin(0.5);
      }
    }
  }

  #renderCreatureOverlays(): void {
    const dataManager = DataManager.instance;
    for (const overlay of CREATURE_OVERLAYS) {
      if (dataManager.hasEverCreated(overlay.type)) {
        this.add.image(overlay.x, overlay.y, overlay.imageKey).setOrigin(0.5);
      }
    }
  }

  #closeMap(): void {
    this.scene.wake(SCENE_KEYS.UI_SCENE);
    this.scene.resume(SCENE_KEYS.GAME_SCENE);
    this.scene.stop();
  }
}
