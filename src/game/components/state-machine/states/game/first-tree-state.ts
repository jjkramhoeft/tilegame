import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class FirstTreeState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.FIRST_TREE, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] FirstTreeState entered');
    this._scene.lockPlayerMovement();
    // 1) 1 sec pause
    this._pause(1000, () => {
      // 2) Narrator text. 3) Transition back to RegularState on close.
      this._showNarrator('narrator.firstTree', () => {
        this._scene.unlockPlayerMovement();
        this._transitionTo(GAME_STATES.REGULAR);
      });
    });
  }
}
