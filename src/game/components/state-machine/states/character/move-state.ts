import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { SpellCastingComponent } from '../../../game-object/spell-casting-component';
import { BaseMoveState } from './base-move-state';
import { tryOpenNearestChest } from './interaction-state-utils';

export class MoveState extends BaseMoveState {
  #footstepSound: Phaser.Sound.BaseSound | undefined;

  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.MOVE_STATE, gameObject, 'WALK');
  }

  public onEnter(): void {
    if (this._gameObject.isPlayer) {
      this.#footstepSound = this._gameObject.scene.sound.add('steps', { loop: true, volume: 1.0 });
      this.#footstepSound.play();
    }
  }

  public onExit(): void {
    this.#footstepSound?.stop();
    this.#footstepSound?.destroy();
    this.#footstepSound = undefined;
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

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

    // if we interacted with an object and switched states, stop processing
    if (controls.isActionKeyJustDown && tryOpenNearestChest(this._gameObject, this._stateMachine)) {
      return;
    }

    // if no input is provided transition back to idle state
    if (this.isNoInputMovement(controls)) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // handle character movement
    this.handleCharacterMovement();
  }
}
