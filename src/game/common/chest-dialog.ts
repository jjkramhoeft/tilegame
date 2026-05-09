import { GEAR, WEAPON } from './common';
import { DataManager } from './data-manager';
import type { ChestJJK } from '../game-objects/objects/chestJJK';

export type DialogPayload = {
  heading: string;
  options: string[];
};

export interface ChestDialogInfo {
  option1GearToPlayer: string,
  option1WeaponToPlayer: string,
  option1GearToLeave: string,
  option1WeaponToLeave: string,
  option2GearToPlayer: string,
  option2GearToLeave: string,
  chestNumber?: number,
  dialog: DialogPayload,
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
    dialog: {
      heading: '',
      options: [],
    },
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
  result.dialog = {
    heading,
    options: ['Leave'],
  };
  if (gearHasOption && weaponHasOption) {
    result.dialog = {
      heading,
      options: [optionWeapon, optionGear, 'Leave'],
    };
    result.option1WeaponToPlayer = chest.contents.weapon;
    result.option1WeaponToLeave = DataManager.instance.data.weapon;
    result.option2GearToPlayer = chest.contents.gear;
    result.option2GearToLeave = DataManager.instance.data.gear;
  } else if (gearHasOption || weaponHasOption) {
    if (gearHasOption) {
      result.dialog = {
        heading,
        options: [optionGear, 'Leave'],
      };
      result.option1GearToPlayer = chest.contents.gear;
      result.option1GearToLeave = DataManager.instance.data.gear;
    } else {
      result.dialog = {
        heading,
        options: [optionWeapon, 'Leave'],
      };
      result.option1WeaponToPlayer = chest.contents.weapon;
      result.option1WeaponToLeave = DataManager.instance.data.weapon;
    }
  }
  return result;
}