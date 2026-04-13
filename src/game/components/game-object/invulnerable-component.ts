import { GameObject2 } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class InvulnerableComponent extends BaseGameObjectComponent {
  #invulnerable: boolean;
  #invulnerableAfterHitAnimationDuration: number;

  constructor(gameObject2: GameObject2, invulnerable = false, invulnerableAfterHitAnimationDuration = 0) {
    super(gameObject2);
    this.#invulnerable = invulnerable;
    this.#invulnerableAfterHitAnimationDuration = invulnerableAfterHitAnimationDuration;
  }

  get invulnerable(): boolean {
    return this.#invulnerable;
  }

  set invulnerable(val: boolean) {
    this.#invulnerable = val;
  }

  get invulnerableAfterHitAnimationDuration(): number {
    return this.#invulnerableAfterHitAnimationDuration;
  }
}
