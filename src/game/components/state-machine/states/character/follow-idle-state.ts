import * as Phaser from 'phaser';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import {
  COMPANION_FOLLOW_IDLE_MAX_MS,
  COMPANION_FOLLOW_IDLE_MIN_MS,
  COMPANION_FOLLOW_RESUME_RADIUS,
} from '../../../../common/config';
import type { Earth } from '../../../../ground/earth';
import { GetTarget } from './follow-move-state';
import { isOnWater, shouldResumeFollowing } from './follow-state-utils';

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
    // While resting the companion never moves, so its water status is fixed for
    // the duration of this state: tread water (swim anim + cropped) when on a
    // water tile, otherwise the normal idle pose.
    const earth = (this._gameObject.scene as unknown as { earth?: Earth }).earth;
    const onWater = earth !== undefined && isOnWater(earth, this._gameObject.x, this._gameObject.y);
    if (onWater) {
      this._gameObject.setCrop(0, 0, this._gameObject.width, this._gameObject.height / 1.5);
      this._gameObject.animationComponent.playAnimation(`SWIM_${this._gameObject.direction}`);
    } else {
      this._gameObject.setCrop();
      this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);
    }
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
    // Restore the full sprite in case we were treading water (cropped).
    this._gameObject.setCrop();
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
