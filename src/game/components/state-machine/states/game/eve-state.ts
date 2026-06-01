import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING } from '../../../../common/config';

/**
 * Deferred. See game-state.md -> Eve State.
 *
 * Prerequisites before this state can be implemented:
 *  - Companion character type (Adam/Eve), opposite sex of the player, sharing
 *    the player's gear/weapon but unchangeable.
 *  - Following + auto-attack behaviour for the companion.
 *  - Companion adds to player's max health on introduction.
 *  - Can interact with Companion for a simple dialog
 *  - Animal multiplication mechanic.
 *  - A trigger from RegularState (TBD) to enter this state.
 *
 * Scripted beats once those land:
 *  1) Narrator: "It is not good to be alone..."
 *  2) Spawn the companion next to the player.
 *  3) Narrator: "...Here is a companion fitting for you..."
 *  4) Transition back to RegularState.
 */
export class EveState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.EVE, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] EveState entered (stub - deferred)'); }
    // No-op: transitions back to RegularState are wired when the companion
    // character type ships.
  }
}
