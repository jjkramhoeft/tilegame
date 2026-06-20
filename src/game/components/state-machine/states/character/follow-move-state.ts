import * as Phaser from 'phaser';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { COMPANION_FOLLOW_STOP_RADIUS } from '../../../../common/config';
import { BaseMoveState } from './base-move-state';
import { shouldStopFollowing } from './follow-state-utils';

export type GetTarget = () => CharacterGameObject | undefined;

// Per-axis deadzone (px): don't feed an axis the companion is already aligned
// on, so it doesn't twitch left/right (or up/down) while closing on the target.
const AXIS_DEADZONE = 6;

/**
 * Movement state used by the companion to follow a target (the player). It
 * reuses BaseMoveState's velocity/normalize/animation/flip/depth handling by
 * translating the vector toward the target into the same InputComponent flags a
 * player would press. Once within COMPANION_FOLLOW_STOP_RADIUS it hands off to
 * FOLLOW_IDLE_STATE to rest for a while.
 */
export class FollowMoveState extends BaseMoveState {
  readonly #getTarget: GetTarget;

  constructor(gameObject: CharacterGameObject, getTarget: GetTarget) {
    super(CHARACTER_STATES.FOLLOW_MOVE_STATE, gameObject, 'WALK');
    this.#getTarget = getTarget;
  }

  public onExit(): void {
    // Clear the synthesized input so it doesn't leak into the next state.
    this._gameObject.controls.reset();
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;
    if (controls.isMovementLocked) {
      this._resetObjectVelocity();
      return;
    }

    const target = this.#getTarget();
    if (target === undefined || !target.active || target.isDefeated) {
      // Nothing to follow: stand still (stay in this state so we pick the
      // target back up automatically once it reappears).
      controls.reset();
      this._resetObjectVelocity();
      return;
    }

    const distance = Phaser.Math.Distance.Between(this._gameObject.x, this._gameObject.y, target.x, target.y);
    if (shouldStopFollowing(distance, COMPANION_FOLLOW_STOP_RADIUS)) {
      this._stateMachine.setState(CHARACTER_STATES.FOLLOW_IDLE_STATE);
      return;
    }

    // Translate the vector toward the target into directional "key presses",
    // then let BaseMoveState do the actual velocity/animation/flip/depth work.
    const deltaX = target.x - this._gameObject.x;
    const deltaY = target.y - this._gameObject.y;
    controls.isLeftDown = deltaX < -AXIS_DEADZONE;
    controls.isRightDown = deltaX > AXIS_DEADZONE;
    controls.isUpDown = deltaY < -AXIS_DEADZONE;
    controls.isDownDown = deltaY > AXIS_DEADZONE;

    this.handleCharacterMovement();
  }
}
