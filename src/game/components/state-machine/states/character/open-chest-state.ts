import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { logChestDebug } from '../../../../common/chest-debug';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { CUSTOM_EVENTS, EVENT_BUS } from '../../../../common/event-bus';
import { ChestJJK } from '../../../../game-objects/objects/chestJJK';

export class OpenChestState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.OPEN_CHEST_STATE, gameObject);
  }

  onEnter(args: unknown[]): void {
    const chest = args[0] as ChestJJK;
    logChestDebug('OpenChestState entered', {
      chest: chest.debugInfo,
      playerState: this._stateMachine.currentStateName,
      playerPosition: { x: this._gameObject.x, y: this._gameObject.y },
    });

    // make character invulnerable so we can collect the item
    this._gameObject.invulnerableComponent.invulnerable = true;

    // reset game object velocity
    this._resetObjectVelocity();

    // open the chest visually
    if (!chest.open()) {
      logChestDebug('OpenChestState could not open chest, returning to idle', { chest: chest.debugInfo });
      this._gameObject.invulnerableComponent.invulnerable = false;
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // emit event data regarding chest
    logChestDebug('OpenChestState emitting OPENED_CHEST', { chest: chest.debugInfo });
    EVENT_BUS.emit(CUSTOM_EVENTS.OPENED_CHEST, chest);
    // after showing message to player, transition to idle state
    EVENT_BUS.once(CUSTOM_EVENTS.CHEST_DIALOG_CLOSED, () => {
      logChestDebug('OpenChestState received CHEST_DIALOG_CLOSED', { chest: chest.debugInfo });
      // make character vulnerable so we can take damage
      this._gameObject.invulnerableComponent.invulnerable = false;
      chest.close();
      logChestDebug('OpenChestState returning to idle after close', { chest: chest.debugInfo });
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
    });
  }
}
