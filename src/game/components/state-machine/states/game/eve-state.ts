import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING } from '../../../../common/config';

/**
 * Triggered from RegularState once the player has brought
 * NUMBER_OF_ANIMALS_TO_TRIGGER_EVE_STATE creatures into the world.
 *
 * Scripted beats (this first pass — placement only):
 *  1) Narrator: "It is not good to be alone..."
 *  2) Spawn the companion next to the player.
 *  3) Narrator: "...Here is a companion fitting for you."
 *  4) Transition back to RegularState.
 *
 * Still deferred (blocked on `follow-move-state`): following + auto-attack,
 * +max-health on introduction, talk-to-companion interaction, and the animal
 * multiplication mechanic. The companion is a static idle character for now.
 */
export class EveState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.EVE, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] EveState entered'); }
    this._scene.lockPlayerMovement();
    this._pause(this.defaultWaitTime, () => {
      this._showNarrator('narrator.eve.alone', () => {
        this._scene.spawnCompanion();
        this._pause(this.defaultWaitTime, () => {
          this._showNarrator('narrator.eve.companion', () => {
            this._scene.unlockPlayerMovement();
            this._transitionTo(GAME_STATES.REGULAR);
          });
        });
      });
    });
  }
}
