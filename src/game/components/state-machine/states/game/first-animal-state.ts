import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class FirstAnimalState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.FIRST_ANIMAL, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] FirstAnimalState entered (stub)');
    // TODO Phase 3: narrator on first animal spawn.
  }
}
