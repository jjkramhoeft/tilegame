import { CharacterAnimation, GameObject2 } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';
import { DataManager } from '../../common/data-manager';

export type AnimationConfig = {
  [key in CharacterAnimation]?: { key: string; repeat: number; ignoreIfPlaying: boolean };
};

export class AnimationComponent extends BaseGameObjectComponent {
  declare protected gameObject2: Phaser.GameObjects.Sprite;

  #config: AnimationConfig;
  #isPlayer: boolean;

  constructor(gameObject2: GameObject2, config: AnimationConfig, isPlayerJJK?: boolean) {
    super(gameObject2);
    this.#config = config;
    this.#isPlayer = false;
    if (isPlayerJJK) {
      this.#isPlayer = true;
    }
  }

  private getAnimationKeyJJK(characterAnimationKey: CharacterAnimation): string | undefined {
    if (characterAnimationKey === undefined) {
      return undefined;
    }
    const d = DataManager.instance.data;
    const animP = `${d.sex}-${d.gear}-${d.weapon}-`;
    switch (characterAnimationKey) {
      case 'IDLE_DOWN': return animP + 'idle-down';
      case 'IDLE_UP': return animP + 'idle-up';
      case 'IDLE_LEFT': return animP + 'idle-left';
      case 'IDLE_RIGHT': return animP + 'idle-right';
      case 'WALK_DOWN': return animP + 'walk-down';
      case 'WALK_UP': return animP + 'walk-up';
      case 'WALK_LEFT': return animP + 'walk-left';
      case 'WALK_RIGHT': return animP + 'walk-right';
      case 'FALL': return animP + 'fall';
      case 'DIE_DOWN': return animP + 'die';
    } //case 'HURT_DOWN': return animP + 'hurt-down'; case 'HURT_UP': return animP + 'hurt-up'; case 'HURT_LEFT': return animP + 'hurt-left'; case 'HURT_RIGHT': return animP + 'hurt-right';
    //case 'DIE_DOWN': return animP + 'die-down';   case 'DIE_UP': return animP + 'die-up';   case 'DIE_LEFT': return animP + 'die-left';   case 'DIE_RIGHT': return animP + 'die-right';      
    return 'XXXX'+characterAnimationKey; // This is not supposed to happen!
  }

  public getAnimationKey(characterAnimationKey: CharacterAnimation): string | undefined {
    if (this.#isPlayer) {
      return this.getAnimationKeyJJK(characterAnimationKey);
    }
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

    let key = this.#config[characterAnimationKey].key;
    if (this.#isPlayer) {
      key = this.getAnimationKeyJJK(characterAnimationKey) ?? key;
    }

    const animationConfig: Phaser.Types.Animations.PlayAnimationConfig = {
      key: key,
      repeat: this.#config[characterAnimationKey].repeat,
      timeScale: 1,
    };
    if (callback) {
      const animationKey = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + key;
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
