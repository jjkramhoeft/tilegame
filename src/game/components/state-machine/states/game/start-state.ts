import * as Phaser from 'phaser';
import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { DataManager } from '../../../../common/data-manager';
import { DIFFICULTY_HARD_WAIT_FACTOR, ENABLE_LOGGING } from '../../../../common/config';
import { ASSET_KEYS } from '../../../../common/assets';

const START_CLOUD_COUNT = 35;
const START_CLOUD_DEPTH = 1000;
const START_CLOUD_SPAWN_PADDING = -50;
const START_CLOUD_DRIFT_MIN_DISTANCE = 24;
const START_CLOUD_DRIFT_MAX_DISTANCE = 96;
const START_CLOUD_DRIFT_MIN_DURATION_MS = 900;
const START_CLOUD_DRIFT_MAX_DURATION_MS = 2000;
const START_CLOUD_ESCAPE_PADDING = 360;
const START_CLOUD_ESCAPE_MIN_DURATION_MS = 1750;
const START_CLOUD_ESCAPE_MAX_DURATION_MS = 2300;
const START_CLOUD_MIN_ALPHA = 0.7;
const START_CLOUD_MAX_ALPHA = 0.95;
const START_CLOUD_MIN_SCALE = 1.1;
const START_CLOUD_MAX_SCALE = 2.1;

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
    if (DataManager.instance.data.difficulty === 'Hard') {
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
          // 4) Place the first tile.
          this._scene.placeStartingTile();
          // 5) small pause
          this._pause(defaultWaitTime, () => {
            // 6) Place the player (movement still disabled).
            this._scene.revealPlayer();
            // 7) small pause
            this._pause(defaultWaitTime, () => {
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

  #startCloudDrift(cloud: Phaser.GameObjects.Image): void {
    if (!cloud.active || !cloud.scene) {
      return;
    }

    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
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

  #scatterCloudsFromCenter(): void {
    const center = this._scene.getPlayerStartWorldPosition();
    const camera = this._scene.cameras.main;
    const escapeDistance = Math.max(camera.width, camera.height) + START_CLOUD_ESCAPE_PADDING;

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
