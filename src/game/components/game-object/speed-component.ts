import * as Phaser from 'phaser';
import { GameObject2 } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class SpeedComponent extends BaseGameObjectComponent {
  #speed: number;

  constructor(gameObject2: GameObject2, speed: number) {
    super(gameObject2);
    this.#speed = speed;
  }

  get speed(): number {
    return this.#speed;
  }
}
