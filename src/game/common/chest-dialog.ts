import { GEAR, POTION, WEAPON } from './common';
import { DataManager } from './data-manager';
import { formatChestGearOption, formatChestHeading, formatChestWeaponOption, formatChestPotionOption, getText } from './texts';
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
  option1PotionToPlayer: string,
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
    option1PotionToPlayer: POTION.NONE,
    chestNumber: chest.id,
    dialog: {
      heading: '',
      options: [],
    },
  };
  const heading = formatChestHeading(chest.contents);
  let potionHasOption = false;
  let optionPotion = formatChestPotionOption(chest.contents.potion, DataManager.instance.data.potion);
  if (chest.contents.potion !== POTION.NONE) {
    potionHasOption = true;
  }
  let weaponHasOption = false;
  let optionWeapon = formatChestWeaponOption(chest.contents.weapon, DataManager.instance.data.weapon);
  if (chest.contents.weapon !== WEAPON.NONE) {
    weaponHasOption = true;
  }
  if (DataManager.instance.data.weapon !== WEAPON.NONE) {
    weaponHasOption = true;
  }
  let gearHasOption = false;
  let optionGear = formatChestGearOption(chest.contents.gear, DataManager.instance.data.gear);
  if (chest.contents.gear !== GEAR.NONE) {
    gearHasOption = true;
  }
  if (DataManager.instance.data.gear !== GEAR.NONE) {
    gearHasOption = true;
  }
  result.dialog = {
    heading,
    options: [getText('chest.leave')],
  };
  if (potionHasOption ) {
    result.dialog = {
      heading,
      options: [optionPotion, getText('chest.leave')],
    };
    result.option1PotionToPlayer = chest.contents.potion;
  } else if  (gearHasOption && weaponHasOption) {
    result.dialog = {
      heading,
      options: [optionWeapon, optionGear, getText('chest.leave')],
    };
    result.option1WeaponToPlayer = chest.contents.weapon;
    result.option1WeaponToLeave = DataManager.instance.data.weapon;
    result.option2GearToPlayer = chest.contents.gear;
    result.option2GearToLeave = DataManager.instance.data.gear;
  } else if (gearHasOption || weaponHasOption) {
    if (gearHasOption) {
      result.dialog = {
        heading,
        options: [optionGear, getText('chest.leave')],
      };
      result.option1GearToPlayer = chest.contents.gear;
      result.option1GearToLeave = DataManager.instance.data.gear;
    } else {
      result.dialog = {
        heading,
        options: [optionWeapon, getText('chest.leave')],
      };
      result.option1WeaponToPlayer = chest.contents.weapon;
      result.option1WeaponToLeave = DataManager.instance.data.weapon;
    }
  }
  return result;
}