import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { CASTING_UNLOCKS, DEFAULT_UI_HEADING_STYLE } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { GameDataManager } from '../common/game-data-manager';
import { getCurrentLanguage, getText } from '../common/texts';
import type { CastingUnlocks, CreatureType } from '../common/types';

const MAP_WIDTH = 1024;
const MAP_HEIGHT = 768;

type MapOverlay = {
  flag: CastingUnlocks;
  imageKey: string;
  x: number;
  y: number;
  prevFlag: CastingUnlocks;
};

// Each unlocked magic flag shows a biome/feature image at the configured x,y on the map.
const MAP_OVERLAYS: MapOverlay[] = [
  { flag: CASTING_UNLOCKS.ROCK_DECORATION, imageKey: ASSET_KEYS.MAP_ROCK_DECO, x: 290, y: 300, prevFlag: CASTING_UNLOCKS.ROCK_DECORATION },
  { flag: CASTING_UNLOCKS.ROCK_BLOCKING, imageKey: ASSET_KEYS.MAP_ROCK_BLOCKING, x: 270, y: 444, prevFlag: CASTING_UNLOCKS.ROCK_DECORATION },
  { flag: CASTING_UNLOCKS.DESERT_BASIC, imageKey: ASSET_KEYS.MAP_DESERT, x: 640, y: 384, prevFlag: CASTING_UNLOCKS.ROCK_BLOCKING },
  { flag: CASTING_UNLOCKS.DESERT_DECORATION, imageKey: ASSET_KEYS.MAP_DESERT_DECO, x: 720, y: 310, prevFlag: CASTING_UNLOCKS.DESERT_BASIC },
  { flag: CASTING_UNLOCKS.DESERT_BLOCKING, imageKey: ASSET_KEYS.MAP_DESERT_BLOCKING, x: 740, y: 450, prevFlag: CASTING_UNLOCKS.DESERT_DECORATION },
  { flag: CASTING_UNLOCKS.GRASS_BASIC, imageKey: ASSET_KEYS.MAP_GRASS, x: 390, y: 250, prevFlag: CASTING_UNLOCKS.DESERT_BLOCKING },
  { flag: CASTING_UNLOCKS.GRASS_DECORATION, imageKey: ASSET_KEYS.MAP_GRASS_DECO, x: 300, y: 210, prevFlag: CASTING_UNLOCKS.GRASS_BASIC },
  { flag: CASTING_UNLOCKS.FOREST_BASIC, imageKey: ASSET_KEYS.MAP_FOREST, x: 610, y: 520, prevFlag: CASTING_UNLOCKS.GRASS_DECORATION },
  { flag: CASTING_UNLOCKS.FOREST_DECORATION, imageKey: ASSET_KEYS.MAP_FOREST_DECO, x: 700, y: 550, prevFlag: CASTING_UNLOCKS.FOREST_BASIC },
  { flag: CASTING_UNLOCKS.FOREST_BLOCKING, imageKey: ASSET_KEYS.MAP_FOREST_BLOCKING, x: 680, y: 610, prevFlag: CASTING_UNLOCKS.FOREST_DECORATION },
  { flag: CASTING_UNLOCKS.SWAMP_BASIC, imageKey: ASSET_KEYS.MAP_SWAMP, x: 400, y: 520, prevFlag: CASTING_UNLOCKS.FOREST_BLOCKING },
  { flag: CASTING_UNLOCKS.SWAMP_DECORATION, imageKey: ASSET_KEYS.MAP_SWAMP_DECO, x: 350, y: 600, prevFlag: CASTING_UNLOCKS.SWAMP_BASIC },
  { flag: CASTING_UNLOCKS.SWAMP_BLOCKING, imageKey: ASSET_KEYS.MAP_SWAMP_BLOCKING, x: 290, y: 550, prevFlag: CASTING_UNLOCKS.SWAMP_DECORATION },
  { flag: CASTING_UNLOCKS.CRYSTAL_BASIC, imageKey: ASSET_KEYS.MAP_CRYSTAL, x: 630, y: 250, prevFlag: CASTING_UNLOCKS.SWAMP_BLOCKING },
  { flag: CASTING_UNLOCKS.CRYSTAL_DECORATION, imageKey: ASSET_KEYS.MAP_CRYSTAL_DECO, x: 700, y: 200, prevFlag: CASTING_UNLOCKS.CRYSTAL_BASIC },
  { flag: CASTING_UNLOCKS.CRYSTAL_BLOCKING, imageKey: ASSET_KEYS.MAP_CRYSTAL_BLOCKING, x: 720, y: 260, prevFlag: CASTING_UNLOCKS.CRYSTAL_DECORATION },
  { flag: CASTING_UNLOCKS.WATER_BASIC, imageKey: ASSET_KEYS.MAP_WATER, x: 640, y: 120, prevFlag: CASTING_UNLOCKS.DESERT_BASIC },
  { flag: CASTING_UNLOCKS.LAVA_BASIC, imageKey: ASSET_KEYS.MAP_LAVA, x: 370, y: 90, prevFlag: CASTING_UNLOCKS.CRYSTAL_BASIC },
  { flag: CASTING_UNLOCKS.MOUNTAIN_BASIC, imageKey: ASSET_KEYS.MAP_MOUNTAIN, x: 512, y: 100, prevFlag: CASTING_UNLOCKS.FOREST_BASIC },
];

type CreatureOverlay = {
  type: CreatureType;
  imageKey: string;
  x: number;
  y: number;
  flag: CastingUnlocks;
};

// One overlay per creature type that has ever been spawned by the player.
const CREATURE_OVERLAYS: CreatureOverlay[] = [
  { type: 'spider', imageKey: ASSET_KEYS.MAP_SPIDER, x: 200, y: 512, flag: CASTING_UNLOCKS.ROCK_ANIMALS },
  { type: 'plant', imageKey: ASSET_KEYS.MAP_PLANT, x: 180, y: 620, flag: CASTING_UNLOCKS.SWAMP_ANIMALS },
  { type: 'skeleton', imageKey: ASSET_KEYS.MAP_SKELETON, x: 800, y: 90, flag: CASTING_UNLOCKS.CRYSTAL_ANIMALS },
  { type: 'lamb', imageKey: ASSET_KEYS.MAP_LAMB, x: 100, y: 120, flag: CASTING_UNLOCKS.GRASS_ANIMALS },
  { type: 'chicken', imageKey: ASSET_KEYS.MAP_CHICKEN, x: 100, y: 240, flag: CASTING_UNLOCKS.GRASS_ANIMALS },
  { type: 'sheep', imageKey: ASSET_KEYS.MAP_SHEEP, x: 100, y: 380, flag: CASTING_UNLOCKS.GRASS_ANIMALS },
  { type: 'rooster', imageKey: ASSET_KEYS.MAP_ROOSTER, x: 230, y: 100, flag: CASTING_UNLOCKS.GRASS_ANIMALS },
  { type: 'bull', imageKey: ASSET_KEYS.MAP_BULL, x: 210, y: 240, flag: CASTING_UNLOCKS.GRASS_ANIMALS },
  { type: 'calf', imageKey: ASSET_KEYS.MAP_CALF, x: 230, y: 380, flag: CASTING_UNLOCKS.GRASS_ANIMALS },
  { type: 'turkey', imageKey: ASSET_KEYS.MAP_TURKEY, x: 800, y: 512, flag: CASTING_UNLOCKS.FOREST_ANIMALS },
  { type: 'piglet', imageKey: ASSET_KEYS.MAP_PIGLET, x: 800, y: 640, flag: CASTING_UNLOCKS.FOREST_ANIMALS },
  { type: 'snake', imageKey: ASSET_KEYS.MAP_SNAKE, x: 860, y: 310, flag: CASTING_UNLOCKS.DESERT_ANIMALS },
  { type: 'lizardman', imageKey: ASSET_KEYS.MAP_LIZARDMAN, x: 900, y: 150, flag: CASTING_UNLOCKS.CRYSTAL_ANIMALS },//ToDo: Fix not unlocked by crystal
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
    this.#renderCounters();

    this.add
      .text(MAP_WIDTH / 2, MAP_HEIGHT - 60, "Press 'x' or 'm' to return", DEFAULT_UI_HEADING_STYLE)
      .setOrigin(0.5);

    if (!this.input.keyboard) { console.warn('[MapScene] keyboard plugin missing'); return; }
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
    const magic = GameDataManager.instance.data.unlockedSpellCasting;
    for (const overlay of MAP_OVERLAYS) {
      if (magic.has(overlay.flag)) {
        this.add.image(overlay.x, overlay.y, overlay.imageKey).setOrigin(0.5).setScale(0.7).setAlpha(0.6).setDepth(10);
      } else {
        this.add.image(overlay.x, overlay.y, ASSET_KEYS.MAP_STAR2).setOrigin(0.5).setDepth(10);
      }
    }
  }

  #renderCreatureOverlays(): void {
    const magic = GameDataManager.instance.data.unlockedSpellCasting;
    const dataManager = GameDataManager.instance;
    for (const overlay of CREATURE_OVERLAYS) {
      if (dataManager.hasEverCreated(overlay.type)) {
        this.add.image(overlay.x, overlay.y, overlay.imageKey).setOrigin(0.5).setDepth(10);
      } else if (magic.has(overlay.flag)) {
        this.add.image(overlay.x, overlay.y, ASSET_KEYS.MAP_STAR1).setOrigin(0.5).setDepth(10);
      }
    }
  }

  // Statistics for the current run, shown in the lower-left. Recomputed on every
  // map entry because create() runs fresh each time the map is launched.
  #renderCounters(): void {
    const data = GameDataManager.instance;

    const lines = [
      `${getText('legend.timePlayed')}: ${this.#formatPlayTime(data.getTotalPlayTimeMs())}`,
      '',
      `${getText('legend.animalsCreated')}: ${data.getCreaturesEverCreatedCount()}`,
      `${getText('legend.animalsKilled')}: ${data.getCreaturesKilled()}`,
      '',
      `${getText('legend.earthCreated')}: ${data.getTotalTilesPlaced('_BASIC')}`,
      `${getText('legend.earthDecorated')}: ${data.getTotalTilesPlaced('_DECORATION')}`,
      `${getText('legend.earthFilledIn')}: ${data.getTotalTilesPlaced('_BLOCKING')}`,
    ];

    const lineHeight = 26;
    const startY = MAP_HEIGHT - 40 - lines.length * lineHeight;
    lines.forEach((line, index) => {
      this.add
        .text(10, startY + index * lineHeight, line, { ...DEFAULT_UI_HEADING_STYLE, align: 'left', fontSize: 18 })
        .setOrigin(0, 0)
        .setDepth(20);
    });
  }

  // Verbose, localized play time: "1h 23m" (en) / "1t 23m" (da).
  #formatPlayTime(totalMs: number): string {
    const isDanish = getCurrentLanguage() === 'da';
    const hourUnit = isDanish ? 't' : 'h';
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) { return `${hours}${hourUnit} ${minutes}m`; }
    if (minutes > 0) { return `${minutes}m`; }
    return `${seconds}s`;
  }

  #closeMap(): void {
    this.scene.wake(SCENE_KEYS.UI_SCENE);
    this.scene.resume(SCENE_KEYS.GAME_SCENE);
    this.scene.stop();
  }
}
