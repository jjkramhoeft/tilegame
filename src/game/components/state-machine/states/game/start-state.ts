import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { DataManager } from '../../../../common/data-manager';
import { DIFFICULTY_HARD_WAIT_FACTOR, ENABLE_LOGGING } from '../../../../common/config';
import { ASSET_KEYS } from '../../../../common/assets';

/**
 * Scripted intro that goes from an empty screen to a player standing on the
 * very first tile, ready to be controlled. See `game-state.md` -> Start State.
 */
export class StartState extends BaseGameState {

  #clouds: Phaser.GameObjects.Group;

  constructor(scene: GameScene) {
    super(GAME_STATES.START, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] StartState entered'); }
    let defaultWaitTime = 500;
    if (DataManager.instance.data.difficulty === 'Hard') {
      defaultWaitTime *= DIFFICULTY_HARD_WAIT_FACTOR;
    }

    //ToDo: add some clouds or something to make it less boring while waiting for the first narrator text. Maybe also some music?
    this.#clouds = this._scene.add.group();

    // 1) Empty screen (no player and no tiles): create() already hid the
    //    player, and no tile has been placed yet, so we just wait a moment.
    this._pause(defaultWaitTime, () => {
      // 2) Narrator text. Wait for the player to dismiss it before continuing.
      this._showNarrator('narrator.start.intro', () => {
        // 3) small pause
        this._pause(defaultWaitTime, () => {
          // ToDo: Move the clouds outwards away from the center.

          
          // 4) Place the first tile.
          this._scene.placeStartingTile();
          // 5) small pause
          this._pause(defaultWaitTime, () => {
            // 6) Place the player (movement still disabled).
            this._scene.revealPlayer();
            // 7) small pause
            this._pause(defaultWaitTime, () => {
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
