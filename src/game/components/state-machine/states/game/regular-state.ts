import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { CUSTOM_EVENTS, EVENT_BUS, type TilePlacedPayload } from '../../../../common/event-bus';
import { BIOME } from '../../../../common/common';
import type { GameScene } from '../../../../scenes/game-scene';

/**
 * Main play state. Watches for triggers that pull the game into a scripted
 * narrator beat (first tree, first animal, ...). Triggers fire at most once
 * per game; the corresponding state transitions back to RegularState when
 * done.
 */
export class RegularState extends BaseGameState {
  // Phase 3: gates so the narrator beats only fire on the very first event.
  static #firstTreeFired = false;
  static #firstAnimalFired = false;

  #tileHandler?: (payload: TilePlacedPayload) => void;
  #animalHandler?: () => void;

  constructor(scene: GameScene) {
    super(GAME_STATES.REGULAR, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] RegularState entered');
    this._scene.unlockPlayerMovement();

    if (!RegularState.#firstTreeFired) {
      this.#tileHandler = (payload) => this.#onTilePlaced(payload);
      EVENT_BUS.on(CUSTOM_EVENTS.TILE_PLACED, this.#tileHandler);
    }
    if (!RegularState.#firstAnimalFired) {
      this.#animalHandler = () => this.#onFirstAnimalSpawned();
      EVENT_BUS.on(CUSTOM_EVENTS.FIRST_ANIMAL_SPAWNED, this.#animalHandler);
    }
    // TODO Phase 4/5: wire eve and victory triggers; bossFight trigger.
  }

  public onExit(): void {
    if (this.#tileHandler) {
      EVENT_BUS.off(CUSTOM_EVENTS.TILE_PLACED, this.#tileHandler);
      this.#tileHandler = undefined;
    }
    if (this.#animalHandler) {
      EVENT_BUS.off(CUSTOM_EVENTS.FIRST_ANIMAL_SPAWNED, this.#animalHandler);
      this.#animalHandler = undefined;
    }
    super.onExit();
  }

  /** Reset the once-per-game gates. Used when a new game starts. */
  public static resetFlags(): void {
    RegularState.#firstTreeFired = false;
    RegularState.#firstAnimalFired = false;
  }

  #onTilePlaced(payload: TilePlacedPayload): void {
    if (!payload.hasBlocking) {
      return;
    }
    if (
      payload.biome === BIOME.FOREST ||
      payload.biome === BIOME.SWAMP ||
      payload.biome === BIOME.DESERT
    ) {
      RegularState.#firstTreeFired = true;
      this._transitionTo(GAME_STATES.FIRST_TREE);
    }
  }

  #onFirstAnimalSpawned(): void {
    RegularState.#firstAnimalFired = true;
    this._transitionTo(GAME_STATES.FIRST_ANIMAL);
  }
}
