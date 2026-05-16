import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class FirstTreeState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.FIRST_TREE, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] FirstTreeState entered');
    this._scene.progression.unlockMap();
    this._scene.lockPlayerMovement();
    this._pause(this.defaultWaitTime, () => {
      this._showNarrator('narrator.firstTree', () => {
        this._scene.unlockPlayerMovement();
        this._transitionTo(GAME_STATES.REGULAR);
      });
    });
  }
}
