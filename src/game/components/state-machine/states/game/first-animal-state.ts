import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class FirstAnimalState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.FIRST_ANIMAL, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] FirstAnimalState entered');
    this._scene.lockPlayerMovement();
    // 1) 1 sec pause
    this._pause(1000, () => {
      // 2) Narrator text. 3) Transition back to RegularState on close.
      // NOTE: nothing currently emits FIRST_ANIMAL_SPAWNED; that hookup will
      //   land alongside non-debug animal spawning in a later feature.
      this._showNarrator('narrator.firstAnimal', () => {
        this._scene.unlockPlayerMovement();
        this._transitionTo(GAME_STATES.REGULAR);
      });
    });
  }
}
