import * as Phaser from 'phaser';
import { CustomGameObject, Direction, Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { ControlsComponent } from '../../components/game-object/controls-component';
import { StateMachine } from '../../components/state-machine/state-machine';
import { SpeedComponent } from '../../components/game-object/speed-component';
import { DirectionComponent } from '../../components/game-object/direction-component';
import { AnimationComponent, AnimationConfig } from '../../components/game-object/animation-component';
import { InvulnerableComponent } from '../../components/game-object/invulnerable-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { LifeComponent } from '../../components/game-object/life-component';
import { GameDataManager } from '../../common/data-manager';
import { WeaponComponent } from '../../components/game-object/weapon-component';
import { GEAR, DIFFICULTY } from '../../common/common';
import {
  PLAYER_ARMOR_AS_GEAR_SPEED_PENALTY,
  PLAYER_NORMAL_AS_GEAR_SPEED_PENALTY,
  PLAYER_SWIM_ARMOR_AS_GEAR_SPEED_PENALTY,
  PLAYER_SWIM_NORMAL_AS_GEAR_SPEED_PENALTY,
  PLAYER_SWIM_SPEED,
  DIFFICULTY_HARD_SPEED_MULTIPLIER,
} from '../../common/config';

export type CharacterConfig = {
  scene: Phaser.Scene;
  position: Position;
  assetKey: string;
  frame?: number;
  inputComponent: InputComponent;
  animationConfig: AnimationConfig;
  speed: number;
  id?: string;
  isPlayer: boolean;
  isInvulnerable?: boolean;
  invulnerableAfterHitAnimationDuration?: number;
  maxLife: number;
  currentLife?: number;
  /** Damage in half-hearts dealt to the player on contact. Defaults to 2 (one full heart). */
  contactDamage?: number;
};

export abstract class CharacterGameObject extends Phaser.Physics.Arcade.Sprite implements CustomGameObject {
  protected _controlsComponent: ControlsComponent;
  protected _speedComponent: SpeedComponent;
  protected _directionComponent: DirectionComponent;
  protected _animationComponent: AnimationComponent;
  protected _invulnerableComponent: InvulnerableComponent;
  protected _lifeComponent: LifeComponent;
  protected _stateMachine: StateMachine;
  protected _isPlayer: boolean;
  protected _isDefeated: boolean;  
  protected _lastMoveDirections: Direction[] = [];
  protected _contactDamage: number;
  

  constructor(config: CharacterConfig) {
    const {
      scene,
      position,
      assetKey,
      frame,
      speed,
      animationConfig,
      inputComponent,
      id,
      isPlayer,
      invulnerableAfterHitAnimationDuration,
      isInvulnerable,
      maxLife,
      currentLife,
      contactDamage,
    } = config;
    const { x, y } = position;
    super(scene, x, y, assetKey, frame || 0);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // add shared components
    this._controlsComponent = new ControlsComponent(this, inputComponent);
    this._speedComponent = new SpeedComponent(this, speed);
    this._directionComponent = new DirectionComponent(this);
    this._animationComponent = new AnimationComponent(this, animationConfig, isPlayer);
    this._invulnerableComponent = new InvulnerableComponent(
      this,
      isInvulnerable || false,
      invulnerableAfterHitAnimationDuration,
    );
    this._lifeComponent = new LifeComponent(this, maxLife, currentLife);

    // create state machine
    this._stateMachine = new StateMachine(id);

    // general config
    this._isPlayer = isPlayer;
    this._isDefeated = false;
    this._contactDamage = contactDamage ?? 2;
    if (!this._isPlayer) {
      this.disableObject();
    }
  }

  get isDefeated(): boolean {
    return this._isDefeated;
  }

  get isEnemy(): boolean {
    return !this._isPlayer;
  }

  get isPlayer(): boolean {
    return this._isPlayer;
  }

  get controls(): InputComponent {
    return this._controlsComponent.controls;
  }

  get speed(): number {
    const difficultySpeedMultiplyer = GameDataManager.instance.data.difficulty === DIFFICULTY.HARD 
      ? DIFFICULTY_HARD_SPEED_MULTIPLIER 
      : 1;
    if (!this._isPlayer) {// Animals, Critter & Enemies
      return this._speedComponent.speed*difficultySpeedMultiplyer;
    }
    // Player
    const isSwimming = this._stateMachine.currentStateName === CHARACTER_STATES.SWIM_STATE;
    const baseSpeed = isSwimming ? PLAYER_SWIM_SPEED : this._speedComponent.speed;
    const speedPenalty = isSwimming
      ? GameDataManager.instance.data.gear === GEAR.ARMOR
        ? PLAYER_SWIM_ARMOR_AS_GEAR_SPEED_PENALTY
        : PLAYER_SWIM_NORMAL_AS_GEAR_SPEED_PENALTY
      : GameDataManager.instance.data.gear === GEAR.ARMOR
        ? PLAYER_ARMOR_AS_GEAR_SPEED_PENALTY
        : PLAYER_NORMAL_AS_GEAR_SPEED_PENALTY;
    return Math.max(0, (baseSpeed - speedPenalty) * difficultySpeedMultiplyer);
  }

  get direction(): Direction {
    return this._directionComponent.direction;
  }

  set direction(value: Direction) {
    this._directionComponent.direction = value;
  }

  get animationComponent(): AnimationComponent {
    return this._animationComponent;
  }

  get lifeComponent(): LifeComponent {
    return this._lifeComponent;
  }

  /** Damage in half-hearts this character deals to the player on contact. */
  get contactDamage(): number {
    return this._contactDamage;
  }

  get invulnerableComponent(): InvulnerableComponent {
    return this._invulnerableComponent;
  }

  get stateMachine(): StateMachine {
    return this._stateMachine;
  }

  public update(): void {
    this._stateMachine.update();
  }

  public hit(direction: Direction, damage: number): boolean {
    if (this._isDefeated) {
      return false;
    }

    // check if character is invulnerable, if not update state to be hurt
    if (this._invulnerableComponent.invulnerable) {
      return false;
    }

    // have character take damage and see if the character has died
    this._lifeComponent.takeDamage(damage);
    if (this._isPlayer) {
      GameDataManager.instance.updatePlayerCurrentHealth(this._lifeComponent.life);
    }
    if (this._lifeComponent.life === 0) {
      this._isDefeated = true;
      this._stateMachine.setState(CHARACTER_STATES.DEATH_STATE, direction);
      return true;
    }

    this._stateMachine.setState(CHARACTER_STATES.HURT_STATE, direction);
    return true;
  }

  
  public getLastMoveDirections(): Direction[] {
    return this._lastMoveDirections;
  }

  public setLastMoveDirections(directions: Direction[]) {
    this._lastMoveDirections = directions;
  }


  public disableObject(): void {
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;

    // make not active and not visible until player re-enters room
    this.active = false;
    if (!this._isPlayer) {
      this.visible = false;
    }

    const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this);
    if (weaponComponent !== undefined && weaponComponent.weapon !== undefined && weaponComponent.weapon.isAttacking) {
      weaponComponent.weapon.onCollisionCallback();
    }
  }

  public enableObject(): void {
    if (this._isDefeated) {
      return;
    }

    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    this.active = true;
    this.visible = true;
  }
}
