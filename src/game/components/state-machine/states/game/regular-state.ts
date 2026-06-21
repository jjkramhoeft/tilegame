import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { CUSTOM_EVENTS, EVENT_BUS, ProgressionHelpPayload, type LivingCreaturesUpdated, type TilePlacedPayload } from '../../../../common/event-bus';
import { BIOME, CASTING_UNLOCKS } from '../../../../common/common';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING, NUMBER_OF_ANIMALS_KILLED_TO_TRIGGER_BOSS_FIGHT, NUMBER_OF_ANIMALS_TO_TRIGGER_EVE_STATE, NUMBER_OF_ANIMALS_TO_WIN } from '../../../../common/config';
import { GameDataManager } from '../../../../common/game-data-manager';

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
  static #eveFired = false;
  static #winFired = false;
  static #bossFightFired = false;

  #tileHandler?: (payload: TilePlacedPayload) => void;
  #animalHandler?: () => void;
  #creatureCountHandler?: (payload: LivingCreaturesUpdated) => void;

  constructor(scene: GameScene) {
    super(GAME_STATES.REGULAR, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] RegularState entered'); }
    this._scene.unlockPlayerMovement();

    if (!RegularState.#firstTreeFired) {
      this.#tileHandler = (payload) => this.#onTilePlaced(payload);
      EVENT_BUS.on(CUSTOM_EVENTS.TILE_PLACED, this.#tileHandler);
    }
    if (!RegularState.#firstAnimalFired) {
      this.#animalHandler = () => this.#onFirstAnimalSpawned();
      EVENT_BUS.on(CUSTOM_EVENTS.FIRST_ANIMAL_SPAWNED, this.#animalHandler);
    }
    // The creature-count beats (eve, victory, boss fight) all key off the same
    // event, so keep listening while any of them is still unfired.
    if (!RegularState.#eveFired || !RegularState.#winFired || !RegularState.#bossFightFired) {
      this.#creatureCountHandler = (payload) => this.#onCreatureCountUpdated(payload);
      EVENT_BUS.on(CUSTOM_EVENTS.LIVING_CREATURES_UPDATED, this.#creatureCountHandler);
    }
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
    if (this.#creatureCountHandler) {
      EVENT_BUS.off(CUSTOM_EVENTS.LIVING_CREATURES_UPDATED, this.#creatureCountHandler);
      this.#creatureCountHandler = undefined;
    }
    super.onExit();
  }

  /** Reset the once-per-game gates. Used when a new game starts. */
  public static resetFlags(): void {
    RegularState.#firstTreeFired = false;
    RegularState.#firstAnimalFired = false;
    RegularState.#eveFired = false;
    RegularState.#winFired = false;
    RegularState.#bossFightFired = false;
  }

  #onTilePlaced(payload: TilePlacedPayload): void {
    //Test for only basic tiles and help with tilecasting.
    if (!payload.hasBlocking && !payload.hasDecoration) {
      const baseTileCount = (GameDataManager.instance.data.tilesPlaced[CASTING_UNLOCKS.ROCK_BASIC] ?? 0) +
        (GameDataManager.instance.data.tilesPlaced[CASTING_UNLOCKS.DESERT_BASIC] ?? 0);
      const decorationTileCount = (GameDataManager.instance.data.tilesPlaced[CASTING_UNLOCKS.ROCK_DECORATION] ?? 0) +
        (GameDataManager.instance.data.tilesPlaced[CASTING_UNLOCKS.DESERT_DECORATION] ?? 0);
      const blockingTileCount = (GameDataManager.instance.data.tilesPlaced[CASTING_UNLOCKS.ROCK_BLOCKING] ?? 0) +
        (GameDataManager.instance.data.tilesPlaced[CASTING_UNLOCKS.DESERT_BLOCKING] ?? 0);
      if ((decorationTileCount + blockingTileCount) * 2.1 < baseTileCount) {
        this._transitionTo(GAME_STATES.HELP_WITH_TILECASTING);
      }
    }

    //Test for first tree placed
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

  #onCreatureCountUpdated(payload: LivingCreaturesUpdated): void {
    // The payload carries the fresh counts; GameDataManager only commits the new
    // living count *after* emitting, so reading data.currentLivingCreatures here
    // would be stale by one event.
    const data = GameDataManager.instance.data;
    const livingCreatures = payload.currentLivingCreatures;
    const creaturesKilled = Math.max(0, data.creaturesEverCreatedCount - livingCreatures);

    // Victory: the player has brought enough life into the world and kept it
    // alive at the same time. Checked first because it ends the game.
    if (!RegularState.#winFired && livingCreatures >= NUMBER_OF_ANIMALS_TO_WIN) {
      RegularState.#winFired = true;
      this._transitionTo(GAME_STATES.VICTORY);
      return;
    }

    // Boss fight: the player has killed enough creatures.
    if (!RegularState.#bossFightFired && creaturesKilled >= NUMBER_OF_ANIMALS_KILLED_TO_TRIGGER_BOSS_FIGHT) {
      RegularState.#bossFightFired = true;
      this._transitionTo(GAME_STATES.BOSS_FIGHT);
      return;
    }

    // Eve companion beat: use the monotonic ever-created counter (not the living
    // count, which drops when creatures die) so it fires once enough life has
    // been created, regardless of how much survived.
    if (!RegularState.#eveFired && data.creaturesEverCreatedCount >= NUMBER_OF_ANIMALS_TO_TRIGGER_EVE_STATE) {
      RegularState.#eveFired = true;
      this._transitionTo(GAME_STATES.EVE);
      return;
    }
  }
}
