import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class FirstTileState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.FIRST_TILE, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] FirstTileState entered (stub)');
    // TODO Phase 2: track first move + attack, then transition to AssignmentState.
  }
}
