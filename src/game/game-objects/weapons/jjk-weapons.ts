import * as Phaser from 'phaser';
import { BaseWeapon } from './base-weapon';
import { DIRECTION } from '../../common/common';

export class JjkWeapons extends BaseWeapon {
  public attackUp(): void {
    this._weaponComponent.body.setSize(31, 18);
    this._weaponComponent.body.position.set(this._sprite.x - 14, this._sprite.y - 24);
    this.attack(DIRECTION.UP);
  }

  public attackDown(): void {
    this._weaponComponent.body.setSize(31, 18);   
    this._weaponComponent.body.position.set(this._sprite.x - 14, this._sprite.y + 21);
    this.attack(DIRECTION.DOWN);
  }

  public attackRight(): void {
    this._weaponComponent.body.setSize(18, 30);
    this._weaponComponent.body.position.set(this._sprite.x + 10, this._sprite.y - 10);
    this.attack(DIRECTION.RIGHT);
  }

  public attackLeft(): void {
    this._weaponComponent.body.setSize(18, 30);
    this._weaponComponent.body.position.set(this._sprite.x - 26, this._sprite.y - 10);
    this.attack(DIRECTION.LEFT);
  }
}
