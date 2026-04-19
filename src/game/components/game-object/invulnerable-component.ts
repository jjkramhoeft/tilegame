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
    console.log(`Invulnerable get called. Current value: ${this.#invulnerable}`);
    return this.#invulnerable;
  }

  set invulnerable(val: boolean) {
    this.#invulnerable = val;
    console.log(`Invulnerable set to ${val}.`);
  }

  get invulnerableAfterHitAnimationDuration(): number {
    return this.#invulnerableAfterHitAnimationDuration;
  }
}
