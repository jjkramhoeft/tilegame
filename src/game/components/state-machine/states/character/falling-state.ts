import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { GameScene } from '../../../../scenes/game-scene';

export class FallingState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.FALLING_STATE, gameObject);
  }

  public onEnter(): void {
    // play falling animation not based on game object direction
    this._gameObject.animationComponent.playAnimation(`FALL`, () => {
      this.#die();
    });
    this._gameObject.depth = -9;
    this._gameObject.scene.cameras.main.stopFollow();
    this._gameObject.removeCollidesWith(this._gameObject.GameScene.getBlockingGeometryGroup());
  }

  public onUpdate(): void {
    if (this._gameObject.body  && this._gameObject.animationComponent.isAnimationPlaying()) {
      this._gameObject.body.velocity.y += 15;
    }
  }

  #die(): void {
    this._stateMachine.setState(CHARACTER_STATES.DEATH_STATE);
  }
}
