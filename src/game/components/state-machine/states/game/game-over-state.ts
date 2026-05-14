import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { SCENE_KEYS } from '../../../../scenes/scene-keys';
import type { GameScene } from '../../../../scenes/game-scene';

export class GameOverState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.GAME_OVER, scene);
  }

  public onEnter(): void {
    console.debug('[GameProgression] GameOverState entered');
    this._scene.lockPlayerMovement();
    this._showNarrator('narrator.gameOver', () => {
      this._scene.scene.start(SCENE_KEYS.INTRO);
    });
  }
}
