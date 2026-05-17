import * as Phaser from 'phaser';
import { Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import {
  ENEMY_SNAKE_ATTACK_RANGE,
  ENEMY_SNAKE_CHANGE_DIRECTION_DELAY_MAX,
  ENEMY_SNAKE_CHANGE_DIRECTION_DELAY_MIN,
  ENEMY_SNAKE_CHANGE_DIRECTION_DELAY_WAIT,
  ENEMY_SNAKE_HURT_PUSH_BACK_SPEED,
  ENEMY_SNAKE_MAX_HEALTH,
  ENEMY_SNAKE_SPEED,
} from '../../common/config';
import { AnimationConfig } from '../../components/game-object/animation-component';
import { ASSET_KEYS, SNAKE_ANIMATION_KEYS } from '../../common/assets';
import { CharacterGameObject } from '../common/character-game-object';
import { DIRECTION } from '../../common/common';
import { HurtState } from '../../components/state-machine/states/character/hurt-state';
import { DeathState } from '../../components/state-machine/states/character/death-state';

export type SnakeConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Snake extends CharacterGameObject {
  // Tracks whether we are currently overriding state animations with the attack anim
  // so we only swap once per range-enter / range-exit.
  #isAttacking = false;

  constructor(config: SnakeConfig) {
    // Snake spritesheet has dedicated walk/idle/attack frames per direction, but no
    // hurt/death frames. Fall back to IDLE_<dir> for HURT_*/DIE_* (same approach as Lamb).
    const animationConfig: AnimationConfig = {
      WALK_DOWN: { key: SNAKE_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      WALK_UP: { key: SNAKE_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
      WALK_LEFT: { key: SNAKE_ANIMATION_KEYS.WALK_LEFT, repeat: -1, ignoreIfPlaying: true },
      WALK_RIGHT: { key: SNAKE_ANIMATION_KEYS.WALK_RIGHT, repeat: -1, ignoreIfPlaying: true },
      IDLE_DOWN: { key: SNAKE_ANIMATION_KEYS.IDLE_DOWN, repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: SNAKE_ANIMATION_KEYS.IDLE_UP, repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: SNAKE_ANIMATION_KEYS.IDLE_LEFT, repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: SNAKE_ANIMATION_KEYS.IDLE_RIGHT, repeat: -1, ignoreIfPlaying: true },
      HURT_DOWN: { key: SNAKE_ANIMATION_KEYS.IDLE_DOWN, repeat: 0, ignoreIfPlaying: true },
      HURT_UP: { key: SNAKE_ANIMATION_KEYS.IDLE_UP, repeat: 0, ignoreIfPlaying: true },
      HURT_LEFT: { key: SNAKE_ANIMATION_KEYS.IDLE_LEFT, repeat: 0, ignoreIfPlaying: true },
      HURT_RIGHT: { key: SNAKE_ANIMATION_KEYS.IDLE_RIGHT, repeat: 0, ignoreIfPlaying: true },
      DIE_DOWN: { key: SNAKE_ANIMATION_KEYS.IDLE_DOWN, repeat: 0, ignoreIfPlaying: true },
      DIE_UP: { key: SNAKE_ANIMATION_KEYS.IDLE_UP, repeat: 0, ignoreIfPlaying: true },
      DIE_LEFT: { key: SNAKE_ANIMATION_KEYS.IDLE_LEFT, repeat: 0, ignoreIfPlaying: true },
      DIE_RIGHT: { key: SNAKE_ANIMATION_KEYS.IDLE_RIGHT, repeat: 0, ignoreIfPlaying: true },
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.SNAKE,
      frame: 0,
      id: `snake-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_SNAKE_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: false,
      maxLife: ENEMY_SNAKE_MAX_HEALTH,
      contactDamage: 1,
    });

    // double the visual size of the 32x32 snake sprite
    this.setScale(2);

    // shrink the physics hitbox to half the sprite-frame size and re-center it
    this.body?.setSize(16, 16, true);
    this.body?.setOffset(8, 18);

    // add state machine
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.addState(new HurtState(this, ENEMY_SNAKE_HURT_PUSH_BACK_SPEED));
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }

  public enableObject(): void {
    super.enableObject();

    // start simple ai movement pattern (same cadence as the spider)
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(ENEMY_SNAKE_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SNAKE_CHANGE_DIRECTION_DELAY_MAX),
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
    // Don't override hurt/death animations
    if (currentStateName === CHARACTER_STATES.HURT_STATE || currentStateName === CHARACTER_STATES.DEATH_STATE) {
      this.#isAttacking = false;
      return;
    }

    const player = (this.scene as unknown as { player?: Phaser.GameObjects.Sprite }).player;
    if (player === undefined) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (distance <= ENEMY_SNAKE_ATTACK_RANGE) {
      // Stop moving while attacking and play the directional attack animation
      this.controls.reset();
      const attackKey = this.#getAttackAnimKey();
      if (!this.#isAttacking || this.anims.currentAnim?.key !== attackKey) {
        this.play({ key: attackKey, repeat: -1 }, true);
      }
      this.#isAttacking = true;
    } else if (this.#isAttacking) {
      // Player left attack range - resume normal AI by letting the state machine
      // repaint its animation on the next idle/move transition.
      this.#isAttacking = false;
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
    }
  }

  #getAttackAnimKey(): string {
    switch (this.direction) {
      case DIRECTION.UP:
        return SNAKE_ANIMATION_KEYS.ATTACK_UP;
      case DIRECTION.LEFT:
        return SNAKE_ANIMATION_KEYS.ATTACK_LEFT;
      case DIRECTION.RIGHT:
        return SNAKE_ANIMATION_KEYS.ATTACK_RIGHT;
      case DIRECTION.DOWN:
      default:
        return SNAKE_ANIMATION_KEYS.ATTACK_DOWN;
    }
  }

  #changeDirection(): void {
    // reset existing enemy input
    this.controls.reset();

    if (!this.active) {
      return;
    }

    // wait a small period of time and then choose a random direction to move
    this.scene.time.delayedCall(ENEMY_SNAKE_CHANGE_DIRECTION_DELAY_WAIT, () => {
      // Don't fight the attack override
      if (!this.#isAttacking) {
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

      // set up event for next direction change
      this.scene.time.addEvent({
        delay: Phaser.Math.Between(ENEMY_SNAKE_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SNAKE_CHANGE_DIRECTION_DELAY_MAX),
        callback: this.#changeDirection,
        callbackScope: this,
        loop: false,
      });
    });
  }
}
