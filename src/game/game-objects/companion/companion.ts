import * as Phaser from 'phaser';
import { Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { FollowMoveState } from '../../components/state-machine/states/character/follow-move-state';
import { FollowIdleState } from '../../components/state-machine/states/character/follow-idle-state';
import { AnimationConfig } from '../../components/game-object/animation-component';
import { CharacterGameObject } from '../common/character-game-object';
import { GameDataManager } from '../../common/game-data-manager';
import { SEX } from '../../common/common';
import { PLAYER_SPEED, PLAYER_START_MAX_HEALTH } from '../../common/config';

export type CompanionConfig = {
  scene: Phaser.Scene;
  position: Position;
};

/**
 * The companion introduced in EveState: an opposite-sex partner that mirrors
 * the player's current gear/weapon (snapshotted at spawn — it is "unchangeable"
 * per the design). It follows the player via FollowMoveState, dropping into
 * FollowIdleState to rest whenever it gets close. Auto-attack behaviour is still
 * deferred.
 */
export class Companion extends CharacterGameObject {
  constructor(config: CompanionConfig) {
    // Companion is the opposite sex of the player, sharing the player's current
    // gear and weapon so it visually matches.
    const { sex, gear, weapon } = GameDataManager.instance.data;
    const companionSex = sex === SEX.MALE ? SEX.FEMALE : SEX.MALE;
    const animP = `${companionSex}-${gear}-${weapon}-`;

    // Non-player game object, so it uses this static AnimationConfig directly
    // (the player resolves keys dynamically instead). Only idle/walk are needed
    // for now; HURT/DIE fall back to idle frames since the companion is
    // invulnerable in this pass.
    const animationConfig: AnimationConfig = {
      WALK_DOWN: { key: animP + 'walk-down', repeat: -1, ignoreIfPlaying: true },
      WALK_UP: { key: animP + 'walk-up', repeat: -1, ignoreIfPlaying: true },
      WALK_LEFT: { key: animP + 'walk-left', repeat: -1, ignoreIfPlaying: true },
      WALK_RIGHT: { key: animP + 'walk-right', repeat: -1, ignoreIfPlaying: true },
      IDLE_DOWN: { key: animP + 'idle-down', repeat: -1, ignoreIfPlaying: true },
      IDLE_UP: { key: animP + 'idle-up', repeat: -1, ignoreIfPlaying: true },
      IDLE_LEFT: { key: animP + 'idle-left', repeat: -1, ignoreIfPlaying: true },
      IDLE_RIGHT: { key: animP + 'idle-right', repeat: -1, ignoreIfPlaying: true },
      HURT_DOWN: { key: animP + 'idle-down', repeat: 0, ignoreIfPlaying: true },
      HURT_UP: { key: animP + 'idle-up', repeat: 0, ignoreIfPlaying: true },
      HURT_LEFT: { key: animP + 'idle-left', repeat: 0, ignoreIfPlaying: true },
      HURT_RIGHT: { key: animP + 'idle-right', repeat: 0, ignoreIfPlaying: true },
      DIE_DOWN: { key: animP + 'idle-down', repeat: 0, ignoreIfPlaying: true },
      DIE_UP: { key: animP + 'idle-up', repeat: 0, ignoreIfPlaying: true },
      DIE_LEFT: { key: animP + 'idle-left', repeat: 0, ignoreIfPlaying: true },
      DIE_RIGHT: { key: animP + 'idle-right', repeat: 0, ignoreIfPlaying: true },
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: '-not used',
      frame: 0,
      id: `companion-${companionSex}`,
      isPlayer: false,
      animationConfig,
      speed: PLAYER_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: true,
      maxLife: PLAYER_START_MAX_HEALTH,
      contactDamage: 0,
    });

    // Match the player's hitbox sizing/offset so the companion lines up visually.
    this.body?.setSize(this.body.width * 0.43, this.body.height * 0.45, true);
    this.body?.setOffset(this.body.offset.x+15, this.body.offset.y + 30);

    // Seed the depth using the same feet-based convention as the player's move
    // state (`y + 36`). FollowMoveState keeps it updated while walking; without
    // this initial value the companion would sit at the default depth 0 and
    // render behind the player and blocking sprites before it first moves.
    this.depth = config.position.y + 36;

    // Follow the player, resting (FollowIdleState) whenever it gets close.
    const getTarget = () => (this.scene as unknown as { player?: CharacterGameObject }).player;
    this._stateMachine.addState(new FollowMoveState(this, getTarget));
    this._stateMachine.addState(new FollowIdleState(this, getTarget));
    this._stateMachine.setState(CHARACTER_STATES.FOLLOW_MOVE_STATE);
  }
}
