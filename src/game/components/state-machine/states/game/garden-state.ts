import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class GardenState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.GARDEN, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] GardenState entered (stub)');
    // TODO Phase 2: narrator + placeGardenTiles + fruit chest + transition.
  }
}
