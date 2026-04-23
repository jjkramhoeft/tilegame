import * as Phaser from 'phaser';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { DIRECTION } from '../../../../common/common';
import { Direction } from '../../../../common/types';

// How long (ms) the character idles before either resuming bouncing or turning
// to idle in another direction.
const BOUNCE_IDLE_DURATION_MIN = 800;
const BOUNCE_IDLE_DURATION_MAX = 2000;

// Probability (0..1) that, when the idle timer fires, the character turns to a
// new idle direction instead of returning to BOUNCE_MOVE_STATE.
const BOUNCE_IDLE_TURN_CHANCE = 0.5;

const ALL_DIRECTIONS: Direction[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];

export class BounceIdleState extends BaseCharacterState {
  #timer?: Phaser.Time.TimerEvent;

  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.BOUNCE_IDLE_STATE, gameObject);
  }

  public onEnter(): void {
    // stop moving and clear bounce so the character rests in place
    this._resetObjectVelocity();
    this._gameObject.setBounce(0);

    this.#playIdleAnimAndScheduleNext();
  }

  public onExit(): void {
    this.#clearTimer();
  }

  #playIdleAnimAndScheduleNext(): void {
    // play idle animation based on current direction
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);

    const delay = Phaser.Math.Between(BOUNCE_IDLE_DURATION_MIN, BOUNCE_IDLE_DURATION_MAX);
    this.#timer = this._gameObject.scene.time.delayedCall(delay, () => {
      this.#timer = undefined;
      this.#onTimerFired();
    });
  }

  #onTimerFired(): void {
    if (Math.random() < BOUNCE_IDLE_TURN_CHANCE) {
      // pick a random direction different from the current one and keep idling
      const current = this._gameObject.direction;
      const candidates = ALL_DIRECTIONS.filter((d) => d !== current);
      const next = candidates[Phaser.Math.Between(0, candidates.length - 1)];
      this._gameObject.direction = next;
      this.#playIdleAnimAndScheduleNext();
      return;
    }
    // otherwise resume bouncing
    this._stateMachine.setState(CHARACTER_STATES.BOUNCE_MOVE_STATE);
  }

  #clearTimer(): void {
    if (this.#timer !== undefined) {
      this.#timer.remove(false);
      this.#timer = undefined;
    }
  }
}
