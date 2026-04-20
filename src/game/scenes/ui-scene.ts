import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, HEART_ANIMATIONS, HEART_TEXTURE_FRAME } from '../common/assets';
import { DataManager } from '../common/data-manager';
import { CUSTOM_EVENTS, EVENT_BUS, PLAYER_HEALTH_UPDATE_TYPE, PlayerHealthUpdated } from '../common/event-bus';
import { DEFAULT_UI_HEADING_STYLE, DEFAULT_UI_OPTION_STYLE, WEAPON, GEAR } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { ChestJJK } from '../game-objects/objects/chestJJK';

export interface ChestDialogInfo {
  option1GearToPlayer: string,
  option1WeaponToPlayer: string,
  option1GearToLeave: string,
  option1WeaponToLeave: string,
  option2GearToPlayer: string,
  option2GearToLeave: string,
  chestNumber?: number,
  message: string,
}

export class UiScene extends Phaser.Scene {
  #hudContainer!: Phaser.GameObjects.Container;
  #hearts!: Phaser.GameObjects.Sprite[];
  #dialogContainer!: Phaser.GameObjects.Container;
  #dialogContainerText!: Phaser.GameObjects.Text;
  #dialogContainerOption1!: Phaser.GameObjects.Text;
  #dialogContainerOption2!: Phaser.GameObjects.Text;
  #dialogContainerOption3!: Phaser.GameObjects.Text;
  #dialogOptionCount!: number;
  #cursorGameObject!: Phaser.GameObjects.Image;
  #controls!: KeyboardComponent;
  #selectedMenuOptionIndex!: number;

  constructor() {
    super({
      key: SCENE_KEYS.UI_SCENE,
    });
  }

  public create(): void {
    if (!this.input.keyboard) {
      return;
    }

    // create main hud
    this.#hudContainer = this.add.container(0, 0, []);
    this.#hearts = [];

    // Health -----------------------------------------------

    const numberOfHearts = Math.floor(DataManager.instance.data.maxHealth / 2);
    const numberOfFullHearts = Math.floor(DataManager.instance.data.currentHealth / 2);
    const hasHalfHeart = DataManager.instance.data.currentHealth % 2 === 1;
    for (let i = 0; i < 20; i += 1) {
      let x = 157 + 16 * i;
      let y = 25;
      if (i >= 10) {
        x = 157 + 16 * (i - 10);
        y = 43;
      }
      let frame: number = 3;//string = HEART_TEXTURE_FRAME.NONE;
      if (i < numberOfFullHearts) {
        frame = 2;//HEART_TEXTURE_FRAME.FULL;
      } else if (i < numberOfHearts) {
        frame = 0;//HEART_TEXTURE_FRAME.EMPTY;
      }
      if (hasHalfHeart && i === numberOfFullHearts) {
        frame = 2;//HEART_TEXTURE_FRAME.HALF;
      }
      this.#hearts.push(this.add.sprite(x, y, "hearts16"/*ASSET_KEYS.HUD_NUMBERS*/, frame).setOrigin(0));
    }
    this.#hudContainer.add(this.#hearts);

    // Dialog --------------------------------------------------
    // Frame
    this.#dialogContainer = this.add.container(205, 80, [this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0).setDisplaySize(610, 250)]);
    // Header
    this.#dialogContainerText = this.add.text(75, 40, '', DEFAULT_UI_HEADING_STYLE).setOrigin(0);
    this.#dialogContainer.add(this.#dialogContainerText);
    // Option 1
    this.#dialogContainerOption1 = this.add.text(65, 85, '', DEFAULT_UI_OPTION_STYLE).setOrigin(0);
    this.#dialogContainer.add(this.#dialogContainerOption1);
    // Option 2
    this.#dialogContainerOption2 = this.add.text(65, 125, '', DEFAULT_UI_OPTION_STYLE).setOrigin(0);
    this.#dialogContainer.add(this.#dialogContainerOption2);
    // Option 3
    this.#dialogContainerOption3 = this.add.text(65, 165, '', DEFAULT_UI_OPTION_STYLE).setOrigin(0);
    this.#dialogContainer.add(this.#dialogContainerOption3);

    // Cursor
    this.#cursorGameObject = this.add.image(45, 85, ASSET_KEYS.UI_CURSOR, 0).setOrigin(0).setDisplaySize(16, 16);
    this.#dialogContainer.add(this.#cursorGameObject);

    this.#dialogContainer.visible = false;

    this.#controls = new KeyboardComponent(this.input.keyboard);
    this.#selectedMenuOptionIndex = 0;


    // register event listeners
    EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_HEALTH_UPDATED, this.updateHealthInHud, this);
    EVENT_BUS.on(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_HEALTH_UPDATED, this.updateHealthInHud, this);
      EVENT_BUS.off(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
    });
  }

  public async updateHealthInHud(data: PlayerHealthUpdated): Promise<void> {
    if (data.type === PLAYER_HEALTH_UPDATE_TYPE.INCREASE) {
      // if player has increased their health, picking up hearts, new heart container, fairy, etc.,
      // need to update their health here
      return;
    }

    // play animation for losing hearts depending on the amount of health lost
    const healthDifference = data.previousHealth - data.currentHealth;
    let health = data.previousHealth;
    for (let i = 0; i < healthDifference; i += 1) {
      const heartIndex = Math.round(health / 2) - 1;
      const isHalfHeart = health % 2 === 1;
      let animationName = "JJK_LOOSE_SECOND_HALF";//HEART_ANIMATIONS.LOSE_LAST_HALF;
      if (!isHalfHeart) {
        animationName = "JJK_LOOSE_FIRST_HALF";//HEART_ANIMATIONS.LOSE_FIRST_HALF;
      }
      await new Promise((resolve) => {
        this.#hearts[heartIndex].play(animationName);
        this.#hearts[heartIndex].once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationName, () => {
          resolve(undefined);
        });
      });
      health -= 1;
    }
  }

  public showDialog(message: string): void {
    this.#selectedMenuOptionIndex = 0;
    this.#dialogContainer.visible = true;
    let messageParts = message.split('|');
    this.#dialogOptionCount = messageParts.length - 2;
    this.#dialogContainerText.setText(messageParts[0]);
    this.#dialogContainerOption1.setText(messageParts[1]);
    this.#dialogContainerOption2.setText(messageParts[2]);
    this.#dialogContainerOption3.setText(messageParts[3]);
  }

  public update(): void {
    if (this.#controls.isEnterKeyJustDown) {
      let d = DataManager.instance.data;
      d.lastDialogOptionSelected = this.#selectedMenuOptionIndex;
      DataManager.instance.data = d;
      this.#dialogContainer.visible = false;
      EVENT_BUS.emit(CUSTOM_EVENTS.DIALOG_CLOSED);
      return;
    }

    if (this.#controls.isUpJustDown) {
      this.#selectedMenuOptionIndex -= 1;
      if (this.#selectedMenuOptionIndex < 0) {
        this.#selectedMenuOptionIndex = 0;
      }
    } else if (this.#controls.isDownJustDown) {
      this.#selectedMenuOptionIndex += 1;
      if (this.#selectedMenuOptionIndex > this.#dialogOptionCount) {
        this.#selectedMenuOptionIndex = this.#dialogOptionCount;
      }
    } else {
      return;
    }

    this.#cursorGameObject.setY(85 + this.#selectedMenuOptionIndex * 40);
  }

  public getSelectedDialogOption(): number {
    return this.#selectedMenuOptionIndex;
  }
}

export function writeChestDialogInfo(chest: ChestJJK): ChestDialogInfo {
  let result: ChestDialogInfo = {
    option1GearToPlayer: GEAR.NONE,
    option1WeaponToPlayer: WEAPON.NONE,
    option1GearToLeave: GEAR.NONE,
    option1WeaponToLeave: WEAPON.NONE,
    option2GearToPlayer: GEAR.NONE,
    option2GearToLeave: GEAR.NONE,
    chestNumber: chest.id,
    message: '',
  };
  let heading = 'You opened an empty chest.';
  if (chest.contents.weapon !== WEAPON.NONE || chest.contents.gear !== GEAR.NONE) {
    heading = `You opened a chest and found `;
    switch (chest.contents.gear) {
      case GEAR.BARE: heading += 'a piece of cloth'; break;
      case GEAR.BASIC: heading += 'some simple clothing'; break;
      case GEAR.ARMOR: heading += 'a shining armor'; break;
    }
    if (chest.contents.weapon !== WEAPON.NONE && chest.contents.gear !== GEAR.NONE) {
      heading += ' and ';
    }
    switch (chest.contents.weapon) {
      case WEAPON.DAGGER: heading += 'a dagger'; break;
      case WEAPON.STAFF: heading += 'a staff'; break;
      case WEAPON.SWORD: heading += 'a sword'; break;
    }
  }
  let weaponHasOption = false;
  let optionWeapon = '';
  let leaveWeapon = 'leave your current ';
  switch (DataManager.instance.data.weapon) {
    case WEAPON.DAGGER: leaveWeapon += 'dagger'; break;
    case WEAPON.STAFF: leaveWeapon += 'staff'; break;
    case WEAPON.SWORD: leaveWeapon += 'sword'; break;
  }
  if (chest.contents.weapon !== WEAPON.NONE) {
    weaponHasOption = true;
    optionWeapon = 'Take ';
    switch (chest.contents.weapon) {
      case WEAPON.DAGGER: optionWeapon += 'the dagger'; break;
      case WEAPON.STAFF: optionWeapon += 'the staff'; break;
      case WEAPON.SWORD: optionWeapon += 'the sword'; break;
    }
    if (DataManager.instance.data.weapon !== WEAPON.NONE) {
      optionWeapon += ' and ';
    }
  }
  if (DataManager.instance.data.weapon !== WEAPON.NONE) {
    optionWeapon += leaveWeapon;
    weaponHasOption = true;
  }
  let gearHasOption = false;
  let optionGear = '';
  let leaveGear = 'leave your current ';
  switch (DataManager.instance.data.gear) {
    case GEAR.BARE: leaveGear += 'piece of cloth'; break;
    case GEAR.BASIC: leaveGear += 'simple clothing'; break;
    case GEAR.ARMOR: leaveGear += 'shining armor'; break;
  }
  if (chest.contents.gear !== GEAR.NONE) {
    gearHasOption = true;
    optionGear = 'Take';
    switch (chest.contents.gear) {
      case GEAR.BARE: optionGear += ' the piece of cloth'; break;
      case GEAR.BASIC: optionGear += ' the simple clothing'; break;
      case GEAR.ARMOR: optionGear += ' the shining armor'; break;
    }
    if (DataManager.instance.data.gear !== GEAR.NONE) {
      optionGear += ' and ';
    }
  }
  if (DataManager.instance.data.gear !== GEAR.NONE) {
    optionGear += leaveGear;
    gearHasOption = true;
  }
  result.message = `${heading}|Leave`;
  if (gearHasOption && weaponHasOption) {
    result.message = `${heading}|${optionWeapon}|${optionGear}|Leave`;
    result.option1WeaponToPlayer = chest.contents.weapon;
    result.option1WeaponToLeave = DataManager.instance.data.weapon;
    result.option2GearToPlayer = chest.contents.gear;
    result.option2GearToLeave = DataManager.instance.data.gear;
  } else if (gearHasOption || weaponHasOption) {
    if (gearHasOption) {
      result.message = `${heading}|${optionGear}|Leave`;
      result.option1GearToPlayer = chest.contents.gear;
      result.option1GearToLeave = DataManager.instance.data.gear;
    } else {
      result.message = `${heading}|${optionWeapon}|Leave`;
      result.option1WeaponToPlayer = chest.contents.weapon;
      result.option1WeaponToLeave = DataManager.instance.data.weapon;
    }
  }
  return result;
}
