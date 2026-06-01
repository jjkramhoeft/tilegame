import { BaseGameState } from './base-game-state';
import { GAME_STATES } from './game-state-keys';
import { SCENE_KEYS } from '../../../../scenes/scene-keys';
import type { GameScene } from '../../../../scenes/game-scene';
import { ENABLE_LOGGING } from '../../../../common/config';

export class GameOverState extends BaseGameState {
  constructor(scene: GameScene) {
    super(GAME_STATES.GAME_OVER, scene);
  }

  public onEnter(): void {
    if (ENABLE_LOGGING) { console.debug('[GameProgression] GameOverState entered'); }
    this._scene.lockPlayerMovement();
    //ToDo: Pick narrator game over text that fit to players death (by falling or killed by named MOB or Drowned wearing amor or by stepping into lava)
    this._showNarrator('narrator.gameOver', () => {
      this._scene.scene.start(SCENE_KEYS.INTRO);
    });
  }
}
