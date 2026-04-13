import * as Phaser from 'phaser';
import { DIRECTION } from '../../../../common/common';
import { Direction } from '../../../../common/types';
import { isArcadePhysicsBody } from '../../../../common/utils';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { InputComponent } from '../../../input/input-component';
import { BaseCharacterState } from './base-character-state';

export abstract class BaseMoveState extends BaseCharacterState {
  protected _moveAnimationPrefix: 'WALK' | 'WALK_HOLD';

  constructor(stateName: string, gameObject: CharacterGameObject, moveAnimationPrefix: 'WALK' | 'WALK_HOLD') {
    super(stateName, gameObject);
    this._moveAnimationPrefix = moveAnimationPrefix;
  }

  protected isNoInputMovement(controls: InputComponent): boolean {
    return (
      (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) ||
      controls.isMovementLocked
    );
  }

  protected handleCharacterMovement(): void {
    const controls = this._gameObject.controls;
    const directions: Direction[] = [];

    // horizontal movement
    if (controls.isLeftDown) {
      this.updateVelocity(true, -1);
      this.updateDirection(DIRECTION.LEFT);
      directions.push(DIRECTION.LEFT);
    } else if (controls.isRightDown) {
      this.updateVelocity(true, 1);
      this.updateDirection(DIRECTION.RIGHT);
      directions.push(DIRECTION.RIGHT);
    } else {
      this.updateVelocity(true, 0);
    }

    const isHorizontally = controls.isLeftDown || controls.isRightDown;

    // vertical movement
    if (controls.isUpDown) {
      this.updateVelocity(false, -1);
      if (!isHorizontally) {
        this.updateDirection(DIRECTION.UP);
      }
      directions.push(DIRECTION.UP);
    } else if (controls.isDownDown) {
      this.updateVelocity(false, 1);
      if (!isHorizontally) {
        this.updateDirection(DIRECTION.DOWN);
      }
      directions.push(DIRECTION.DOWN);
    } else {
      this.updateVelocity(false, 0);
    }

    this.normalizeVelocity();
    
    if(directions.length > 0) {
      this._gameObject.setLastMoveDirections(directions);
    }
  }

  protected normalizeVelocity(): void {
    // if the player is moving diagonally, the resultant vector will have a magnitude greater than the defined speed.
    // if we normalize the vector, this will make sure the magnitude matches defined speed
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }
    this._gameObject.body.velocity.normalize().scale(this._gameObject.speed);
  }

  protected flip(value: boolean): void {
    this._gameObject.setFlipX(value);
  }

  protected updateVelocity(isX: boolean, value: number): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }
    if (isX) {
      this._gameObject.body.velocity.x = value;
      return;
    }
    this._gameObject.body.velocity.y = value;
  }

  protected updateDirection(direction: Direction): void {
    this._gameObject.direction = direction;
    this._gameObject.animationComponent.playAnimation(`${this._moveAnimationPrefix}_${this._gameObject.direction}`);
  }
}
