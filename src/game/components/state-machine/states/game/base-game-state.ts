import { State, StateMachine } from '../../state-machine';
import { CUSTOM_EVENTS, EVENT_BUS } from '../../../../common/event-bus';
import type { TextKey } from '../../../../common/texts';
import type { GameScene } from '../../../../scenes/game-scene';
import { DIFFICULTY_HARD_WAIT_FACTOR } from '../../../../common/config';
import { GameDataManager } from '../../../../common/game-data-manager';

/**
 * Base class for the game progression states. Concrete states extend this and
 * implement the scripted flow described in `game-state.md`.
 *
 * Provides small helpers shared by all game states:
 *  - `_pause(ms, cb)` schedules a delayed callback that is automatically
 *    cancelled when the state exits, so transitions cannot fire from a stale
 *    timer.
 *  - `_showNarrator(textKey, onClosed?)` shows the narrator dialog and (when
 *    a callback is provided) waits for it to be dismissed before continuing.
 *  - `_transitionTo(name)` is a thin wrapper around `setState`.
 */
export abstract class BaseGameState implements State {
  protected _scene: GameScene;
  protected _stateMachine!: StateMachine;
  protected defaultWaitTime = 500;
  #name: string;
  #pendingTimers: Phaser.Time.TimerEvent[] = [];
  #narratorClosedHandler?: () => void;

  constructor(name: string, scene: GameScene) {
    this.#name = name;
    this._scene = scene;
    this.defaultWaitTime = 500;
    if(GameDataManager.instance.data.difficulty === 'Hard') {
      this.defaultWaitTime *= DIFFICULTY_HARD_WAIT_FACTOR;
    }
  }

  get name(): string {
    return this.#name;
  }

  set stateMachine(stateMachine: StateMachine) {
    this._stateMachine = stateMachine;
  }

  /** Concrete states override these as needed. */
  public onEnter?(args: unknown[]): void;
  public onUpdate?(): void;

  /** Cleans up timers and any narrator listener. Subclasses can override but
   *  should call `super.onExit()` to keep the cleanup. */
  public onExit(): void {
    this._cancelPendingTimers();
    this._clearNarratorListener();
  }

  protected _transitionTo(name: string, ...args: unknown[]): void {
    this._stateMachine.setState(name, ...args);
    GameDataManager.instance.setGameState(name);
  }

  protected _pause(ms: number, callback: () => void): void {
    const timer = this._scene.time.delayedCall(ms, () => {
      // Drop the finished timer from the pending list.
      this.#pendingTimers = this.#pendingTimers.filter((t) => t !== timer);
      callback();
    });
    this.#pendingTimers.push(timer);
  }

  protected _showNarrator(textKey: TextKey, onClosed?: () => void): void {
    if (onClosed) {
      this._clearNarratorListener();
      this.#narratorClosedHandler = () => {
        this.#narratorClosedHandler = undefined;
        onClosed();
      };
      EVENT_BUS.once(CUSTOM_EVENTS.NARRATOR_DIALOG_CLOSED, this.#narratorClosedHandler);
    }
    EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_NARRATOR_DIALOG, { textKey });
  }

  protected _cancelPendingTimers(): void {
    this.#pendingTimers.forEach((t) => t.remove(false));
    this.#pendingTimers = [];
  }

  protected _clearNarratorListener(): void {
    if (this.#narratorClosedHandler) {
      EVENT_BUS.off(CUSTOM_EVENTS.NARRATOR_DIALOG_CLOSED, this.#narratorClosedHandler);
      this.#narratorClosedHandler = undefined;
    }
  }
}
