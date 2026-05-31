import * as Phaser from 'phaser';
import { ASSET_KEYS, PLANT1_ANIMATION_KEYS, PLANT2_ANIMATION_KEYS, PLANT3_ANIMATION_KEYS } from '../../common/assets';
import { DIRECTION } from '../../common/common';
import {
  ENEMY_PLANT_ATTACK_COOLDOWN,
  ENEMY_PLANT_ATTACK_DAMAGE,
  ENEMY_PLANT_ATTACK_RANGE,
  ENEMY_PLANT_HURT_PUSH_BACK_SPEED,
  ENEMY_PLANT_MAX_HEALTH,
  ENEMY_PLANT_SPEED,
} from '../../common/config';
import { Position } from '../../common/types';
import { isArcadePhysicsBody } from '../../common/utils';
import { AnimationConfig } from '../../components/game-object/animation-component';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { DeathState } from '../../components/state-machine/states/character/death-state';
import { HurtState } from '../../components/state-machine/states/character/hurt-state';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { CharacterGameObject } from '../common/character-game-object';

type PlantAnimationKeys = {
  ATTACK_UP: string;
  ATTACK_DOWN: string;
  ATTACK_LEFT: string;
  ATTACK_RIGHT: string;
  IDLE_UP: string;
  IDLE_DOWN: string;
  IDLE_LEFT: string;
  IDLE_RIGHT: string;
  DEATH_UP: string;
  DEATH_DOWN: string;
  DEATH_LEFT: string;
  DEATH_RIGHT: string;
};

export type PlantVariant = {
  assetKey: string;
  animationKeys: PlantAnimationKeys;
};

export type PlantConfig = {
  scene: Phaser.Scene;
  position: Position;
  variant?: PlantVariant;
};

const PLANT_VARIANTS: PlantVariant[] = [
  { assetKey: ASSET_KEYS.PLANT1_IDLE, animationKeys: PLANT1_ANIMATION_KEYS },
  { assetKey: ASSET_KEYS.PLANT2_IDLE, animationKeys: PLANT2_ANIMATION_KEYS },
  { assetKey: ASSET_KEYS.PLANT3_IDLE, animationKeys: PLANT3_ANIMATION_KEYS },
];

export class Plant extends CharacterGameObject {
  readonly #animationKeys: PlantAnimationKeys;
  #isAttacking = false;
  #lastAttackAt = -ENEMY_PLANT_ATTACK_COOLDOWN;

  constructor(config: PlantConfig) {
    const variant = config.variant ?? Phaser.Utils.Array.GetRandom(PLANT_VARIANTS);
    const animationConfig: AnimationConfig = {
      IDLE_DOWN: { key: variant.animationKeys.IDLE_DOWN, repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: variant.animationKeys.IDLE_UP, repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: variant.animationKeys.IDLE_LEFT, repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: variant.animationKeys.IDLE_RIGHT, repeat: -1, ignoreIfPlaying: true },
      HURT_DOWN: { key: variant.animationKeys.IDLE_DOWN, repeat: 0, ignoreIfPlaying: true },
      HURT_UP: { key: variant.animationKeys.IDLE_UP, repeat: 0, ignoreIfPlaying: true },
      HURT_LEFT: { key: variant.animationKeys.IDLE_LEFT, repeat: 0, ignoreIfPlaying: true },
      HURT_RIGHT: { key: variant.animationKeys.IDLE_RIGHT, repeat: 0, ignoreIfPlaying: true },
      DIE_DOWN: { key: variant.animationKeys.DEATH_DOWN, repeat: 0, ignoreIfPlaying: true },
      DIE_UP: { key: variant.animationKeys.DEATH_UP, repeat: 0, ignoreIfPlaying: true },
      DIE_LEFT: { key: variant.animationKeys.DEATH_LEFT, repeat: 0, ignoreIfPlaying: true },
      DIE_RIGHT: { key: variant.animationKeys.DEATH_RIGHT, repeat: 0, ignoreIfPlaying: true },
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: variant.assetKey,
      frame: 0,
      id: `plant-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_PLANT_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: false,
      maxLife: ENEMY_PLANT_MAX_HEALTH,
      contactDamage: ENEMY_PLANT_ATTACK_DAMAGE,
    });

    this.#animationKeys = variant.animationKeys;
    if (isArcadePhysicsBody(this.body)) {
      this.body.immovable = true;
      this.body.pushable = false;
      this.body.setSize(32, 32, true);
      this.body.setOffset(16, 24);
    }

    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new HurtState(this, ENEMY_PLANT_HURT_PUSH_BACK_SPEED));
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }

  public enableObject(): void {
    super.enableObject();
    this.controls.reset();
    this.#resetVelocity();
  }

  public update(): void {
    super.update();
    this.#resetVelocity();

    if (!this.active || this._isDefeated) {
      return;
    }

    const currentStateName = this._stateMachine.currentStateName;
    if (currentStateName === CHARACTER_STATES.HURT_STATE || currentStateName === CHARACTER_STATES.DEATH_STATE) {
      this.#isAttacking = false;
      return;
    }

    const player = (this.scene as unknown as { player?: CharacterGameObject }).player;
    if (player === undefined || !player.active || player.isDefeated) {
      this.#setIdleAnimation();
      return;
    }

    const directionChanged = this.#facePlayer(player);
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (distance <= ENEMY_PLANT_ATTACK_RANGE) {
      this.#attack(player);
      return;
    }

    if (this.#isAttacking || directionChanged) {
      this.#setIdleAnimation();
    }
  }

  #attack(player: CharacterGameObject): void {
    const attackKey = this.#getAttackAnimationKey();
    if (!this.#isAttacking || this.anims.currentAnim?.key !== attackKey) {
      this.play({ key: attackKey, repeat: -1 }, true);
    }

    this.#isAttacking = true;
    const now = this.scene.time.now;
    if (now - this.#lastAttackAt < ENEMY_PLANT_ATTACK_COOLDOWN) {
      return;
    }

    if (player.hit(this.direction, ENEMY_PLANT_ATTACK_DAMAGE)) {
      this.#lastAttackAt = now;
    }
  }

  #facePlayer(player: CharacterGameObject): boolean {
    const previousDirection = this.direction;
    const deltaX = player.x - this.x;
    const deltaY = player.y - this.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.direction = deltaX < 0 ? DIRECTION.LEFT : DIRECTION.RIGHT;
    } else {
      this.direction = deltaY < 0 ? DIRECTION.UP : DIRECTION.DOWN;
    }

    return previousDirection !== this.direction;
  }

  #setIdleAnimation(): void {
    this.#isAttacking = false;
    this.animationComponent.playAnimation(`IDLE_${this.direction}`);
  }

  #getAttackAnimationKey(): string {
    switch (this.direction) {
      case DIRECTION.UP:
        return this.#animationKeys.ATTACK_UP;
      case DIRECTION.LEFT:
        return this.#animationKeys.ATTACK_LEFT;
      case DIRECTION.RIGHT:
        return this.#animationKeys.ATTACK_RIGHT;
      case DIRECTION.DOWN:
      default:
        return this.#animationKeys.ATTACK_DOWN;
    }
  }

  #resetVelocity(): void {
    if (!isArcadePhysicsBody(this.body)) {
      return;
    }
    this.body.velocity.set(0, 0);
  }
}