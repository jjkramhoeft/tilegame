import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

/** Deferred. Triggered by boss fight end or animal progression maxed. */
export class VictoryState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.VICTORY, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] VictoryState entered (stub - deferred)');
  }
}
