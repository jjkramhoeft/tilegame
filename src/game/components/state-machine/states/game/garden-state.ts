import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class GardenState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.GARDEN, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] GardenState entered');
    this._scene.lockPlayerMovement();

    // 1) 1 sec pause
    this._pause(1000, () => {
      // 2) Narrator: "Not just barren rock and wasteland..."
      this._showNarrator('narrator.garden.lush', () => {
        // 3) Change tiles to a lush green garden + big tree.
        // TODO Phase 5: stage `placeGardenTiles` so tiles change one by one.
        this._scene.earth.placeGardenTiles();

        // 4) Narrator: "Your assignment is to create a lush forest..."
        this._pause(500, () => {
          this._showNarrator('narrator.garden.assignment', () => {
            // 5) Place fruit chest near the big tree.
            this._scene.placeFruitChestNearBigTree();
            // 6) Transition to the regular play state.
            this._scene.unlockPlayerMovement();
            this._transitionTo(GAME_STATES.REGULAR);
          });
        });
      });
    });
  }
}
