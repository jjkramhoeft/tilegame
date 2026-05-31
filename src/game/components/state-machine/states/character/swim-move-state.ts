import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { BaseMoveState } from './base-move-state';
import { tryOpenNearestChest } from './interaction-state-utils';

export class SwimMoveState extends BaseMoveState {
  #swimSound: Phaser.Sound.BaseSound | undefined;

  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.SWIM_STATE, gameObject, 'SWIM');
  }

  public onEnter(): void {
    // Crop to show only the top half of the sprite (hide legs)
    this._gameObject.setCrop(0, 0, this._gameObject.width, this._gameObject.height / 1.5);

    if (this._gameObject.isPlayer) {
      this.#swimSound = this._gameObject.scene.sound.add('water-splash', { loop: true, volume: 0.9 });
    }
  }

  public onExit(): void {
    // Restore full sprite
    this._gameObject.setCrop();

    this.#swimSound?.stop();
    this.#swimSound?.destroy();
    this.#swimSound = undefined;
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

    // if we interacted with an object and switched states, stop processing
    if (controls.isActionKeyJustDown && tryOpenNearestChest(this._gameObject, this._stateMachine)) {
      return;
    }

    // if no input is provided transition back to idle state
    if (this.isNoInputMovement(controls)) {
      this.#stopSwimSound();
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    this.#playSwimSound();

    // handle character movement
    this.handleCharacterMovement();
  }

  #playSwimSound(): void {
    if (this.#swimSound === undefined || this.#swimSound.isPlaying) {
      return;
    }

    this.#swimSound.play();
  }

  #stopSwimSound(): void {
    if (this.#swimSound?.isPlaying) {
      this.#swimSound.stop();
    }
  }
}
