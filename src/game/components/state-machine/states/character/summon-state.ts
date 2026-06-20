import * as Phaser from 'phaser';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';

type SummonStateConfig = {
  // Invoked once when the channel begins (spawn creatures, play VFX, ...).
  onSummon: () => void;
  // How long the caster holds the idle/channel pose before returning to idle.
  duration: number;
  nextState?: string;
};

/**
 * A stationary "channel" state: the caster stands still in its idle animation,
 * fires a one-shot `onSummon` callback, then returns to idle after `duration`.
 * Generic on purpose — the actual summoning/VFX lives in the callback so the
 * FSM stays decoupled from any specific creature.
 */
export class SummonState extends BaseCharacterState {
  readonly #config: SummonStateConfig;
  #timer?: Phaser.Time.TimerEvent;
  #isActive = false;

  constructor(gameObject: CharacterGameObject, config: SummonStateConfig) {
    super(CHARACTER_STATES.SUMMON_STATE, gameObject);
    this.#config = config;
  }

  public onEnter(): void {
    this.#isActive = true;
    this._resetObjectVelocity();

    // Channel in the idle pose facing the current direction.
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);

    this.#config.onSummon();

    // Idle animation loops forever, so end the state on a timer rather than an
    // animation-complete callback.
    this.#timer = this._gameObject.scene.time.delayedCall(this.#config.duration, () => {
      if (!this.#isActive) {
        return;
      }
      this._stateMachine.setState(this.#config.nextState ?? CHARACTER_STATES.IDLE_STATE);
    });
  }

  public onExit(): void {
    this.#isActive = false;
    this.#timer?.remove(false);
    this.#timer = undefined;
    this._resetObjectVelocity();
  }
}
