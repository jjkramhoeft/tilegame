import * as Phaser from 'phaser';
import { GameObject2 } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class HeldGameObjectComponent extends BaseGameObjectComponent {
  #object: GameObject2 | undefined;

  constructor(gameObject2: GameObject2) {
    super(gameObject2);
  }

  get object(): GameObject2 | undefined {
    return this.#object;
  }

  set object(gameObject2: GameObject2) {
    this.#object = gameObject2;
  }

  public drop(): void {
    this.#object = undefined;
  }
}
