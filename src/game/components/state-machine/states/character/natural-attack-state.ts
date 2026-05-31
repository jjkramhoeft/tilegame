import * as Phaser from 'phaser';
import { CHARACTER_ANIMATIONS } from '../../../../common/assets';
import { CharacterAnimation } from '../../../../common/types';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';

type NaturalAttackStateConfig = {
  getTarget: () => CharacterGameObject | undefined;
  damage: number;
  range: number;
  hitDelay: number;
  nextState?: string;
};

export class NaturalAttackState extends BaseCharacterState {
  readonly #config: NaturalAttackStateConfig;
  #hitTimer?: Phaser.Time.TimerEvent;
  #isActive = false;

  constructor(gameObject: CharacterGameObject, config: NaturalAttackStateConfig) {
    super(CHARACTER_STATES.NATURAL_ATTACK_STATE, gameObject);
    this.#config = config;
  }

  public onEnter(): void {
    this.#isActive = true;
    this._resetObjectVelocity();

    this.#hitTimer = this._gameObject.scene.time.delayedCall(this.#config.hitDelay, () => {
      this.#tryHitTarget();
    });

    this._gameObject.animationComponent.playAnimation(this.#getAttackAnimation(), () => {
      if (!this.#isActive) {
        return;
      }
      this._stateMachine.setState(this.#config.nextState ?? CHARACTER_STATES.IDLE_STATE);
    });
  }

  public onExit(): void {
    this.#isActive = false;
    this.#hitTimer?.remove(false);
    this.#hitTimer = undefined;
  }

  #tryHitTarget(): void {
    if (!this.#isActive || !this._gameObject.active || this._gameObject.isDefeated) {
      return;
    }

    const target = this.#config.getTarget();
    if (target === undefined || !target.active || target.isDefeated) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this._gameObject.x, this._gameObject.y, target.x, target.y);
    if (distance > this.#config.range) {
      return;
    }

    target.hit(this._gameObject.direction, this.#config.damage);
  }

  #getAttackAnimation(): CharacterAnimation {
    switch (this._gameObject.direction) {
      case 'UP':
        return CHARACTER_ANIMATIONS.ATTACK_UP;
      case 'LEFT':
        return CHARACTER_ANIMATIONS.ATTACK_LEFT;
      case 'RIGHT':
        return CHARACTER_ANIMATIONS.ATTACK_RIGHT;
      case 'DOWN':
      default:
        return CHARACTER_ANIMATIONS.ATTACK_DOWN;
    }
  }
}