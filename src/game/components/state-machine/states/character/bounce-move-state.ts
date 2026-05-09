import * as Phaser from 'phaser';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { DIRECTION } from '../../../../common/common';
import { Direction } from '../../../../common/types';
import { isArcadePhysicsBody } from '../../../../common/utils';

// How long (ms) the character keeps bouncing before randomly switching to BOUNCE_IDLE_STATE.
const BOUNCE_MOVE_DURATION_MIN = 1500;
const BOUNCE_MOVE_DURATION_MAX = 3500;

export class BounceMoveState extends BaseCharacterState {
  #idleTimer?: Phaser.Time.TimerEvent;

  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.BOUNCE_MOVE_STATE, gameObject);
  }

  public onEnter(): void {
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
    this.#updateFacingFromVelocity(true);
    this.#updateDepth();

    // after a random period of time, switch to bounce-idle so the character pauses to rest
    const delay = Phaser.Math.Between(BOUNCE_MOVE_DURATION_MIN, BOUNCE_MOVE_DURATION_MAX);
    this.#idleTimer = this._gameObject.scene.time.delayedCall(delay, () => {
      this.#idleTimer = undefined;
      this._stateMachine.setState(CHARACTER_STATES.BOUNCE_IDLE_STATE);
    });
  }

  public onExit(): void {
    if (this.#idleTimer !== undefined) {
      this.#idleTimer.remove(false);
      this.#idleTimer = undefined;
    }
  }

  public onUpdate(): void {
    this.#updateFacingFromVelocity(false);
    this.#updateDepth();
  }

  #updateDepth(): void {
    this._gameObject.depth = this._gameObject.y + 32;
  }

  #updateFacingFromVelocity(forceAnimation: boolean): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }

    const direction = this.#getDirectionFromVelocity(
      this._gameObject.body.velocity.x,
      this._gameObject.body.velocity.y,
    );
    if (direction === undefined) {
      return;
    }

    const directionChanged = this._gameObject.direction !== direction;
    if (!forceAnimation && !directionChanged) {
      return;
    }

    this._gameObject.direction = direction;
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);
  }

  #getDirectionFromVelocity(velocityX: number, velocityY: number): Direction | undefined {
    if (velocityX < 0) {
      return DIRECTION.LEFT;
    }

    if (velocityX > 0) {
      return DIRECTION.RIGHT;
    }

    if (velocityY < 0) {
      return DIRECTION.UP;
    }

    if (velocityY > 0) {
      return DIRECTION.DOWN;
    }

    return undefined;
  }
}
