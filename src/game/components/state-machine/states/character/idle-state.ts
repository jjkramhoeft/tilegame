import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { isArcadePhysicsBody } from '../../../../common/utils';
import { IDLE_SLOWDOWN_FACTOR, IDLE_STOP_SPEED } from '../../../../common/config';
import { SpellCastingComponent } from '../../../game-object/spell-casting-component';
import { tryOpenNearestChest } from './interaction-state-utils';

export class IdleState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.IDLE_STATE, gameObject);
  }

  public onEnter(): void {
    // play idle animation based on game object direction
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);

    // reset game object velocity
    this._resetObjectVelocity();
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

    if (controls.isMovementLocked) {
      return;
    }

    // if attack key was pressed, attack with weapon
    if (controls.isAttackKeyJustDown) {
      this._stateMachine.setState(CHARACTER_STATES.ATTACK_STATE);
      return;
    }

    // if cast key was pressed, cast a spell (new spellcasting pipeline).
    // Skip the transition entirely if the caster can't cast (e.g. on cooldown)
    // to avoid a 1-frame state churn when mashing the key.
    if (controls.isCastKeyJustDown) {
      const castingComponent = SpellCastingComponent.getComponent<SpellCastingComponent>(this._gameObject);
      if (castingComponent?.canCast) {
        this._stateMachine.setState(CHARACTER_STATES.CASTING_STATE);
        return;
      }
    }

    if (controls.isActionKeyJustDown && tryOpenNearestChest(this._gameObject, this._stateMachine)) {
      return;
    }

    // if no other input is provided, do nothing
    if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
      this.#slowVelocity();
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.MOVE_STATE);
  }

  #slowVelocity(): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }

    const velocity = this._gameObject.body.velocity;
    if (velocity.length() <= IDLE_STOP_SPEED) {
      velocity.set(0, 0);
      return;
    }

    velocity.scale(IDLE_SLOWDOWN_FACTOR);
  }
}
