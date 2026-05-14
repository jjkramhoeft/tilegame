import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class FirstTreeState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.FIRST_TREE, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] FirstTreeState entered (stub)');
    // TODO Phase 3: narrator on first tree placement.
  }
}
