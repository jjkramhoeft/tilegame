import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING } from '../../../../common/config';

/**
 * Deferred. See game-state.md -> Boss Fight State.
 *
 * Prerequisites before this state can be implemented:
 *  - Lizardman boss enemy type with health, attacks and death animation.
 *  - Snake minion enemy type spawned on a timer.
 *  - Boss intro sound cue.
 *  - A trigger from RegularState (TBD) to enter this state.
 *
 * On boss defeat -> VictoryState. On player defeat -> GameOverState (already
 * routed via GameProgression's PLAYER_DEFEATED handler).
 */
export class BossFightState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.BOSS_FIGHT, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] BossFightState entered (stub - deferred)'); }
    // No-op: real fight logic lands with the boss enemy type.
  }
}
