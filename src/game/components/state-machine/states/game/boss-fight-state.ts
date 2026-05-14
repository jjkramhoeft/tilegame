import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

/** Deferred. Requires boss enemy type (see game-state.md). */
export class BossFightState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.BOSS_FIGHT, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] BossFightState entered (stub - deferred)');
  }
}
