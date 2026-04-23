import * as Phaser from 'phaser';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';

export class BounceMoveState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.BOUNCE_MOVE_STATE, gameObject);
  }

  public onEnter(): void {
    // play idle animation based on game object direction
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);

    // pick a random direction to start moving towards (4 diagonals + 4 cardinals = 8)
    const speed = this._gameObject.speed;
    const randomDirection = Phaser.Math.Between(0, 7);
    if (randomDirection === 0) {
      this._gameObject.setVelocity(speed, speed * -1);
    } else if (randomDirection === 1) {
      this._gameObject.setVelocity(speed, speed);
    } else if (randomDirection === 2) {
      this._gameObject.setVelocity(speed * -1, speed);
    } else if (randomDirection === 3) {
      this._gameObject.setVelocity(speed * -1, speed * -1);
    } else if (randomDirection === 4) {
      this._gameObject.setVelocity(0, speed * -1);
    } else if (randomDirection === 5) {
      this._gameObject.setVelocity(speed, 0);
    } else if (randomDirection === 6) {
      this._gameObject.setVelocity(0, speed);
    } else {
      this._gameObject.setVelocity(speed * -1, 0);
    }
    this._gameObject.setBounce(1);
  }
}
