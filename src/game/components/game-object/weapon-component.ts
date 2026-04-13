import * as Phaser from 'phaser';
import { GameObject2 } from '../../common/types';
import { Weapon } from '../../game-objects/weapons/base-weapon';
import { BaseGameObjectComponent } from './base-game-object-component';

export class WeaponComponent extends BaseGameObjectComponent {
  #weapon: Weapon | undefined;
  #weaponPhysicsBody: Phaser.Physics.Arcade.Body;

  constructor(gameObject2: GameObject2) {
    super(gameObject2);
    this.#weaponPhysicsBody = gameObject2.scene.physics.add.body(gameObject2.x, gameObject2.y, 1, 1);
    this.#weaponPhysicsBody.enable = false;
    this.assignComponentToObject(this.#weaponPhysicsBody);
  }

  get weapon(): Weapon | undefined {
    return this.#weapon;
  }

  set weapon(weapon: Weapon | undefined) {
    this.#weapon = weapon;
  }

  get body(): Phaser.Physics.Arcade.Body {
    return this.#weaponPhysicsBody;
  }

  get weaponDamage(): number {
    if (this.#weapon === undefined) {
      return 0;
    }
    return this.#weapon.baseDamage;
  }

  public update(): void {
    if (this.#weapon === undefined) {
      return;
    }
    this.#weapon.update();
  }
}
