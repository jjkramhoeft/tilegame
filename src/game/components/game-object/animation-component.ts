import { CharacterAnimation, GameObject2 } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export type AnimationConfig = {
  [key in CharacterAnimation]?: { key: string; repeat: number; ignoreIfPlaying: boolean };
};

export class AnimationComponent extends BaseGameObjectComponent {
  declare protected gameObject2: Phaser.GameObjects.Sprite;

  #config: AnimationConfig;

  constructor(gameObject2: GameObject2, config: AnimationConfig) {
    super(gameObject2);
    this.#config = config;
  }

  public getAnimationKey(characterAnimationKey: CharacterAnimation): string | undefined {
    if (this.#config[characterAnimationKey] === undefined) {
      return undefined;
    }
    return this.#config[characterAnimationKey].key;
  }

  public playAnimation(characterAnimationKey: CharacterAnimation, callback?: () => void): void {
    if (this.#config[characterAnimationKey] === undefined) {
      if (callback) {
        callback();
      }
      return;
    }
    const animationConfig: Phaser.Types.Animations.PlayAnimationConfig = {
      key: this.#config[characterAnimationKey].key,
      repeat: this.#config[characterAnimationKey].repeat,
      timeScale: 1,
    };
    if (callback) {
      const animationKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + this.#config[characterAnimationKey].key;
      this.gameObject2.once(animationKey, () => {
        callback();
      });
    }
    this.gameObject2.play(animationConfig, this.#config[characterAnimationKey].ignoreIfPlaying);
  }

  public playAnimationInReverse(characterAnimationKey: CharacterAnimation, callback?: () => void): void {
    if (this.#config[characterAnimationKey] === undefined) {
      if (callback) {
        callback();
      }
      return;
    }
    const animationConfig: Phaser.Types.Animations.PlayAnimationConfig = {
      key: this.#config[characterAnimationKey].key,
      repeat: this.#config[characterAnimationKey].repeat,
      timeScale: 1.75,
    };
    if (callback) {
      const animationKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + this.#config[characterAnimationKey].key;
      this.gameObject2.once(animationKey, () => {
        callback();
      });
    }
    this.gameObject2.playReverse(animationConfig, this.#config[characterAnimationKey].ignoreIfPlaying);
  }

  public isAnimationPlaying(): boolean {
    return this.gameObject2.anims.isPlaying;
  }
}
