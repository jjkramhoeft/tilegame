import * as Phaser from 'phaser';
import { ASSET_KEYS, LIZARD_ANIMATION_KEYS } from '../../common/assets';
import { DIRECTION } from '../../common/common';
import {
  ENEMY_LIZARD_ATTACK_COOLDOWN,
  ENEMY_LIZARD_ATTACK_DAMAGE,
  ENEMY_LIZARD_ATTACK_HIT_DELAY,
  ENEMY_LIZARD_ATTACK_LUNGE_DURATION,
  ENEMY_LIZARD_ATTACK_LUNGE_SPEED,
  ENEMY_LIZARD_ATTACK_RANGE,
  ENEMY_LIZARD_CHANGE_DIRECTION_DELAY_MAX,
  ENEMY_LIZARD_CHANGE_DIRECTION_DELAY_MIN,
  ENEMY_LIZARD_CHANGE_DIRECTION_DELAY_WAIT,
  ENEMY_LIZARD_HURT_PUSH_BACK_SPEED,
  ENEMY_LIZARD_MAX_HEALTH,
  ENEMY_LIZARD_SPEED,
  ENEMY_LIZARD_SUMMON_COOLDOWN,
  ENEMY_LIZARD_SUMMON_COUNT,
  ENEMY_LIZARD_SUMMON_RADIUS,
  ENEMY_LIZARD_SUMMON_DURATION,
  ENEMY_LIZARD_SUMMON_RANGE,
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
import { SummonState } from '../../components/state-machine/states/character/summon-state';
import { playNoteBurst } from '../../spellcasting/note-burst-vfx';
import { CharacterGameObject } from '../common/character-game-object';
import { computeSummonPositions } from './summon-positions';

export type LizardConfig = {
  scene: Phaser.Scene;
  position: Position;
  // Spawns a single snake (wired into the scene) at the given world position.
  // Supplied by whoever owns the enemy group; omit to disable the summon attack.
  summonSnake?: (position: Position) => void;
};

export class Lizard extends CharacterGameObject {
  #lastAttackAt = -ENEMY_LIZARD_ATTACK_COOLDOWN;
  #lastSummonAt = -ENEMY_LIZARD_SUMMON_COOLDOWN;
  readonly #summonSnake?: (position: Position) => void;

  constructor(config: LizardConfig) {
    const animationConfig: AnimationConfig = {
      WALK_DOWN: { key: LIZARD_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      WALK_UP: { key: LIZARD_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
      WALK_LEFT: { key: LIZARD_ANIMATION_KEYS.WALK_LEFT, repeat: -1, ignoreIfPlaying: true },
      WALK_RIGHT: { key: LIZARD_ANIMATION_KEYS.WALK_RIGHT, repeat: -1, ignoreIfPlaying: true },
      IDLE_DOWN: { key: LIZARD_ANIMATION_KEYS.IDLE_DOWN, repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: LIZARD_ANIMATION_KEYS.IDLE_UP, repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: LIZARD_ANIMATION_KEYS.IDLE_LEFT, repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: LIZARD_ANIMATION_KEYS.IDLE_RIGHT, repeat: -1, ignoreIfPlaying: true },
      ATTACK_DOWN: { key: LIZARD_ANIMATION_KEYS.ATTACK_DOWN, repeat: 0, ignoreIfPlaying: true },
      ATTACK_UP: { key: LIZARD_ANIMATION_KEYS.ATTACK_UP, repeat: 0, ignoreIfPlaying: true },
      ATTACK_LEFT: { key: LIZARD_ANIMATION_KEYS.ATTACK_LEFT, repeat: 0, ignoreIfPlaying: true },
      ATTACK_RIGHT: { key: LIZARD_ANIMATION_KEYS.ATTACK_RIGHT, repeat: 0, ignoreIfPlaying: true },
      HURT_DOWN: { key: LIZARD_ANIMATION_KEYS.WALK_DOWN, repeat: 0, ignoreIfPlaying: true },
      HURT_UP: { key: LIZARD_ANIMATION_KEYS.WALK_UP, repeat: 0, ignoreIfPlaying: true },
      HURT_LEFT: { key: LIZARD_ANIMATION_KEYS.WALK_LEFT, repeat: 0, ignoreIfPlaying: true },
      HURT_RIGHT: { key: LIZARD_ANIMATION_KEYS.WALK_RIGHT, repeat: 0, ignoreIfPlaying: true },
      DIE_DOWN: { key: LIZARD_ANIMATION_KEYS.WALK_DOWN, repeat: 0, ignoreIfPlaying: true },
      DIE_UP: { key: LIZARD_ANIMATION_KEYS.WALK_UP, repeat: 0, ignoreIfPlaying: true },
      DIE_LEFT: { key: LIZARD_ANIMATION_KEYS.WALK_LEFT, repeat: 0, ignoreIfPlaying: true },
      DIE_RIGHT: { key: LIZARD_ANIMATION_KEYS.WALK_RIGHT, repeat: 0, ignoreIfPlaying: true },
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.LIZARD_MOVE,
      frame: 0,
      id: `lizard-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_LIZARD_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: false,
      maxLife: ENEMY_LIZARD_MAX_HEALTH,
      contactDamage: 0,
    });

    this.#summonSnake = config.summonSnake;

    this.body?.setSize(24, 32, true);
    this.body?.setOffset(20, 24);

    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.addState(new HurtState(this, ENEMY_LIZARD_HURT_PUSH_BACK_SPEED));
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.addState(new NaturalAttackState(this, {
      getTarget: () => (this.scene as unknown as { player?: CharacterGameObject }).player,
      damage: ENEMY_LIZARD_ATTACK_DAMAGE,
      range: ENEMY_LIZARD_ATTACK_RANGE,
      hitDelay: ENEMY_LIZARD_ATTACK_HIT_DELAY,
      lungeSpeed: ENEMY_LIZARD_ATTACK_LUNGE_SPEED,
      lungeDuration: ENEMY_LIZARD_ATTACK_LUNGE_DURATION,
    }));
    this._stateMachine.addState(new SummonState(this, {
      onSummon: () => this.#summonSnakes(),
      duration: ENEMY_LIZARD_SUMMON_DURATION,
    }));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }

  public enableObject(): void {
    super.enableObject();

    this.scene.time.addEvent({
      delay: Phaser.Math.Between(ENEMY_LIZARD_CHANGE_DIRECTION_DELAY_MIN, ENEMY_LIZARD_CHANGE_DIRECTION_DELAY_MAX),
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
      currentStateName === CHARACTER_STATES.NATURAL_ATTACK_STATE ||
      currentStateName === CHARACTER_STATES.SUMMON_STATE
    ) {
      return;
    }

    const player = (this.scene as unknown as { player?: CharacterGameObject }).player;
    if (player === undefined || !player.active || player.isDefeated) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    // Summon snakes when the player is near (wider range than the thrust) and the
    // 20s cooldown has elapsed. Takes priority over the regular attack.
    if (
      this.#summonSnake !== undefined &&
      distance <= ENEMY_LIZARD_SUMMON_RANGE &&
      this.scene.time.now - this.#lastSummonAt >= ENEMY_LIZARD_SUMMON_COOLDOWN
    ) {
      this.controls.reset();
      this.#faceTarget(player);
      this.#lastSummonAt = this.scene.time.now;
      this._stateMachine.setState(CHARACTER_STATES.SUMMON_STATE);
      return;
    }

    if (distance <= ENEMY_LIZARD_ATTACK_RANGE && this.scene.time.now - this.#lastAttackAt >= ENEMY_LIZARD_ATTACK_COOLDOWN) {
      this.controls.reset();
      this.#faceTarget(player);
      this.#lastAttackAt = this.scene.time.now;
      this._stateMachine.setState(CHARACTER_STATES.NATURAL_ATTACK_STATE);
    }
  }

  #summonSnakes(): void {
    // Epicenter burst at the lizard, then a snake (plus a small burst) at each
    // evenly-spaced point around it.
    playNoteBurst(this.scene, this.x, this.y, { count: 28, tint: 0x7dff8a });

    const positions = computeSummonPositions({ x: this.x, y: this.y }, ENEMY_LIZARD_SUMMON_COUNT, ENEMY_LIZARD_SUMMON_RADIUS);
    for (const position of positions) {
      this.#summonSnake?.(position);
      playNoteBurst(this.scene, position.x, position.y, { count: 12, tint: 0x7dff8a });
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

    this.scene.time.delayedCall(ENEMY_LIZARD_CHANGE_DIRECTION_DELAY_WAIT, () => {
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
        delay: Phaser.Math.Between(ENEMY_LIZARD_CHANGE_DIRECTION_DELAY_MIN, ENEMY_LIZARD_CHANGE_DIRECTION_DELAY_MAX),
        callback: this.#changeDirection,
        callbackScope: this,
        loop: false,
      });
    });
  }
}
