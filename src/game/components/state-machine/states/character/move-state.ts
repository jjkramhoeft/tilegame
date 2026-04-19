import { INTERACTIVE_OBJECT_TYPE } from '../../../../common/common';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { CollidingObjectsComponent } from '../../../game-object/colliding-objects-component';
import { InteractiveObjectComponent } from '../../../game-object/interactive-object-component';
import { InputComponent } from '../../../input/input-component';
import { BaseMoveState } from './base-move-state';

export class MoveState extends BaseMoveState {
  #footstepSound: Phaser.Sound.BaseSound | undefined;

  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.MOVE_STATE, gameObject, 'WALK');
  }

  public onEnter(): void {
    if (this._gameObject.isPlayer) {
      this.#footstepSound = this._gameObject.scene.sound.add('steps', { loop: true });
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

    // if we interacted with an object and switched states, stop processing
    if (this.#checkIfObjectWasInteractedWith(controls)) {
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

  #checkIfObjectWasInteractedWith(controls: InputComponent): boolean {
    const collideComponent = CollidingObjectsComponent.getComponent<CollidingObjectsComponent>(this._gameObject);
    if (collideComponent === undefined || collideComponent.objects.length === 0) {
      return false;
    }

    const collisionObject = collideComponent.objects[0];
    const interactiveObjectComponent =
      InteractiveObjectComponent.getComponent<InteractiveObjectComponent>(collisionObject);
    if (interactiveObjectComponent === undefined) {
      return false;
    }

    if (!controls.isActionKeyJustDown) {
      return false;
    }

    // check if game object can be interacted with
    if (!interactiveObjectComponent.canInteractWith()) {
      return false;
    }

    // we can open this item
    if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.OPEN) {
      this._stateMachine.setState(CHARACTER_STATES.OPEN_CHEST_STATE, collisionObject);
      return true;
    }
    
    interactiveObjectComponent.interact();

    if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.AUTO) {
      return false;
    }

    return false;
  }
}
