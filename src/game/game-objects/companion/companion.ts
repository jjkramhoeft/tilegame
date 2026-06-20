import * as Phaser from 'phaser';
import { Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
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
 * The companion introduced in EveState: a static, opposite-sex partner that
 * mirrors the player's current gear/weapon (snapshotted at spawn — it is
 * "unchangeable" per the design). This first pass is placement-only: the
 * companion just stands idle next to the player. Follow + auto-attack behaviour
 * (a future `follow-move-state`) is intentionally not wired yet.
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

    // The companion only ever runs IdleState, which (unlike the move/bounce
    // states) never assigns depth, so set it once here using the same
    // feet-based convention as the player's move state (`y + 36`). Without
    // this it would sit at the default depth 0 and render behind the player
    // and blocking sprites.
    this.depth = config.position.y + 36;

    // Placement-only: idle is the only behaviour for now.
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }
}
