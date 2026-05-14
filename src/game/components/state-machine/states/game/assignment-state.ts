import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class AssignmentState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.ASSIGNMENT, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] AssignmentState entered (stub)');
    // TODO Phase 2: narrator + place target void tiles + transition.
  }
}
