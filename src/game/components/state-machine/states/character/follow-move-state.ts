import * as Phaser from 'phaser';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { COMPANION_FOLLOW_STOP_RADIUS } from '../../../../common/config';
import type { Earth } from '../../../../ground/earth';
import { BaseMoveState } from './base-move-state';
import { isOnWater, shouldStopFollowing } from './follow-state-utils';

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
    // Restore the full sprite in case we exited while swimming (cropped).
    this._gameObject.setCrop();
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

    // Swim (animation + cropped sprite) when on water, walk otherwise — the same
    // tiles the player swims on. This drives the WALK/SWIM prefix that
    // handleCharacterMovement() uses below.
    this.#applySwimVisual(this.#isOnWater());

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

  #isOnWater(): boolean {
    const earth = (this._gameObject.scene as unknown as { earth?: Earth }).earth;
    return earth !== undefined && isOnWater(earth, this._gameObject.x, this._gameObject.y);
  }

  #applySwimVisual(onWater: boolean): void {
    this._moveAnimationPrefix = onWater ? 'SWIM' : 'WALK';
    if (onWater) {
      // Crop to the top half so the legs read as submerged (matches SwimMoveState).
      this._gameObject.setCrop(0, 0, this._gameObject.width, this._gameObject.height / 1.5);
    } else {
      this._gameObject.setCrop();
    }
  }
}
