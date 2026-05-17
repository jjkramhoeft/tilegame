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

// Each unlocked magic flag shows a biome/feature image at the configured x,y on the map.
const MAP_OVERLAYS: MapOverlay[] = [
  { flag: 'isRockDecorationUnlocked', imageKey: ASSET_KEYS.MAP_ROCK_DECO, x: 290, y: 300 },
  { flag: 'isRockBlockingUnlocked', imageKey: ASSET_KEYS.MAP_ROCK_BLOCKING, x: 270, y: 444 },
  { flag: 'isDesertUnlocked', imageKey: ASSET_KEYS.MAP_DESERT, x: 640, y: 384 },
  { flag: 'isDesertDecorationUnlocked', imageKey: ASSET_KEYS.MAP_DESERT_DECO, x: 720, y: 310 },
  { flag: 'isDesertBlockingUnlocked', imageKey: ASSET_KEYS.MAP_DESERT_BLOCKING, x: 740, y: 450 },
  { flag: 'isGrassUnlocked', imageKey: ASSET_KEYS.MAP_GRASS, x: 390, y: 250 },
  { flag: 'isGrassDecorationUnlocked', imageKey: ASSET_KEYS.MAP_GRASS_DECO, x: 300, y: 210 },
  { flag: 'isForestUnlocked', imageKey: ASSET_KEYS.MAP_FOREST, x: 610, y: 520 },
  { flag: 'isForestDecorationUnlocked', imageKey: ASSET_KEYS.MAP_FOREST_DECO, x: 700, y: 550 },
  { flag: 'isForestBlockingUnlocked', imageKey: ASSET_KEYS.MAP_FOREST_BLOCKING, x: 680, y: 610 },
  { flag: 'isSwampUnlocked', imageKey: ASSET_KEYS.MAP_SWAMP, x: 400, y: 520 },
  { flag: 'isSwampDecorationUnlocked', imageKey: ASSET_KEYS.MAP_SWAMP_DECO, x: 350, y: 600 },
  { flag: 'isSwampBlockingUnlocked', imageKey: ASSET_KEYS.MAP_SWAMP_BLOCKING, x: 290, y: 550 },
  { flag: 'isCrystalUnlocked', imageKey: ASSET_KEYS.MAP_CRYSTAL, x: 630, y: 250 },
  { flag: 'isCrystalDecorationUnlocked', imageKey: ASSET_KEYS.MAP_CRYSTAL_DECO, x: 700, y: 200 },
  { flag: 'isCrystalBlockingUnlocked', imageKey: ASSET_KEYS.MAP_CRYSTAL_BLOCKING, x: 720, y: 260 },
  { flag: 'isWaterUnlocked', imageKey: ASSET_KEYS.MAP_WATER, x: 640, y: 120 },
  { flag: 'isLavaUnlocked', imageKey: ASSET_KEYS.MAP_LAVA, x: 370, y: 90 },
  { flag: 'isMountainUnlocked', imageKey: ASSET_KEYS.MAP_MOUNTAIN, x: 512, y: 100 },
];

type CreatureOverlay = {
  type: CreatureType;
  imageKey: string;
  x: number;
  y: number;
};

// One overlay per creature type that has ever been spawned by the player.
const CREATURE_OVERLAYS: CreatureOverlay[] = [
  { type: 'spider', imageKey: ASSET_KEYS.MAP_SPIDER, x: 200, y: 512 },
  { type: 'plant', imageKey: ASSET_KEYS.MAP_PLANT, x: 180, y: 620 },
  { type: 'skeleton', imageKey: ASSET_KEYS.MAP_SKELETON, x: 800, y: 90 },
  { type: 'lamb', imageKey: ASSET_KEYS.MAP_LAMB, x: 100, y: 120 },
  { type: 'chicken', imageKey: ASSET_KEYS.MAP_CHICKEN, x: 100, y: 240 },
  { type: 'sheep', imageKey: ASSET_KEYS.MAP_SHEEP, x: 100, y: 380 },
  { type: 'rooster', imageKey: ASSET_KEYS.MAP_ROOSTER, x: 230, y: 100 },
  { type: 'bull', imageKey: ASSET_KEYS.MAP_BULL, x: 210, y: 240 },
  { type: 'calf', imageKey: ASSET_KEYS.MAP_CALF, x: 230, y: 380 },
  { type: 'turkey', imageKey: ASSET_KEYS.MAP_TURKEY, x: 800, y: 512 },
  { type: 'piglet', imageKey: ASSET_KEYS.MAP_PIGLET, x: 800, y: 640 },
  { type: 'snake', imageKey: ASSET_KEYS.MAP_SNAKE, x: 860, y: 310 },
  { type: 'lizardman', imageKey: ASSET_KEYS.MAP_LIZARDMAN, x: 900, y: 150 },
];

export class MapScene extends Phaser.Scene {
  #controls!: KeyboardComponent;

  constructor() {
    super({ key: SCENE_KEYS.MAP_SCENE });
  }

  public create(): void {
    this.add.image(0, 0, ASSET_KEYS.MAP_BACKGROUND).setOrigin(0).setDisplaySize(MAP_WIDTH, MAP_HEIGHT).setDepth(-1);

    this.#renderBase();
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

  #renderBase(): void {
    this.add.image(384, 384, ASSET_KEYS.MAP_ROCK).setOrigin(0.5).setScale(0.7).setAlpha(0.6).setDepth(10);// unlocked at start    
    this.add.image(500, 400, ASSET_KEYS.MAP_BIG_TREE).setOrigin(0.5).setScale(1.5).setTint(0x888888).setAlpha(0.3).setDepth(0);
    this.add.image(512, 384, ASSET_KEYS.MAP_CONSTELLATIONS).setOrigin(0.5).setScale(1.1, 1).setDepth(1);
    //ToDo: When companion is implemented, switch between star or companion image based on whether the player has unlocked the companion or not.
    //this.add.image(500, 600, ASSET_KEYS.MAP_EVE).setOrigin(0.5).setScale(1.7).setDepth(10);
    //this.add.image(540, 600, ASSET_KEYS.MAP_ADAM).setOrigin(0.5).setScale(1.7).setDepth(10);    
    this.add.image(520, 600, ASSET_KEYS.MAP_STAR3).setOrigin(0.5).setDepth(10);
  }

  #renderUnlockedMagicOverlays(): void {
    const gameScene = this.scene.get(SCENE_KEYS.GAME_SCENE) as GameScene | undefined;
    const magic = gameScene?.debugSpellcasting?.playerCurrentMagic;
    if (!magic) {
      return;
    }
    for (const overlay of MAP_OVERLAYS) {
      if (magic[overlay.flag]) {
        this.add.image(overlay.x, overlay.y, overlay.imageKey).setOrigin(0.5).setScale(0.7).setAlpha(0.6).setDepth(10);
      } else {
        this.add.image(overlay.x, overlay.y, ASSET_KEYS.MAP_STAR2).setOrigin(0.5).setDepth(10);
      }
    }
  }

  #renderCreatureOverlays(): void {
    const dataManager = DataManager.instance;
    for (const overlay of CREATURE_OVERLAYS) {
      if (dataManager.hasEverCreated(overlay.type)) {
        this.add.image(overlay.x, overlay.y, overlay.imageKey).setOrigin(0.5).setDepth(10);
      } else {
        this.add.image(overlay.x, overlay.y, ASSET_KEYS.MAP_STAR1).setOrigin(0.5).setDepth(10);
      }
    }
  }

  #closeMap(): void {
    this.scene.wake(SCENE_KEYS.UI_SCENE);
    this.scene.resume(SCENE_KEYS.GAME_SCENE);
    this.scene.stop();
  }
}
