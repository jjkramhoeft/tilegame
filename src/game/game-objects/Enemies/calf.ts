import * as Phaser from 'phaser';
import { Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { BounceMoveState } from '../../components/state-machine/states/character/bounce-move-state';
import { BounceIdleState } from '../../components/state-machine/states/character/bounce-idle-state';
import {
  ENEMY_CALF_HURT_PUSH_BACK_SPEED,
  ENEMY_CALF_MAX_HEALTH,
  ENEMY_CALF_SPEED,
} from '../../common/config';
import { AnimationConfig } from '../../components/game-object/animation-component';
import { ASSET_KEYS, CALF_ANIMATION_KEYS } from '../../common/assets';
import { CharacterGameObject } from '../common/character-game-object';
import { HurtState } from '../../components/state-machine/states/character/hurt-state';
import { DeathState } from '../../components/state-machine/states/character/death-state';

export type CalfConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Calf extends CharacterGameObject {
  constructor(config: CalfConfig) {
    // Calf only has 4-direction walk + idle animations.
    // BounceMoveState plays `WALK_${direction}` while the calf is bouncing.
    // BounceIdleState plays `IDLE_${direction}` in between the bounces.
    // The HURT_* / DIE_* slots fall back to idle frames since no dedicated frames exist.
    const animationConfig: AnimationConfig = {
      WALK_DOWN: { key: CALF_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      WALK_UP: { key: CALF_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
      WALK_LEFT: { key: CALF_ANIMATION_KEYS.WALK_LEFT, repeat: -1, ignoreIfPlaying: true },
      WALK_RIGHT: { key: CALF_ANIMATION_KEYS.WALK_RIGHT, repeat: -1, ignoreIfPlaying: true },
      IDLE_DOWN: { key: CALF_ANIMATION_KEYS.IDLE_DOWN, repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: CALF_ANIMATION_KEYS.IDLE_UP, repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: CALF_ANIMATION_KEYS.IDLE_LEFT, repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: CALF_ANIMATION_KEYS.IDLE_RIGHT, repeat: -1, ignoreIfPlaying: true },
      HURT_DOWN: { key: CALF_ANIMATION_KEYS.IDLE_DOWN, repeat: 0, ignoreIfPlaying: true },
      HURT_UP: { key: CALF_ANIMATION_KEYS.IDLE_UP, repeat: 0, ignoreIfPlaying: true },
      HURT_LEFT: { key: CALF_ANIMATION_KEYS.IDLE_LEFT, repeat: 0, ignoreIfPlaying: true },
      HURT_RIGHT: { key: CALF_ANIMATION_KEYS.IDLE_RIGHT, repeat: 0, ignoreIfPlaying: true },
      DIE_DOWN: { key: CALF_ANIMATION_KEYS.IDLE_DOWN, repeat: 0, ignoreIfPlaying: true },
      DIE_UP: { key: CALF_ANIMATION_KEYS.IDLE_UP, repeat: 0, ignoreIfPlaying: true },
      DIE_LEFT: { key: CALF_ANIMATION_KEYS.IDLE_LEFT, repeat: 0, ignoreIfPlaying: true },
      DIE_RIGHT: { key: CALF_ANIMATION_KEYS.IDLE_RIGHT, repeat: 0, ignoreIfPlaying: true },
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.CALF,
      frame: 0,
      id: `calf-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_CALF_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: false,
      maxLife: ENEMY_CALF_MAX_HEALTH,
    });

    this.body?.setSize(24, 17, true); // tighter hitbox around the calf's body
    this.body?.setOffset(20, 25); // push it down/right to align with the visual
    this.setScale(1.5);

    // add state machine
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new BounceMoveState(this));
    this._stateMachine.addState(new BounceIdleState(this));
    this._stateMachine.addState(new HurtState(this, ENEMY_CALF_HURT_PUSH_BACK_SPEED));
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.setState(CHARACTER_STATES.BOUNCE_MOVE_STATE);

    // make the calf 50% larger than its base 32x32 sprite
    this.setScale(1.5);
  }
}
