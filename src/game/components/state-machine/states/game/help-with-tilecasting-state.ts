import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING } from '../../../../common/config';
export class HelpWithTileCastingState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.HELP_WITH_TILECASTING, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] HelpWithTileCastingState entered'); }
    this._scene.lockPlayerMovement();
    this._pause(this.defaultWaitTime, () => {
      this._showNarrator('narrator.helpWithTileCasting', () => {
        this._pause(this.defaultWaitTime, () => {
          this._pause(this.defaultWaitTime, () => {
            // Transition.
            this._scene.unlockPlayerMovement();
            this._transitionTo(GAME_STATES.REGULAR);
          });
        });
      });
    });
  }
}
