import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { CUSTOM_EVENTS, EVENT_BUS, type TilePlacedPayload } from '../../../../common/event-bus';
import { BIOME } from '../../../../common/common';
import type { GameScene } from '../../../../scenes/game-scene';
import { Position } from '../../../../common/types';

/**
 * Active play state where the goal is to fill the target void area with at
 * least two blocking rock tiles, then move south of the starting tile.
 *
 * The TILE_PLACED listener is only attached while this state is active so the
 * goal check does not run during other phases of the game.
 */
export class BabyStepsState extends BaseGameState {
  #starterTilePosition?: Position;
  #filledTargetTilesNeeded = 30;
  #handler?: (payload: TilePlacedPayload) => void;
  //Tracked to unlock progression to next gameState
  #blockingRocksPlaced = 0;
  #filledTargetTiles = 0;

  constructor(scene: GameScene) {
    super(GAME_STATES.BABY_STEPS, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] BabyStepsState entered');
    this.#blockingRocksPlaced = 0;
    this.#filledTargetTiles = 0;
    this.#starterTilePosition = this._scene.earth.getFirstTilePosition();
    this.#handler = (payload: TilePlacedPayload) => this.#onTilePlaced(payload);
    EVENT_BUS.on(CUSTOM_EVENTS.TILE_PLACED, this.#handler);
  }

  public onExit(): void {
    //this._scene.setLimitedCast(false);
    if (this.#handler) {
      EVENT_BUS.off(CUSTOM_EVENTS.TILE_PLACED, this.#handler);
      this.#handler = undefined;
    }
    super.onExit();
  }

  public onUpdate(): void {
    if (this.#blockingRocksPlaced < 2) {
      return; // Not enough blocking rocks placed yet.
    }
    if (this.#filledTargetTiles < this.#filledTargetTilesNeeded) {
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

  #onTilePlaced(payload: TilePlacedPayload): void {
    const first = this._scene.earth.getFirstTilePosition();
    if (!first) {
      return;
    }
    const dx = payload.tileX - first.x;
    const dy = payload.tileY - first.y;
    const inTargetArea =
      Math.abs(dx) <= 3 &&
      Math.abs(dy) <= 3 &&
      !(Math.abs(dx) === 3 && Math.abs(dy) === 3) &&
      !(dx === 0 && dy === 0);

    if (inTargetArea && payload.biome !== BIOME.VOID) {
      this.#filledTargetTiles += 1;
    }
    if (payload.hasBlocking && payload.biome === BIOME.ROCK) {
      this.#blockingRocksPlaced += 1;
    }
  }
}
