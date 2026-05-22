import { DIRECTION } from '../../../../common/common';
import { exhaustiveGuard } from '../../../../common/utils';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { SpellCastingComponent } from '../../../game-object/spell-casting-component';
import { WeaponComponent } from '../../../game-object/weapon-component';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';

export class CastingState extends BaseCharacterState {

  #castFired = false;

  constructor(gameObject: CharacterGameObject) {

    super(CHARACTER_STATES.CASTING_STATE, gameObject);
  }

  public onEnter(): void {
    // reset game object velocity
    this._resetObjectVelocity();
    this.#castFired = false;

    // Trigger the weapon attack animation as visual feedback for the cast.
    // `weapon.attack*()` plays on the player's main sprite, so we have to keep
    // the state alive in onUpdate until the animation finishes - otherwise
    // IdleState.onEnter would overwrite it on the very next frame.
    // Note: this animation wait is *only* about letting the visual play; the
    // functional cooldown lives on SpellCastingComponent and is enforced
    // independently (and is typically longer than the attack animation).
    const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this._gameObject);
    const weapon = weaponComponent?.weapon;
    if (weapon !== undefined) {
      switch (this._gameObject.direction) {
        case DIRECTION.UP:
          weapon.attackUp();
          break;
        case DIRECTION.DOWN:
          weapon.attackDown();
          break;
        case DIRECTION.LEFT:
          weapon.attackLeft();
          break;
        case DIRECTION.RIGHT:
          weapon.attackRight();
          break;
        default:
          exhaustiveGuard(this._gameObject.direction);
      }
    }
  }

  public onUpdate(): void {
    // Fire the cast once per state entry (component enforces cooldown/canCast).
    if (!this.#castFired) {
      this.#castFired = true;
      const castingComponent = SpellCastingComponent.getComponent<SpellCastingComponent>(this._gameObject);
      castingComponent?.cast(this._gameObject.direction);
    }

    // Wait for the weapon attack animation to finish before returning to idle,
    // so IdleState.onEnter doesn't overwrite the still-playing attack anim.
    const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this._gameObject);
    const weapon = weaponComponent?.weapon;
    if (weapon?.isAttacking) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }
}
