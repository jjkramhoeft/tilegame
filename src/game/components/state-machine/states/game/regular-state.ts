import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class RegularState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.REGULAR, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] RegularState entered');
    this._scene.unlockPlayerMovement();
    // Passive holding state. Transitions to firstTree, firstAnimal, eve,
    // bossFight, gameOver and victory states are wired in later phases.
  }
}
