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

    // 1) 1 sec pause
    this._pause(1000, () => {
      // 2) Narrator text
      this._showNarrator('narrator.assignment', () => {
        // 3) 1 sec pause
        this._pause(1000, () => {
          // 4) Place target void area
          this._scene.earth.placeTargetVoidTiles();
          // 5) 1 sec pause
          this._pause(1000, () => {
            // 6) Transition.
            this._scene.unlockPlayerMovement();
            this._transitionTo(GAME_STATES.BABY_STEPS);
          });
        });
      });
    });
  }
}
