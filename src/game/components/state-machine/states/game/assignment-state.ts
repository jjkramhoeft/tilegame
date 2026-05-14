import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
export class AssignmentState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.ASSIGNMENT, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] AssignmentState entered');
    this._scene.lockPlayerMovement();
    this._pause(this.defaultWaitTime, () => {
      this._showNarrator('narrator.assignment', () => {
        this._pause(this.defaultWaitTime, () => {
          this._scene.earth.placeTargetVoidTiles();
          this._pause(this.defaultWaitTime, () => {
            // Transition.
            this._scene.unlockPlayerMovement();
            this._transitionTo(GAME_STATES.BABY_STEPS);
          });
        });
      });
    });
  }
}
