import { BaseWeapon } from './base-weapon';
import { DIRECTION, WEAPON } from '../../common/common';
import { DataManager } from '../../common/data-manager';

export class JjkWeapons extends BaseWeapon {
  public attackUp(): void {
    if(DataManager.instance.data.weapon === WEAPON.SWORD) {
      this._weaponComponent.body.setSize(35, 22);
      this._weaponComponent.body.position.set(this._sprite.x - 17, this._sprite.y - 24);
    } else if(DataManager.instance.data.weapon === WEAPON.STAFF) {
      this._weaponComponent.body.setSize(35, 23);
      this._weaponComponent.body.position.set(this._sprite.x - 17, this._sprite.y - 25);
    } else if(DataManager.instance.data.weapon === WEAPON.DAGGER) {
      this._weaponComponent.body.setSize(33, 20);
      this._weaponComponent.body.position.set(this._sprite.x - 15, this._sprite.y - 22);
    } else  {// WEAPON.NONE
      this._weaponComponent.body.setSize(31, 18);
      this._weaponComponent.body.position.set(this._sprite.x - 14, this._sprite.y - 20);
    }
    this.attack(DIRECTION.UP);
  }

  public attackDown(): void {
    if(DataManager.instance.data.weapon === WEAPON.SWORD) {
      this._weaponComponent.body.setSize(35, 22);   
      this._weaponComponent.body.position.set(this._sprite.x - 17, this._sprite.y + 23);
    } else if(DataManager.instance.data.weapon === WEAPON.STAFF) {
      this._weaponComponent.body.setSize(35, 23);   
      this._weaponComponent.body.position.set(this._sprite.x - 17, this._sprite.y + 25);
    } else if(DataManager.instance.data.weapon === WEAPON.DAGGER) {
      this._weaponComponent.body.setSize(33, 20);   
      this._weaponComponent.body.position.set(this._sprite.x - 15, this._sprite.y + 25);
    } else  {// WEAPON.NONE
      this._weaponComponent.body.setSize(31, 18);   
      this._weaponComponent.body.position.set(this._sprite.x - 14, this._sprite.y + 26);
    }
    this.attack(DIRECTION.DOWN);
  }

  public attackRight(): void {
    if(DataManager.instance.data.weapon === WEAPON.SWORD) {
      this._weaponComponent.body.setSize(22, 35);
      this._weaponComponent.body.position.set(this._sprite.x + 12, this._sprite.y - 4);
    } else if(DataManager.instance.data.weapon === WEAPON.STAFF) {
      this._weaponComponent.body.setSize(23, 35);
      this._weaponComponent.body.position.set(this._sprite.x + 12, this._sprite.y - 4);
    } else if(DataManager.instance.data.weapon === WEAPON.DAGGER) {
      this._weaponComponent.body.setSize(20, 33);
      this._weaponComponent.body.position.set(this._sprite.x + 12, this._sprite.y - 3);
    } else  {// WEAPON.NONE
      this._weaponComponent.body.setSize(18, 31);
      this._weaponComponent.body.position.set(this._sprite.x + 12, this._sprite.y - 2);
    }
    this.attack(DIRECTION.RIGHT);
  }

  public attackLeft(): void {
    if(DataManager.instance.data.weapon === WEAPON.SWORD) {
      this._weaponComponent.body.setSize(22, 35);
      this._weaponComponent.body.position.set(this._sprite.x - 30, this._sprite.y - 4);
    } else if(DataManager.instance.data.weapon === WEAPON.STAFF) {
      this._weaponComponent.body.setSize(23, 35);
      this._weaponComponent.body.position.set(this._sprite.x - 31, this._sprite.y - 4);
    } else if(DataManager.instance.data.weapon === WEAPON.DAGGER) {
      this._weaponComponent.body.setSize(20, 33);
      this._weaponComponent.body.position.set(this._sprite.x - 28, this._sprite.y - 3);
    } else  {// WEAPON.NONE
      this._weaponComponent.body.setSize(18, 31);
      this._weaponComponent.body.position.set(this._sprite.x - 26, this._sprite.y - 2);
    }
    this.attack(DIRECTION.LEFT);
  }
}
