import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class GameOverState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.GAME_OVER, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] GameOverState entered (stub)');
    // TODO Phase 3: narrator "Game Over" + return to intro on close.
  }
}
