import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

/** Deferred. Requires companion character type (see game-state.md). */
export class EveState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.EVE, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] EveState entered (stub - deferred)');
  }
}
