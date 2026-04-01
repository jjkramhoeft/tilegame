
import * as Phaser from 'phaser';
import { GameObject2, Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { CharacterGameObject } from '../common/character-game-object';
import { AnimationConfig } from '../../components/game-object/animation-component';
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS } from '../../common/assets';
import {
  PLAYER_ATTACK_DAMAGE,
  PLAYER_HURT_PUSH_BACK_SPEED,
  PLAYER_INVULNERABLE_AFTER_HIT_DURATION,
  PLAYER_SPEED,
} from '../../common/config';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { LiftState } from '../../components/state-machine/states/character/lift-state';
import { OpenChestState } from '../../components/state-machine/states/character/open-chest-state';
import { IdleHoldingState } from '../../components/state-machine/states/character/idle-holding-state';
import { MoveHoldingState } from '../../components/state-machine/states/character/move-holding-state';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import { HurtState } from '../../components/state-machine/states/character/hurt-state';
import { DeathState } from '../../components/state-machine/states/character/death-state';
import { ThrowState } from '../../components/state-machine/states/character/throw-state';
import { AttackState } from '../../components/state-machine/states/character/attack-state';
import { flash } from '../../common/juice-utils';


export type PlayerConfig = {
  scene: Phaser.Scene;
  position: Position;
  controls: InputComponent;
  maxLife: number;
  currentLife: number;
}

export class Player extends CharacterGameObject {

  constructor(config: PlayerConfig) {

    // create animation config for component
    const animationConfigMakeZelda: AnimationConfig = {
      WALK_DOWN: { key: PLAYER_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      WALK_UP: { key: PLAYER_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true },
      WALK_LEFT: { key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1, ignoreIfPlaying: true },
      WALK_RIGHT: { key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1, ignoreIfPlaying: true },
      IDLE_DOWN: { key: PLAYER_ANIMATION_KEYS.IDLE_DOWN, repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: PLAYER_ANIMATION_KEYS.IDLE_UP, repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: PLAYER_ANIMATION_KEYS.IDLE_SIDE, repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: PLAYER_ANIMATION_KEYS.IDLE_SIDE, repeat: -1, ignoreIfPlaying: true },
      HURT_DOWN: { key: PLAYER_ANIMATION_KEYS.HURT_DOWN, repeat: 0, ignoreIfPlaying: true },
      HURT_UP: { key: PLAYER_ANIMATION_KEYS.HURT_UP, repeat: 0, ignoreIfPlaying: true },
      HURT_LEFT: { key: PLAYER_ANIMATION_KEYS.HURT_SIDE, repeat: 0, ignoreIfPlaying: true },
      HURT_RIGHT: { key: PLAYER_ANIMATION_KEYS.HURT_SIDE, repeat: 0, ignoreIfPlaying: true },
      DIE_DOWN: { key: PLAYER_ANIMATION_KEYS.DIE_DOWN, repeat: 0, ignoreIfPlaying: true },
      DIE_UP: { key: PLAYER_ANIMATION_KEYS.DIE_UP, repeat: 0, ignoreIfPlaying: true },
      DIE_LEFT: { key: PLAYER_ANIMATION_KEYS.DIE_SIDE, repeat: 0, ignoreIfPlaying: true },
      DIE_RIGHT: { key: PLAYER_ANIMATION_KEYS.DIE_SIDE, repeat: 0, ignoreIfPlaying: true },
      IDLE_HOLD_DOWN: { key: PLAYER_ANIMATION_KEYS.IDLE_HOLD_DOWN, repeat: -1, ignoreIfPlaying: true },
      IDLE_HOLD_UP: { key: PLAYER_ANIMATION_KEYS.IDLE_HOLD_UP, repeat: -1, ignoreIfPlaying: true },
      IDLE_HOLD_LEFT: { key: PLAYER_ANIMATION_KEYS.IDLE_HOLD_SIDE, repeat: -1, ignoreIfPlaying: true },
      IDLE_HOLD_RIGHT: { key: PLAYER_ANIMATION_KEYS.IDLE_HOLD_SIDE, repeat: -1, ignoreIfPlaying: true },
      WALK_HOLD_DOWN: { key: PLAYER_ANIMATION_KEYS.WALK_HOLD_DOWN, repeat: -1, ignoreIfPlaying: true },
      WALK_HOLD_UP: { key: PLAYER_ANIMATION_KEYS.WALK_HOLD_UP, repeat: -1, ignoreIfPlaying: true },
      WALK_HOLD_LEFT: { key: PLAYER_ANIMATION_KEYS.WALK_HOLD_SIDE, repeat: -1, ignoreIfPlaying: true },
      WALK_HOLD_RIGHT: { key: PLAYER_ANIMATION_KEYS.WALK_HOLD_SIDE, repeat: -1, ignoreIfPlaying: true },
      LIFT_DOWN: { key: PLAYER_ANIMATION_KEYS.LIFT_DOWN, repeat: 0, ignoreIfPlaying: true },
      LIFT_UP: { key: PLAYER_ANIMATION_KEYS.LIFT_UP, repeat: 0, ignoreIfPlaying: true },
      LIFT_LEFT: { key: PLAYER_ANIMATION_KEYS.LIFT_SIDE, repeat: 0, ignoreIfPlaying: true },
      LIFT_RIGHT: { key: PLAYER_ANIMATION_KEYS.LIFT_SIDE, repeat: 0, ignoreIfPlaying: true },
    };
    // create animation config for component
    const animationConfig: AnimationConfig = {
      WALK_DOWN: { key: 'male-nude-none-walk-down', repeat: -1, ignoreIfPlaying: true },
      WALK_UP: { key: 'male-nude-none-walk-up', repeat: -1, ignoreIfPlaying: true },
      WALK_LEFT: { key: 'male-nude-none-walk-left', repeat: -1, ignoreIfPlaying: true },
      WALK_RIGHT: { key: 'male-nude-none-walk-right', repeat: -1, ignoreIfPlaying: true },
      IDLE_DOWN: { key: 'male-nude-none-idle-down', repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: 'male-nude-none-idle-up', repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: 'male-nude-none-idle-left', repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: 'male-nude-none-idle-right', repeat: -1, ignoreIfPlaying: true },
      HURT_DOWN: { key: 'male-nude-none-hurt-down', repeat: 0, ignoreIfPlaying: true },
      HURT_UP: { key: 'male-nude-none-hurt-up', repeat: 0, ignoreIfPlaying: true },
      HURT_LEFT: { key: 'male-nude-none-hurt-left', repeat: 0, ignoreIfPlaying: true },
      HURT_RIGHT: { key: 'male-nude-none-hurt-right', repeat: 0, ignoreIfPlaying: true },
      DIE_DOWN: { key: 'male-nude-none-hurt-down', repeat: 0, ignoreIfPlaying: true },
      DIE_UP: { key: 'male-nude-none-hurt-up', repeat: 0, ignoreIfPlaying: true },
      DIE_LEFT: { key: 'male-nude-none-hurt-left', repeat: 0, ignoreIfPlaying: true },
      DIE_RIGHT: { key: 'male-nude-none-hurt-right', repeat: 0, ignoreIfPlaying: true },
      IDLE_HOLD_DOWN: { key: 'male-nude-none-idle-down', repeat: -1, ignoreIfPlaying: true },
      IDLE_HOLD_UP: { key: 'male-nude-none-idle-up', repeat: -1, ignoreIfPlaying: true },
      IDLE_HOLD_LEFT: { key: 'male-nude-none-idle-left', repeat: -1, ignoreIfPlaying: true },
      IDLE_HOLD_RIGHT: { key: 'male-nude-none-idle-right', repeat: -1, ignoreIfPlaying: true },
      WALK_HOLD_DOWN: { key: 'male-nude-none-walk-down', repeat: -1, ignoreIfPlaying: true },
      WALK_HOLD_UP: { key: 'male-nude-none-walk-up', repeat: -1, ignoreIfPlaying: true },
      WALK_HOLD_LEFT: { key: 'male-nude-none-walk-left', repeat: -1, ignoreIfPlaying: true },
      WALK_HOLD_RIGHT: { key: 'male-nude-none-walk-right', repeat: -1, ignoreIfPlaying: true },
      LIFT_DOWN: { key: 'male-nude-none-hurt-down', repeat: 0, ignoreIfPlaying: true },
      LIFT_UP: { key: 'male-nude-none-hurt-up', repeat: 0, ignoreIfPlaying: true },
      LIFT_LEFT: { key: 'male-nude-none-hurt-left', repeat: 0, ignoreIfPlaying: true },
      LIFT_RIGHT: { key: 'male-nude-none-hurt-right', repeat: 0, ignoreIfPlaying: true },
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.PLAYER,
      frame: 0,
      id: 'player',
      isPlayer: true,
      animationConfig,
      speed: PLAYER_SPEED,
      inputComponent: config.controls,
      isInvulnerable: false,
      invulnerableAfterHitAnimationDuration: PLAYER_INVULNERABLE_AFTER_HIT_DURATION,
      maxLife: config.maxLife,
      currentLife: config.currentLife,
    });

    // add state machine
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.addState(
      new HurtState(this, PLAYER_HURT_PUSH_BACK_SPEED, () => {
        flash(this);
      }),
    );
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.addState(new LiftState(this));
    this._stateMachine.addState(new OpenChestState(this));
    this._stateMachine.addState(new IdleHoldingState(this));
    this._stateMachine.addState(new MoveHoldingState(this));
    this._stateMachine.addState(new ThrowState(this));
    this._stateMachine.addState(new AttackState(this));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);





    // enable auto update functionality
    config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    config.scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      },
      this,
    );


  }

  get physicsBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  public update(): void {
    super.update();
    //this.#collidingObjectsComponent.reset();
    //this.#weaponComponent.update();
  }
}