import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING } from '../../../../common/config';

/**
 * Deferred. See game-state.md -> Victory State.
 *
 * Triggered by either:
 *  - Boss fight ending in player victory (BossFightState -> VictoryState).
 *  - Animal progression maxed (some future trigger from RegularState).
 *
 * Scripted beats once a trigger is wired:
 *  - Narrator: "You have won!.."
 *  - On close, return to the intro/main menu (same pattern as GameOverState).
 */
export class VictoryState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.VICTORY, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] VictoryState entered (stub - deferred)'); }
    // No-op until a trigger is added.
  }
}
