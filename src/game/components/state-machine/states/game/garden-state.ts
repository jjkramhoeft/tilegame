import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { DIFFICULTY_HARD_WAIT_FACTOR, ENABLE_LOGGING } from '../../../../common/config';
import { GameDataManager } from '../../../../common/game-data-manager';
import { DIFFICULTY } from '../../../../common/common';
import type { Position } from '../../../../common/types';

export class GardenState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.GARDEN, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] GardenState entered'); }
    this._scene.lockPlayerMovement();
    const currentPlayerTilePosition = this._scene.earth.getTileXYFromScreenCoordinates(
      this._scene.player.x,
      this._scene.player.y,
      true, // offsetPlayer to get the tile position of the player's center instead of feet
    );
    let defaultStepWaitTime = 80;
    if(GameDataManager.instance.data.difficulty === DIFFICULTY.HARD) {
      defaultStepWaitTime *= DIFFICULTY_HARD_WAIT_FACTOR;
    }
    this._scene.progression.unlockMap();// unlocked early

    // Debug-play skips the narrator beats and builds the garden immediately.
    if (GameDataManager.instance.data.difficulty === DIFFICULTY.DEBUG_PLAY) {
      this.#buildGarden(currentPlayerTilePosition, defaultStepWaitTime);
      return;
    }

    this._pause(this.defaultWaitTime, () => {
      this._showNarrator('narrator.garden.lush', () => {
        this._pause(this.defaultWaitTime, () => {
          this._showNarrator('narrator.garden.assignment', () => {
            this.#buildGarden(currentPlayerTilePosition, defaultStepWaitTime);
          });
        });
      });
    });
  }

  #buildGarden(currentPlayerTilePosition: Position, defaultStepWaitTime: number): void {
    this._scene.earth.placeGardenTiles(defaultStepWaitTime, currentPlayerTilePosition, () => {
      this._pause(this.defaultWaitTime, () => {
        this._scene.placeFruitChestNearBigTree();
        this._pause(this.defaultWaitTime, () => {
          // Transition to the regular play state. Debug-play drops straight into
          // EveState instead, so late-game states can be tested without first
          // spawning enough animals to trip the real eve trigger. EveState ends
          // by transitioning back to RegularState, so normal play resumes after.
          this._scene.unlockPlayerMovement();
          const next = GameDataManager.instance.data.difficulty === DIFFICULTY.DEBUG_PLAY
            ? GAME_STATES.EVE
            : GAME_STATES.REGULAR;
          this._transitionTo(next);
        });
      });
    });
  }
}
