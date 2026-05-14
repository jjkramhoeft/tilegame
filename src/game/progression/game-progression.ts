import { StateMachine } from '../components/state-machine/state-machine';
import { GAME_STATES, GameStateName } from '../components/state-machine/states/game/game-state-keys';
import { StartState } from '../components/state-machine/states/game/start-state';
import { FirstTileState } from '../components/state-machine/states/game/first-tile-state';
import { AssignmentState } from '../components/state-machine/states/game/assignment-state';
import { BabyStepsState } from '../components/state-machine/states/game/baby-steps-state';
import { GardenState } from '../components/state-machine/states/game/garden-state';
import { RegularState } from '../components/state-machine/states/game/regular-state';
import { FirstTreeState } from '../components/state-machine/states/game/first-tree-state';
import { FirstAnimalState } from '../components/state-machine/states/game/first-animal-state';
import { EveState } from '../components/state-machine/states/game/eve-state';
import { BossFightState } from '../components/state-machine/states/game/boss-fight-state';
import { GameOverState } from '../components/state-machine/states/game/game-over-state';
import { VictoryState } from '../components/state-machine/states/game/victory-state';
import type { GameScene } from '../scenes/game-scene';

/**
 * Owns the game progression state machine and registers all 12 game states.
 * `GameScene` constructs one of these and ticks it from `update()`.
 */
export class GameProgression {
  #stateMachine: StateMachine;

  constructor(scene: GameScene) {
    this.#stateMachine = new StateMachine('game-progression');
    this.#stateMachine.addState(new StartState(scene));
    this.#stateMachine.addState(new FirstTileState(scene));
    this.#stateMachine.addState(new AssignmentState(scene));
    this.#stateMachine.addState(new BabyStepsState(scene));
    this.#stateMachine.addState(new GardenState(scene));
    this.#stateMachine.addState(new RegularState(scene));
    this.#stateMachine.addState(new FirstTreeState(scene));
    this.#stateMachine.addState(new FirstAnimalState(scene));
    this.#stateMachine.addState(new EveState(scene));
    this.#stateMachine.addState(new BossFightState(scene));
    this.#stateMachine.addState(new GameOverState(scene));
    this.#stateMachine.addState(new VictoryState(scene));
  }

  public start(initial: GameStateName = GAME_STATES.START): void {
    this.#stateMachine.setState(initial);
  }

  public update(): void {
    this.#stateMachine.update();
  }

  public get currentStateName(): string | undefined {
    return this.#stateMachine.currentStateName;
  }

  public setState(name: GameStateName, ...args: unknown[]): void {
    this.#stateMachine.setState(name, ...args);
  }
}
