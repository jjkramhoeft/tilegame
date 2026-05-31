import * as Phaser from 'phaser';
import { ASSET_KEYS, SKELETON_ANIMATION_KEYS } from '../../common/assets';
import { DIRECTION } from '../../common/common';
import {
  ENEMY_SKELETON_ATTACK_COOLDOWN,
  ENEMY_SKELETON_ATTACK_DAMAGE,
  ENEMY_SKELETON_ATTACK_HIT_DELAY,
  ENEMY_SKELETON_ATTACK_RANGE,
  ENEMY_SKELETON_CHANGE_DIRECTION_DELAY_MAX,
  ENEMY_SKELETON_CHANGE_DIRECTION_DELAY_MIN,
  ENEMY_SKELETON_CHANGE_DIRECTION_DELAY_WAIT,
  ENEMY_SKELETON_HURT_PUSH_BACK_SPEED,
  ENEMY_SKELETON_MAX_HEALTH,
  ENEMY_SKELETON_SPEED,
} from '../../common/config';
import { Position } from '../../common/types';
import { AnimationConfig } from '../../components/game-object/animation-component';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { DeathState } from '../../components/state-machine/states/character/death-state';
import { HurtState } from '../../components/state-machine/states/character/hurt-state';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import { NaturalAttackState } from '../../components/state-machine/states/character/natural-attack-state';
import { CharacterGameObject } from '../common/character-game-object';

export type SkeletonConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Skeleton extends CharacterGameObject {
  #lastAttackAt = -ENEMY_SKELETON_ATTACK_COOLDOWN;

  constructor(config: SkeletonConfig) {
    const animationConfig: AnimationConfig = {
      WALK_DOWN: { key: SKELETON_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      WALK_UP: { key: SKELETON_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
      WALK_LEFT: { key: SKELETON_ANIMATION_KEYS.WALK_LEFT, repeat: -1, ignoreIfPlaying: true },
      WALK_RIGHT: { key: SKELETON_ANIMATION_KEYS.WALK_RIGHT, repeat: -1, ignoreIfPlaying: true },
      IDLE_DOWN: { key: SKELETON_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: SKELETON_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: SKELETON_ANIMATION_KEYS.WALK_LEFT, repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: SKELETON_ANIMATION_KEYS.WALK_RIGHT, repeat: -1, ignoreIfPlaying: true },
      ATTACK_DOWN: { key: SKELETON_ANIMATION_KEYS.ATTACK_DOWN, repeat: 0, ignoreIfPlaying: true },
      ATTACK_UP: { key: SKELETON_ANIMATION_KEYS.ATTACK_UP, repeat: 0, ignoreIfPlaying: true },
      ATTACK_LEFT: { key: SKELETON_ANIMATION_KEYS.ATTACK_LEFT, repeat: 0, ignoreIfPlaying: true },
      ATTACK_RIGHT: { key: SKELETON_ANIMATION_KEYS.ATTACK_RIGHT, repeat: 0, ignoreIfPlaying: true },
      HURT_DOWN: { key: SKELETON_ANIMATION_KEYS.WALK_DOWN, repeat: 0, ignoreIfPlaying: true },
      HURT_UP: { key: SKELETON_ANIMATION_KEYS.WALK_UP, repeat: 0, ignoreIfPlaying: true },
      HURT_LEFT: { key: SKELETON_ANIMATION_KEYS.WALK_LEFT, repeat: 0, ignoreIfPlaying: true },
      HURT_RIGHT: { key: SKELETON_ANIMATION_KEYS.WALK_RIGHT, repeat: 0, ignoreIfPlaying: true },
      DIE_DOWN: { key: SKELETON_ANIMATION_KEYS.WALK_DOWN, repeat: 0, ignoreIfPlaying: true },
      DIE_UP: { key: SKELETON_ANIMATION_KEYS.WALK_UP, repeat: 0, ignoreIfPlaying: true },
      DIE_LEFT: { key: SKELETON_ANIMATION_KEYS.WALK_LEFT, repeat: 0, ignoreIfPlaying: true },
      DIE_RIGHT: { key: SKELETON_ANIMATION_KEYS.WALK_RIGHT, repeat: 0, ignoreIfPlaying: true },
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.SKELETON_MOVE,
      frame: 0,
      id: `skeleton-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_SKELETON_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: false,
      maxLife: ENEMY_SKELETON_MAX_HEALTH,
      contactDamage: 0,
    });

    this.body?.setSize(24, 32, true);
    this.body?.setOffset(20, 24);

    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.addState(new HurtState(this, ENEMY_SKELETON_HURT_PUSH_BACK_SPEED));
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.addState(new NaturalAttackState(this, {
      getTarget: () => (this.scene as unknown as { player?: CharacterGameObject }).player,
      damage: ENEMY_SKELETON_ATTACK_DAMAGE,
      range: ENEMY_SKELETON_ATTACK_RANGE,
      hitDelay: ENEMY_SKELETON_ATTACK_HIT_DELAY,
    }));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }

  public enableObject(): void {
    super.enableObject();

    this.scene.time.addEvent({
      delay: Phaser.Math.Between(ENEMY_SKELETON_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SKELETON_CHANGE_DIRECTION_DELAY_MAX),
      callback: this.#changeDirection,
      callbackScope: this,
      loop: false,
    });
  }

  public update(): void {
    super.update();

    if (!this.active || this._isDefeated) {
      return;
    }

    const currentStateName = this._stateMachine.currentStateName;
    if (
      currentStateName === CHARACTER_STATES.HURT_STATE ||
      currentStateName === CHARACTER_STATES.DEATH_STATE ||
      currentStateName === CHARACTER_STATES.NATURAL_ATTACK_STATE
    ) {
      return;
    }

    const player = (this.scene as unknown as { player?: CharacterGameObject }).player;
    if (player === undefined || !player.active || player.isDefeated) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (distance <= ENEMY_SKELETON_ATTACK_RANGE && this.scene.time.now - this.#lastAttackAt >= ENEMY_SKELETON_ATTACK_COOLDOWN) {
      this.controls.reset();
      this.#faceTarget(player);
      this.#lastAttackAt = this.scene.time.now;
      this._stateMachine.setState(CHARACTER_STATES.NATURAL_ATTACK_STATE);
    }
  }

  #faceTarget(target: CharacterGameObject): void {
    const deltaX = target.x - this.x;
    const deltaY = target.y - this.y;
    this.direction = Math.abs(deltaX) > Math.abs(deltaY)
      ? deltaX < 0 ? DIRECTION.LEFT : DIRECTION.RIGHT
      : deltaY < 0 ? DIRECTION.UP : DIRECTION.DOWN;
  }

  #changeDirection(): void {
    this.controls.reset();

    if (!this.active) {
      return;
    }

    this.scene.time.delayedCall(ENEMY_SKELETON_CHANGE_DIRECTION_DELAY_WAIT, () => {
      if (this._stateMachine.currentStateName !== CHARACTER_STATES.NATURAL_ATTACK_STATE) {
        const randomDirection = Phaser.Math.Between(0, 3);
        if (randomDirection === 0) {
          this.controls.isUpDown = true;
        } else if (randomDirection === 1) {
          this.controls.isRightDown = true;
        } else if (randomDirection === 2) {
          this.controls.isDownDown = true;
        } else {
          this.controls.isLeftDown = true;
        }
      }

      this.scene.time.addEvent({
        delay: Phaser.Math.Between(ENEMY_SKELETON_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SKELETON_CHANGE_DIRECTION_DELAY_MAX),
        callback: this.#changeDirection,
        callbackScope: this,
        loop: false,
      });
    });
  }
}