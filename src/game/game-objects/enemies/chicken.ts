import * as Phaser from 'phaser';
import { Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { BounceMoveState } from '../../components/state-machine/states/character/bounce-move-state';
import { BounceIdleState } from '../../components/state-machine/states/character/bounce-idle-state';
import {
  ENEMY_CHICKEN_HURT_PUSH_BACK_SPEED,
  ENEMY_CHICKEN_MAX_HEALTH,
  ENEMY_CHICKEN_SPEED,
} from '../../common/config';
import { AnimationConfig } from '../../components/game-object/animation-component';
import { ASSET_KEYS, CHICKEN_ANIMATION_KEYS } from '../../common/assets';
import { CharacterGameObject } from '../common/character-game-object';
import { HurtState } from '../../components/state-machine/states/character/hurt-state';
import { DeathState } from '../../components/state-machine/states/character/death-state';

export type ChickenConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Chicken extends CharacterGameObject {
  constructor(config: ChickenConfig) {
    // Chicken only has 4-direction walk + idle animations. BounceMoveState plays
    // `IDLE_${direction}` while the chicken is bouncing, so we map IDLE_* to the
    // walk animation keys to make the chicken appear to walk while moving. The
    // HURT_* / DIE_* slots fall back to idle frames since no dedicated frames
    // exist.
    const animationConfig: AnimationConfig = {
      WALK_DOWN: { key: CHICKEN_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      WALK_UP: { key: CHICKEN_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
      WALK_LEFT: { key: CHICKEN_ANIMATION_KEYS.WALK_LEFT, repeat: -1, ignoreIfPlaying: true },
      WALK_RIGHT: { key: CHICKEN_ANIMATION_KEYS.WALK_RIGHT, repeat: -1, ignoreIfPlaying: true },
      IDLE_DOWN: { key: CHICKEN_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: CHICKEN_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: CHICKEN_ANIMATION_KEYS.WALK_LEFT, repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: CHICKEN_ANIMATION_KEYS.WALK_RIGHT, repeat: -1, ignoreIfPlaying: true },
      HURT_DOWN: { key: CHICKEN_ANIMATION_KEYS.IDLE_DOWN, repeat: 0, ignoreIfPlaying: true },
      HURT_UP: { key: CHICKEN_ANIMATION_KEYS.IDLE_UP, repeat: 0, ignoreIfPlaying: true },
      HURT_LEFT: { key: CHICKEN_ANIMATION_KEYS.IDLE_LEFT, repeat: 0, ignoreIfPlaying: true },
      HURT_RIGHT: { key: CHICKEN_ANIMATION_KEYS.IDLE_RIGHT, repeat: 0, ignoreIfPlaying: true },
      DIE_DOWN: { key: CHICKEN_ANIMATION_KEYS.IDLE_DOWN, repeat: 0, ignoreIfPlaying: true },
      DIE_UP: { key: CHICKEN_ANIMATION_KEYS.IDLE_UP, repeat: 0, ignoreIfPlaying: true },
      DIE_LEFT: { key: CHICKEN_ANIMATION_KEYS.IDLE_LEFT, repeat: 0, ignoreIfPlaying: true },
      DIE_RIGHT: { key: CHICKEN_ANIMATION_KEYS.IDLE_RIGHT, repeat: 0, ignoreIfPlaying: true },
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.CHICKEN,
      frame: 0,
      id: `chicken-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_CHICKEN_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: false,
      maxLife: ENEMY_CHICKEN_MAX_HEALTH,
    });

    // add state machine
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new BounceMoveState(this));
    this._stateMachine.addState(new BounceIdleState(this));
    this._stateMachine.addState(new HurtState(this, ENEMY_CHICKEN_HURT_PUSH_BACK_SPEED));
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.setState(CHARACTER_STATES.BOUNCE_MOVE_STATE);

    // make the chicken 50% larger than its base 32x32 sprite
    this.setScale(1.5);
  }
}
