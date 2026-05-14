import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { CUSTOM_EVENTS, EVENT_BUS, type TilePlacedPayload } from '../../../../common/event-bus';
import { BIOME } from '../../../../common/common';
import type { GameScene } from '../../../../scenes/game-scene';

/**
 * Active play state where the goal is to fill the target void area with at
 * least two blocking rock tiles, then move south of the starting tile.
 *
 * The TILE_PLACED listener is only attached while this state is active so the
 * goal check does not run during other phases of the game.
 */
export class BabyStepsState extends BaseGameState {
  #blockingRocksPlaced = 0;
  #filledTargetTiles = new Set<string>();
  #targetVoidTilesNeeded = 0;
  #handler?: (payload: TilePlacedPayload) => void;

  constructor(scene: GameScene) {
    super(GAME_STATES.BABY_STEPS, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] BabyStepsState entered');
    this.#blockingRocksPlaced = 0;
    this.#filledTargetTiles.clear();
    // `placeTargetVoidTiles` places a 7x7 area minus the 4 corners minus the
    // center: 49 - 4 - 1 = 44 tiles to (potentially) fill.
    this.#targetVoidTilesNeeded = 44;

    this.#handler = (payload: TilePlacedPayload) => this.#onTilePlaced(payload);
    EVENT_BUS.on(CUSTOM_EVENTS.TILE_PLACED, this.#handler);
  }

  public onExit(): void {
    if (this.#handler) {
      EVENT_BUS.off(CUSTOM_EVENTS.TILE_PLACED, this.#handler);
      this.#handler = undefined;
    }
    super.onExit();
  }

  public onUpdate(): void {
    if (this.#blockingRocksPlaced < 2) {
      return;
    }
    if (this.#filledTargetTiles.size < this.#targetVoidTilesNeeded) {
      return;
    }
    // Player must be below the center (south of the starting tile).
    const earth = this._scene.earth;
    const first = earth.getFirstTilePosition();
    if (!first) {
      return;
    }
    const tileSize = earth.getTileSize();
    const centerWorldY = first.y * tileSize + tileSize / 2;
    if (this._scene.player.y > centerWorldY) {
      this._transitionTo(GAME_STATES.GARDEN);
    }
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
      this.#filledTargetTiles.add(`${payload.tileX},${payload.tileY}`);
    }
    if (payload.hasBlocking && payload.biome === BIOME.ROCK) {
      this.#blockingRocksPlaced += 1;
    }
  }
}
