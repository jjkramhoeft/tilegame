import * as Phaser from 'phaser';
import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { GameDataManager } from '../../../../common/game-data-manager';
import { DIFFICULTY_HARD_WAIT_FACTOR, ENABLE_LOGGING } from '../../../../common/config';
import { ASSET_KEYS } from '../../../../common/assets';
import { DIFFICULTY } from '../../../../common/common';
import { playNoteBurst } from '../../../../spellcasting/note-burst-vfx';

const START_CLOUD_COUNT = 35;
const START_CLOUD_DEPTH = 1000;
const START_CLOUD_SPAWN_PADDING = -50;
const START_CLOUD_DRIFT_MIN_DISTANCE = 24;
const START_CLOUD_DRIFT_MAX_DISTANCE = 96;
const START_CLOUD_DRIFT_MIN_DURATION_MS = 900;
const START_CLOUD_DRIFT_MAX_DURATION_MS = 2000;
const START_CLOUD_CENTER_PULL_MARGIN = 100;
const START_CLOUD_ESCAPE_PADDING = 360;
const START_CLOUD_ESCAPE_MIN_DURATION_MS = 1750;
const START_CLOUD_ESCAPE_MAX_DURATION_MS = 2300;
const START_CLOUD_MIN_ALPHA = 0.7;
const START_CLOUD_MAX_ALPHA = 0.95;
const START_CLOUD_MIN_SCALE = 1.1;
const START_CLOUD_MAX_SCALE = 2.1;
const START_SOUND_EFFECT_COUNT = 7;
const START_SOUND_EFFECT_STAGGER_MS = 150;
const START_SOUND_EFFECT_DURATION = 1.5;
const START_SOUND_EFFECT_VOLUME = 1.0;

const START_CLOUD_KEYS = [
  ASSET_KEYS.CLOUD_DARK_SHAPE2_1,
  ASSET_KEYS.CLOUD_DARK_SHAPE2_2,
  ASSET_KEYS.CLOUD_DARK_SHAPE2_3,
  ASSET_KEYS.CLOUD_DARK_SHAPE2_4,
  ASSET_KEYS.CLOUD_DARK_SHAPE3_1,
  ASSET_KEYS.CLOUD_DARK_SHAPE3_2,
  ASSET_KEYS.CLOUD_DARK_SHAPE3_3,
  ASSET_KEYS.CLOUD_DARK_SHAPE3_4,
  ASSET_KEYS.CLOUD_DARK_SHAPE3_5,
];

/**
 * Scripted intro that goes from an empty screen to a player standing on the
 * very first tile, ready to be controlled. See `game-state.md` -> Start State.
 */
export class StartState extends BaseGameState {

  #clouds?: Phaser.GameObjects.Group;

  constructor(scene: GameScene) {
    super(GAME_STATES.START, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] StartState entered'); }
    let defaultWaitTime = 500;
    if (GameDataManager.instance.data.difficulty === DIFFICULTY.HARD) {
      defaultWaitTime *= DIFFICULTY_HARD_WAIT_FACTOR;
    }

    this.#clouds = this._scene.add.group();
    this.#createIntroClouds();

    // 1) Empty screen (no player and no tiles): create() already hid the
    //    player, and no tile has been placed yet, so we just wait a moment.
    this._pause(defaultWaitTime, () => {
      // 2) Narrator text. Wait for the player to dismiss it before continuing.
      this._showNarrator('narrator.start.intro', () => {
        // 3) small pause
        this._pause(defaultWaitTime, () => {
          this.#scatterCloudsFromCenter();
          this._pause(defaultWaitTime*3, () => {
            // 4) Place the first tile.
            this.#startPlayingSoundEffect();
            this.#playVisualEffectAtCenter1();
            this._scene.placeStartingTile();
            // 5) small pause
            this._pause(defaultWaitTime*3, () => {
              // 6) Place the player (movement still disabled).
              this._scene.revealPlayer();
              this.#playVisualEffectAtCenter2();
              // 7) small pause
              this._pause(defaultWaitTime*3, () => {
                // 8) Second narrator beat.
                this._showNarrator('narrator.start.youCreated', () => {
                  // 9) Enable player movement.
                  this._scene.unlockPlayerMovement();
                  // 10) Transition to the First Tile state.
                  this._transitionTo(GAME_STATES.FIRST_TILE);
                });
              });
            });

          });
        });
      });
    });
  }

  public onExit(): void {
    this.#clearClouds();
    super.onExit();
  }

  #createIntroClouds(): void {
    const center = this._scene.getPlayerStartWorldPosition();
    const camera = this._scene.cameras.main;
    const halfWidth = camera.width / 2;
    const halfHeight = camera.height / 2;
    const minX = center.x - halfWidth - START_CLOUD_SPAWN_PADDING;
    const maxX = center.x + halfWidth + START_CLOUD_SPAWN_PADDING;
    const minY = center.y - halfHeight - START_CLOUD_SPAWN_PADDING;
    const maxY = center.y + halfHeight + START_CLOUD_SPAWN_PADDING;

    for (let index = 0; index < START_CLOUD_COUNT; index += 1) {
      const cloud = this._scene.add.image(
        Phaser.Math.FloatBetween(minX, maxX),
        Phaser.Math.FloatBetween(minY, maxY),
        Phaser.Utils.Array.GetRandom(START_CLOUD_KEYS),
      )
        .setDepth(START_CLOUD_DEPTH)
        .setAlpha(Phaser.Math.FloatBetween(START_CLOUD_MIN_ALPHA, START_CLOUD_MAX_ALPHA))
        .setScale(Phaser.Math.FloatBetween(START_CLOUD_MIN_SCALE, START_CLOUD_MAX_SCALE));

      this.#clouds?.add(cloud);
      this.#startCloudDrift(cloud);
    }
  }

  #startPlayingSoundEffect(): void {
    for (let markerIndex = 1; markerIndex <= START_SOUND_EFFECT_COUNT; markerIndex += 1) {
      this._pause((markerIndex - 1) * START_SOUND_EFFECT_STAGGER_MS, () => {
        this._scene.sound.play(ASSET_KEYS.MAGIC_AUDIO_SPRITE, {
          name: `spell-cast-${markerIndex}`,
          start: (markerIndex - 1) * 2,
          duration: START_SOUND_EFFECT_DURATION,
          volume: START_SOUND_EFFECT_VOLUME,
          config: {},
        });
      });
    }
  }

  #playVisualEffectAtCenter1(): void {
    const center = this._scene.getPlayerStartWorldPosition();
    const originVFX = this._scene.add
      .sprite(center.x, center.y, ASSET_KEYS.MAGIC_FX_HOLY_EXPLOSION)
      .setScale(3, 2.5)
      .setOrigin(0.5, 0.5);
    originVFX.setDepth(10);
    originVFX.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    originVFX.playReverse(ASSET_KEYS.CAST_ORIGIN);
    originVFX.on('animationcomplete', () => { originVFX.destroy(); });

    // first-tile: golden notes burst out as the very first tile appears.
    playNoteBurst(this._scene, center.x, center.y, { count: 24, depth: START_CLOUD_DEPTH + 1 });
  }

  #playVisualEffectAtCenter2(): void {
    const center = this._scene.getPlayerStartWorldPosition();
    const impactVFX = this._scene.add
      .sprite(center.x, center.y, ASSET_KEYS.MAGIC_FX_LIGHT_CAST)
      .setScale(3, 2.8);
    impactVFX.setDepth(10);
    impactVFX.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    impactVFX.play(ASSET_KEYS.CAST_TARGET_A);
    impactVFX.on('animationcomplete', () => { impactVFX.destroy(); });

    // player-placement: golden notes burst outward as the player appears.
    playNoteBurst(this._scene, center.x, center.y, { count: 30, depth: START_CLOUD_DEPTH + 1 });
  }

  #startCloudDrift(cloud: Phaser.GameObjects.Image): void {
    if (!cloud.active || !cloud.scene) {
      return;
    }

    const angle = this.#getCloudDriftAngle(cloud);
    const distance = Phaser.Math.FloatBetween(START_CLOUD_DRIFT_MIN_DISTANCE, START_CLOUD_DRIFT_MAX_DISTANCE);

    this._scene.tweens.add({
      targets: cloud,
      x: cloud.x + Math.cos(angle) * distance,
      y: cloud.y + Math.sin(angle) * distance,
      duration: Phaser.Math.Between(START_CLOUD_DRIFT_MIN_DURATION_MS, START_CLOUD_DRIFT_MAX_DURATION_MS),
      ease: 'Sine.easeInOut',
      onComplete: () => this.#startCloudDrift(cloud),
    });
  }

  #getCloudDriftAngle(cloud: Phaser.GameObjects.Image): number {
    const center = this._scene.getPlayerStartWorldPosition();
    const camera = this._scene.cameras.main;
    const safeHalfWidth = Math.max(START_CLOUD_DRIFT_MAX_DISTANCE, camera.width / 2 - START_CLOUD_CENTER_PULL_MARGIN);
    const safeHalfHeight = Math.max(START_CLOUD_DRIFT_MAX_DISTANCE, camera.height / 2 - START_CLOUD_CENTER_PULL_MARGIN);
    const offsetX = cloud.x - center.x;
    const offsetY = cloud.y - center.y;
    const isFarFromCenter = Math.abs(offsetX) > safeHalfWidth || Math.abs(offsetY) > safeHalfHeight;

    if (isFarFromCenter) {
      return Math.atan2(center.y - cloud.y, center.x - cloud.x);
    }

    return Phaser.Math.FloatBetween(0, Math.PI * 2);
  }

  #scatterCloudsFromCenter(): void {
    this._scene.sound.play(ASSET_KEYS.WHOOSH);
    const center = this._scene.getPlayerStartWorldPosition();
    const camera = this._scene.cameras.main;
    const escapeDistance = Math.max(camera.width, camera.height) + START_CLOUD_ESCAPE_PADDING;

    // cloud-disperse: golden notes explode from the center as the clouds blow outward.
    playNoteBurst(this._scene, center.x, center.y, { count: 40, speedMax: 240, depth: START_CLOUD_DEPTH + 1 });

    this.#clouds?.getChildren().forEach((child) => {
      const cloud = child as Phaser.GameObjects.Image;
      this._scene.tweens.killTweensOf(cloud);

      let offsetX = cloud.x - center.x;
      let offsetY = cloud.y - center.y;
      let length = Math.hypot(offsetX, offsetY);

      if (length === 0) {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        offsetX = Math.cos(angle);
        offsetY = Math.sin(angle);
        length = 1;
      }

      this._scene.tweens.add({
        targets: cloud,
        x: cloud.x + (offsetX / length) * escapeDistance,
        y: cloud.y + (offsetY / length) * escapeDistance,
        alpha: 0,
        duration: Phaser.Math.Between(START_CLOUD_ESCAPE_MIN_DURATION_MS, START_CLOUD_ESCAPE_MAX_DURATION_MS),
        ease: 'Cubic.easeOut',
        onComplete: () => cloud.destroy(),
      });
    });
  }

  #clearClouds(): void {
    if (!this.#clouds) {
      return;
    }

    this.#clouds.getChildren().forEach((child) => {
      const cloud = child as Phaser.GameObjects.Image;
      this._scene.tweens.killTweensOf(cloud);
      cloud.destroy();
    });
    this.#clouds.destroy();
    this.#clouds = undefined;
  }
}
