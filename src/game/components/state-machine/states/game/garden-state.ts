import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { DIFFICULTY_HARD_WAIT_FACTOR } from '../../../../common/config';
import { DataManager } from '../../../../common/data-manager';

export class GardenState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.GARDEN, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] GardenState entered');
    this._scene.lockPlayerMovement();
    let defaultWaitTime = 500;
    let defaultStepWaitTime = 80;
    if(DataManager.instance.data.difficulty === 'Hard') {
      defaultWaitTime *= DIFFICULTY_HARD_WAIT_FACTOR;
      defaultStepWaitTime *= DIFFICULTY_HARD_WAIT_FACTOR;
    }

    this._pause(defaultWaitTime, () => {
      this._showNarrator('narrator.garden.lush', () => {
        this._pause(defaultWaitTime, () => {
          this._showNarrator('narrator.garden.assignment', () => {
            this._scene.earth.placeGardenTiles(defaultStepWaitTime, () => {
              this._pause(defaultWaitTime, () => {
                this._scene.placeFruitChestNearBigTree();
                this._pause(defaultWaitTime, () => {
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
