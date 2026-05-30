import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING } from '../../../../common/config';

export class FirstAnimalState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.FIRST_ANIMAL, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] FirstAnimalState entered'); }
    this._scene.lockPlayerMovement();
    this._pause(this.defaultWaitTime, () => {
      // NOTE: nothing currently emits FIRST_ANIMAL_SPAWNED; that hookup will
      //   land alongside non-debug animal spawning in a later feature.
      this._showNarrator('narrator.firstAnimal', () => {
        this._scene.unlockPlayerMovement();
        this._transitionTo(GAME_STATES.REGULAR);
      });
    });
  }
}
