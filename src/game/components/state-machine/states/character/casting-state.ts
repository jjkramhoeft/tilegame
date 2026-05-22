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

    const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this._gameObject);
    if (weaponComponent === undefined || weaponComponent.weapon === undefined) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    //Use same animation for spell casting as for attacking
    const weapon = weaponComponent.weapon;
    switch (this._gameObject.direction) {
      case DIRECTION.UP:
        return weapon.attackUp();
      case DIRECTION.DOWN:
        return weapon.attackDown();
      case DIRECTION.LEFT:
        return weapon.attackLeft();
      case DIRECTION.RIGHT:
        return weapon.attackRight();
      default:
        exhaustiveGuard(this._gameObject.direction);
    }
  }

  public onUpdate(): void {
    const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this._gameObject);
    if (weaponComponent === undefined || weaponComponent.weapon === undefined) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // Fire the cast once per state entry, then wait for the weapon animation
    // to finish before returning to idle. Keeps timing identical to attack.
    if (!this.#castFired) {
      this.#castFired = true;
      const castingComponent = SpellCastingComponent.getComponent<SpellCastingComponent>(this._gameObject);
      castingComponent?.cast(this._gameObject.direction);
    }

    // wait until weapon animation is done for attacking, for now only cast one spell at a time
    const weapon = weaponComponent.weapon;
    if (weapon.isAttacking) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }
}
