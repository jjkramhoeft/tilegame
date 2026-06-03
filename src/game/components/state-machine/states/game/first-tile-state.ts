import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { CHARACTER_STATES } from '../character/character-states';
import { CUSTOM_EVENTS, EVENT_BUS } from '../../../../common/event-bus';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING } from '../../../../common/config';

/**
 * First active play state. Player can move and attack and cast. 
 * Transitions to AssignmentState once the player has both moved and triggered
 * an attack and a cast.
 * Use the HUD to show the keys, when they have been pressed they are dimmed, when transitioning out the key help is hiddened.
 */
export class FirstTileState extends BaseGameState {
  #startX = 0;
  #startY = 0;
  #moved = false;
  #attacked = false;
  #casted = false;

  constructor(scene: GameScene) {
    super(GAME_STATES.FIRST_TILE, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] FirstTileState entered'); }
    const player = this._scene.player;
    this.#startX = player.x;
    this.#startY = player.y;
    this.#moved = false;
    this.#attacked = false;
    this.#casted = false;
    EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_HELP_KEYBORD);
  }

  public onUpdate(): void {
    const player = this._scene.player;

    if (!this.#moved) {
      const dx = player.x - this.#startX;
      const dy = player.y - this.#startY;
      if (Math.abs(dx) + Math.abs(dy) > 10) {
        this.#moved = true;
        EVENT_BUS.emit(CUSTOM_EVENTS.DIM_HELP_KEYBORD_KEYS, { textKey: 'Move' });
      }
    }
    
    if (!this.#attacked && player.currentState === CHARACTER_STATES.ATTACK_STATE) {
      this.#attacked = true;
      EVENT_BUS.emit(CUSTOM_EVENTS.DIM_HELP_KEYBORD_KEYS, { textKey: 'Attack' });
    }
    
    if (!this.#casted && player.currentState === CHARACTER_STATES.CASTING_STATE) {
      this.#casted = true;
      EVENT_BUS.emit(CUSTOM_EVENTS.DIM_HELP_KEYBORD_KEYS, { textKey: 'Cast' });
    }

    if (this.#moved && this.#attacked && this.#casted) {
      this._transitionTo(GAME_STATES.ASSIGNMENT);
    }
  }

  public override onExit(): void {
    EVENT_BUS.emit(CUSTOM_EVENTS.HIDE_HELP_KEYBORD);
    super.onExit();
  }
}
