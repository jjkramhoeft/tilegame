import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { DIFFICULTY_HARD_WAIT_FACTOR, ENABLE_LOGGING } from '../../../../common/config';
import { GameDataManager } from '../../../../common/game-data-manager';
import { DIFFICULTY } from '../../../../common/common';

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

    this._pause(this.defaultWaitTime, () => {
      this._showNarrator('narrator.garden.lush', () => {
        this._pause(this.defaultWaitTime, () => {
          this._showNarrator('narrator.garden.assignment', () => {
            this._scene.earth.placeGardenTiles(defaultStepWaitTime, currentPlayerTilePosition, () => {
              this._pause(this.defaultWaitTime, () => {
                this._scene.placeFruitChestNearBigTree();
                this._pause(this.defaultWaitTime, () => {
                  // Transition to the regular play state.
                  this._scene.unlockPlayerMovement();
                  this._transitionTo(GAME_STATES.REGULAR);
                });
              });
            });
          });
        });
      });
    });
  }
}
