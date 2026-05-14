import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { CHARACTER_STATES } from '../character/character-states';
import type { GameScene } from '../../../../scenes/game-scene';

/**
 * First active play state. Player can move and attack. Casting is meant to be
 * limited (off sound, no effect) — that hookup lands in a later phase.
 * Transitions to AssignmentState once the player has both moved and triggered
 * an attack/cast.
 */
export class FirstTileState extends BaseGameState {
  #startX = 0;
  #startY = 0;
  #moved = false;
  #attacked = false;

  constructor(scene: GameScene) {
    super(GAME_STATES.FIRST_TILE, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] FirstTileState entered');
    const player = this._scene.player;
    this.#startX = player.x;
    this.#startY = player.y;
    this.#moved = false;
    this.#attacked = false;
    // TODO Phase 5: implement limited cast (silent sound, no effect) via an
    //   `isLimited = true` flag on the player's weapon/cast component.
  }

  public onUpdate(): void {
    const player = this._scene.player;

    if (!this.#moved) {
      const dx = player.x - this.#startX;
      const dy = player.y - this.#startY;
      if (Math.abs(dx) + Math.abs(dy) > 8) {
        this.#moved = true;
      }
    }

    if (!this.#attacked && player.currentState === CHARACTER_STATES.ATTACK_STATE) {
      this.#attacked = true;
    }

    if (this.#moved && this.#attacked) {
      this._transitionTo(GAME_STATES.ASSIGNMENT);
    }
  }
}
