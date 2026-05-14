import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';

export class StartState extends BaseGameState {
  constructor(scene: import('../../../../scenes/game-scene').GameScene) {
    super(GAME_STATES.START, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] StartState entered (stub)');
    // TODO Phase 2: implement scripted intro sequence.
  }
}
