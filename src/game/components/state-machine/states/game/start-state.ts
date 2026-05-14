import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

/**
 * Scripted intro that goes from an empty screen to a player standing on the
 * very first tile, ready to be controlled. See `game-state.md` -> Start State.
 */
export class StartState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.START, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] StartState entered');

    // 1) Empty screen (no player and no tiles): create() already hid the
    //    player, and no tile has been placed yet, so we just wait a moment.
    this._pause(500, () => {
      // 2) Narrator text. Wait for the player to dismiss it before continuing.
      this._showNarrator('narrator.start.intro', () => {
        // 3) 1 sec pause
        this._pause(1000, () => {
          // 4) Place the first tile.
          this._scene.placeStartingTile();
          // 5) 1 sec pause
          this._pause(1000, () => {
            // 6) Place the player (movement still disabled).
            this._scene.revealPlayer();
            // 7) 1 sec pause
            this._pause(1000, () => {
              // 8) Second narrator beat.
              this._showNarrator('narrator.start.youCreated', () => {
                // 9) Enable player movement.
                this._scene.unlockPlayerMovement();
                // 10) Transition to the First Tile state.
                this._transitionTo(GAME_STATES.FIRST_TILE);
              });
            });
          });
        });
      });
    });
  }
}
