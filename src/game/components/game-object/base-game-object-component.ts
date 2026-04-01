import * as Phaser from 'phaser';
import { GameObject2 } from '../../common/types';

export class BaseGameObjectComponent {
  protected scene: Phaser.Scene;
  protected gameObject2: GameObject2;

  constructor(gameObject2: GameObject2) {
    this.scene = gameObject2.scene;
    this.gameObject2 = gameObject2;
    this.assignComponentToObject(gameObject2);
  }

  static getComponent<T>(gameObject2: GameObject2): T {
    return gameObject2[`_${this.name}`] as T;
  }

  static removeComponent(gameObject2: GameObject2): void {
    delete gameObject2[`_${this.name}`];
  }

  protected assignComponentToObject(gameObject2: GameObject2 | Phaser.Physics.Arcade.Body): void {
    gameObject2[`_${this.constructor.name}`] = this;
  }
}
