import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class RegularState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.REGULAR, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] RegularState entered (stub)');
    // TODO Phase 2/3: main play loop; transitions wired in later phases.
  }
}
