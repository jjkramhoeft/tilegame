import * as Phaser from 'phaser';
import { BaseWeapon, WeaponAttackAnimationConfig } from './base-weapon';
import { DIRECTION, WEAPON } from '../../common/common';
import { DataManager } from '../../common/data-manager';
import { WeaponComponent } from '../../components/game-object/weapon-component';

// The sword thrust spritesheet uses 128x128 frames while every other player
// animation uses 64x64. When the larger frame is displayed the player's
// physics body (positioned via sprite.x - displayOriginX + offset) shifts by
// (128-64)/2 = 32px up-and-left. We compensate by adjusting the player body
// offset whenever a sword-thrust animation is playing.
const SWORD_THRUST_FRAME_OFFSET = 32;

export class JjkWeapons extends BaseWeapon {
  private _swordOffsetApplied = false;
  private _animStartListenerInstalled = false;

  constructor(
    sprite: Phaser.GameObjects.Sprite,
    weaponComponent: WeaponComponent,
    animationConfig: WeaponAttackAnimationConfig,
    baseDamage: number,
    isPlayerWeapon?: boolean,
    sex?: string,
    gear?: string,
    weapon?: string,
  ) {
    super(sprite, weaponComponent, animationConfig, baseDamage, isPlayerWeapon, sex, gear, weapon);
    this._installAnimationListener();
  }

  public attackUp(): void {
    if(DataManager.instance.data.weapon === WEAPON.SWORD) {
      this._weaponComponent.body.setSize(44, 32);
      this._weaponComponent.body.position.set(this._sprite.x - 21, this._sprite.y - 24);
    } else if(DataManager.instance.data.weapon === WEAPON.STAFF) {
      this._weaponComponent.body.setSize(40, 28);
      this._weaponComponent.body.position.set(this._sprite.x - 19, this._sprite.y - 23);
    } else if(DataManager.instance.data.weapon === WEAPON.DAGGER) {
      this._weaponComponent.body.setSize(36, 24);
      this._weaponComponent.body.position.set(this._sprite.x - 17, this._sprite.y - 22);
    } else  {// WEAPON.NONE
      this._weaponComponent.body.setSize(32, 20);
      this._weaponComponent.body.position.set(this._sprite.x - 15, this._sprite.y - 21);
    }
    this.attack(DIRECTION.UP);
  }

  public attackDown(): void {
    if(DataManager.instance.data.weapon === WEAPON.SWORD) {
      this._weaponComponent.body.setSize(44, 32);   
      this._weaponComponent.body.position.set(this._sprite.x - 21, this._sprite.y + 22);
    } else if(DataManager.instance.data.weapon === WEAPON.STAFF) {
      this._weaponComponent.body.setSize(40, 28);   
      this._weaponComponent.body.position.set(this._sprite.x - 19, this._sprite.y + 22);
    } else if(DataManager.instance.data.weapon === WEAPON.DAGGER) {
      this._weaponComponent.body.setSize(36, 24);   
      this._weaponComponent.body.position.set(this._sprite.x - 17, this._sprite.y + 22);
    } else  {// WEAPON.NONE
      this._weaponComponent.body.setSize(32, 20);   
      this._weaponComponent.body.position.set(this._sprite.x - 15, this._sprite.y + 22);
    }
    this.attack(DIRECTION.DOWN);
  }

  public attackRight(): void {
    if(DataManager.instance.data.weapon === WEAPON.SWORD) {
      this._weaponComponent.body.setSize(32, 44);
      this._weaponComponent.body.position.set(this._sprite.x + 12, this._sprite.y - 10);
    } else if(DataManager.instance.data.weapon === WEAPON.STAFF) {
      this._weaponComponent.body.setSize(28, 40);
      this._weaponComponent.body.position.set(this._sprite.x + 12, this._sprite.y - 6);
    } else if(DataManager.instance.data.weapon === WEAPON.DAGGER) {
      this._weaponComponent.body.setSize(24, 36);
      this._weaponComponent.body.position.set(this._sprite.x + 12, this._sprite.y - 4);
    } else  {// WEAPON.NONE
      this._weaponComponent.body.setSize(20, 32);
      this._weaponComponent.body.position.set(this._sprite.x + 12, this._sprite.y - 2);
    }
    this.attack(DIRECTION.RIGHT);
  }

  public attackLeft(): void {
    if(DataManager.instance.data.weapon === WEAPON.SWORD) {
      this._weaponComponent.body.setSize(32, 44);
      this._weaponComponent.body.position.set(this._sprite.x -40, this._sprite.y -10);
    } else if(DataManager.instance.data.weapon === WEAPON.STAFF) {
      this._weaponComponent.body.setSize(28, 40);
      this._weaponComponent.body.position.set(this._sprite.x - 36, this._sprite.y - 6);
    } else if(DataManager.instance.data.weapon === WEAPON.DAGGER) {
      this._weaponComponent.body.setSize(24, 36);
      this._weaponComponent.body.position.set(this._sprite.x - 32, this._sprite.y - 4);
    } else  {// WEAPON.NONE
      this._weaponComponent.body.setSize(20, 32);
      this._weaponComponent.body.position.set(this._sprite.x - 28, this._sprite.y - 2);
    }
    this.attack(DIRECTION.LEFT);
  }

  /**
   * Watch the player sprite for animation changes. Whenever a sword-thrust
   * animation (which uses 128x128 frames instead of the standard 64x64)
   * starts, shift the player body offset to keep the physics body anchored
   * to the same visual point. Whenever any other animation starts, restore
   * the original offset.
   */
  private _installAnimationListener(): void {
    if (this._animStartListenerInstalled) {
      return;
    }
    this._animStartListenerInstalled = true;

    this._sprite.on(
      Phaser.Animations.Events.ANIMATION_START,
      (animation: Phaser.Animations.Animation) => {
        const isSwordThrust = animation.key.includes('-sword-thrust-');
        if (isSwordThrust) {
          this._setSwordOffset(true);
        } else {
          this._setSwordOffset(false);
        }
      },
    );
  }

  private _setSwordOffset(apply: boolean): void {
    if (apply === this._swordOffsetApplied) {
      return;
    }
    const body = (this._sprite as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      return;
    }
    const delta = apply ? SWORD_THRUST_FRAME_OFFSET : -SWORD_THRUST_FRAME_OFFSET;
    body.setOffset(body.offset.x + delta, body.offset.y + delta);
    this._swordOffsetApplied = apply;
  }
}
