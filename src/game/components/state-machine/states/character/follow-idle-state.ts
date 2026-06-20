import * as Phaser from 'phaser';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import {
  COMPANION_FOLLOW_IDLE_MAX_MS,
  COMPANION_FOLLOW_IDLE_MIN_MS,
  COMPANION_FOLLOW_RESUME_RADIUS,
} from '../../../../common/config';
import { GetTarget } from './follow-move-state';
import { shouldResumeFollowing } from './follow-state-utils';

/**
 * Resting counterpart to FollowMoveState. The companion plays its idle
 * animation for a short, randomized dwell and then returns to
 * FOLLOW_MOVE_STATE. It also resumes early if the target drifts beyond
 * COMPANION_FOLLOW_RESUME_RADIUS, so it never stands idle while the player
 * walks away. The two radii form a hysteresis band that prevents
 * move <-> idle flicker at the boundary.
 */
export class FollowIdleState extends BaseCharacterState {
  readonly #getTarget: GetTarget;
  #dwellTimer?: Phaser.Time.TimerEvent;
  #dwellElapsed = false;

  constructor(gameObject: CharacterGameObject, getTarget: GetTarget) {
    super(CHARACTER_STATES.FOLLOW_IDLE_STATE, gameObject);
    this.#getTarget = getTarget;
  }

  public onEnter(): void {
    // play idle animation based on game object direction
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);
    this._resetObjectVelocity();

    this.#dwellElapsed = false;
    const dwell = Phaser.Math.Between(COMPANION_FOLLOW_IDLE_MIN_MS, COMPANION_FOLLOW_IDLE_MAX_MS);
    this.#dwellTimer = this._gameObject.scene.time.delayedCall(dwell, () => {
      this.#dwellElapsed = true;
    });
  }

  public onExit(): void {
    // Drop the pending timer so a stale callback can't flip the flag after we
    // have already left this state.
    this.#dwellTimer?.remove(false);
    this.#dwellTimer = undefined;
  }

  public onUpdate(): void {
    const target = this.#getTarget();
    const distance =
      target === undefined
        ? 0
        : Phaser.Math.Distance.Between(this._gameObject.x, this._gameObject.y, target.x, target.y);

    if (shouldResumeFollowing(distance, COMPANION_FOLLOW_RESUME_RADIUS, this.#dwellElapsed)) {
      this._stateMachine.setState(CHARACTER_STATES.FOLLOW_MOVE_STATE);
    }
  }
}
