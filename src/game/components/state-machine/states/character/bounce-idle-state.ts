import * as Phaser from 'phaser';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';

// How long (ms) the character idles before switching back to BOUNCE_MOVE_STATE.
const BOUNCE_IDLE_DURATION_MIN = 800;
const BOUNCE_IDLE_DURATION_MAX = 2000;

export class BounceIdleState extends BaseCharacterState {
  #moveTimer?: Phaser.Time.TimerEvent;

  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.BOUNCE_IDLE_STATE, gameObject);
  }

  public onEnter(): void {
    // stop moving and clear bounce so the character rests in place
    this._resetObjectVelocity();
    this._gameObject.setBounce(0);

    // play idle animation based on current direction
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);

    // after a random idle period, resume bouncing
    const delay = Phaser.Math.Between(BOUNCE_IDLE_DURATION_MIN, BOUNCE_IDLE_DURATION_MAX);
    this.#moveTimer = this._gameObject.scene.time.delayedCall(delay, () => {
      this.#moveTimer = undefined;
      this._stateMachine.setState(CHARACTER_STATES.BOUNCE_MOVE_STATE);
    });
  }

  public onExit(): void {
    if (this.#moveTimer !== undefined) {
      this.#moveTimer.remove(false);
      this.#moveTimer = undefined;
    }
  }
}
