import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class BabyStepsState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.BABY_STEPS, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] BabyStepsState entered (stub)');
    // TODO Phase 2: track target-void fill + 2 blocking rocks + player south of center.
  }
}
