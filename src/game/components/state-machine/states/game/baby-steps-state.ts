import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { CASTING_UNLOCKS } from '../../../../common/common';
import type { GameScene } from '../../../../scenes/game-scene';
import { Position } from '../../../../common/types';
import { DataManager } from '../../../../common/data-manager';
import { ENABLE_LOGGING } from '../../../../common/config';

/**
 * Active play state where the goal is to fill the target void area with at
 * least two blocking rock tiles, then move south of the starting tile.
 *
 * The TILE_PLACED listener is only attached while this state is active so the
 * goal check does not run during other phases of the game.
 */
export class BabyStepsState extends BaseGameState {
  #starterTilePosition?: Position;
  #filledTargetTilesNeeded = 20;

  constructor(scene: GameScene) {
    super(GAME_STATES.BABY_STEPS, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] BabyStepsState entered'); }
    this.#starterTilePosition = DataManager.instance.data.startTile;
  }

  public onExit(): void {
    super.onExit();
  }

  public onUpdate(): void {
    const blockingRocksPlaced = DataManager.instance.data.tilesPlaced[CASTING_UNLOCKS.ROCK_BLOCKING] ?? 0;
    if (blockingRocksPlaced < 2) {
      return; // Not enough blocking rocks placed yet.
    }
    const basicRocksPlaced = DataManager.instance.data.tilesPlaced[CASTING_UNLOCKS.ROCK_BASIC] ?? 0;
    if (basicRocksPlaced < this.#filledTargetTilesNeeded) {
      return; // Not enough target tiles filled yet.
    }
    // Player can not be in the center or right of it (those tiles are for the bigTree and the fruitChest to spawn on)
    if (!this.#starterTilePosition) {
      return; // Null guard.
    }
    const currentPlayerTile = this._scene.earth.getTileXYFromScreenCoordinates(this._scene.player.x, this._scene.player.y, true);
    if (currentPlayerTile.x === this.#starterTilePosition.x &&
      currentPlayerTile.y === this.#starterTilePosition.y) {
      return; // Player stands on the starter tile where the bigTree shall spawn.
    }
    if (currentPlayerTile.x === this.#starterTilePosition.x + 1 &&
      currentPlayerTile.y === this.#starterTilePosition.y) {
      return; // Player stands on the tile where the fruit chest shall spawn.
    }
    this._transitionTo(GAME_STATES.GARDEN);
  }
}
