import { GameObject2 } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class CollidingObjectsComponent extends BaseGameObjectComponent {
  #objects: GameObject2[];

  constructor(gameObject2: GameObject2) {
    super(gameObject2);
    this.#objects = [];
  }

  get objects(): GameObject2[] {
    return this.#objects;
  }

  public add(gameObject2: GameObject2): void {
    this.#objects.push(gameObject2);
  }

  public reset(): void {
    this.#objects = [];
  }
}
