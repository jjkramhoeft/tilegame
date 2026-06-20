import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { SCENE_KEYS } from '../../../../scenes/scene-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING } from '../../../../common/config';

/**
 * See game-state.md -> Victory State.
 *
 * Triggered by:
 *  - Animal progression maxed (RegularState, once the player has brought
 *    NUMBER_OF_ANIMALS_TO_WIN creatures into the world).
 *  - Boss fight ending in player victory (BossFightState -> VictoryState) —
 *    still deferred with the boss enemy type.
 *
 * Scripted beats (same pattern as GameOverState):
 *  - Narrator: "You have won!.."
 *  - On close, return to the intro/main menu.
 */
export class VictoryState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.VICTORY, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] VictoryState entered'); }
    this._scene.lockPlayerMovement();
    this._showNarrator('narrator.victory', () => {
      this._scene.scene.start(SCENE_KEYS.INTRO);
    });
  }
}
