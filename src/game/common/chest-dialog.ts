import { GEAR, POTION, WEAPON } from './common';
import { logChestDebug } from './chest-debug';
import type { Gear, Potion, Weapon } from './common';
import { GameDataManager } from './game-data-manager';
import { formatChestGearOption, formatChestHeading, formatChestWeaponOption, formatChestPotionOption, getText } from './texts';
import type { ChestJJK } from '../game-objects/objects/chestJJK';

export type DialogPayload = {
  heading: string;
  options: string[];
};

export interface ChestDialogInfo {
  option1GearToPlayer: Gear,
  option1WeaponToPlayer: Weapon,
  option1GearToLeave: Gear,
  option1WeaponToLeave: Weapon,
  option2GearToPlayer: Gear,
  option2GearToLeave: Gear,
  option1PotionToPlayer: Potion,
  chestNumber?: number,
  dialog: DialogPayload,
}

export function writeChestDialogInfo(chest: ChestJJK): ChestDialogInfo {
  logChestDebug('writeChestDialogInfo started', {
    chest: chest.debugInfo,
    player: {
      gear: GameDataManager.instance.data.gear,
      weapon: GameDataManager.instance.data.weapon,
      potion: GameDataManager.instance.data.potion,
    },
  });
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
  let optionPotion = formatChestPotionOption(chest.contents.potion, GameDataManager.instance.data.potion);
  if (chest.contents.potion !== POTION.NONE) {
    potionHasOption = true;
  }
  let weaponHasOption = false;
  let optionWeapon = formatChestWeaponOption(chest.contents.weapon, GameDataManager.instance.data.weapon);
  if (chest.contents.weapon !== WEAPON.NONE) {
    weaponHasOption = true;
  }
  if (GameDataManager.instance.data.weapon !== WEAPON.NONE) {
    weaponHasOption = true;
  }
  let gearHasOption = false;
  let optionGear = formatChestGearOption(chest.contents.gear, GameDataManager.instance.data.gear);
  if (chest.contents.gear !== GEAR.NONE) {
    gearHasOption = true;
  }
  if (GameDataManager.instance.data.gear !== GEAR.NONE) {
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
    result.option1WeaponToLeave = GameDataManager.instance.data.weapon;
    result.option2GearToPlayer = chest.contents.gear;
    result.option2GearToLeave = GameDataManager.instance.data.gear;
  } else if (gearHasOption || weaponHasOption) {
    if (gearHasOption) {
      result.dialog = {
        heading,
        options: [optionGear, getText('chest.leave')],
      };
      result.option1GearToPlayer = chest.contents.gear;
      result.option1GearToLeave = GameDataManager.instance.data.gear;
    } else {
      result.dialog = {
        heading,
        options: [optionWeapon, getText('chest.leave')],
      };
      result.option1WeaponToPlayer = chest.contents.weapon;
      result.option1WeaponToLeave = GameDataManager.instance.data.weapon;
    }
  }
  logChestDebug('writeChestDialogInfo completed', {
    chestNumber: result.chestNumber,
    dialog: result.dialog,
    option1GearToPlayer: result.option1GearToPlayer,
    option1WeaponToPlayer: result.option1WeaponToPlayer,
    option1GearToLeave: result.option1GearToLeave,
    option1WeaponToLeave: result.option1WeaponToLeave,
    option2GearToPlayer: result.option2GearToPlayer,
    option2GearToLeave: result.option2GearToLeave,
    option1PotionToPlayer: result.option1PotionToPlayer,
  });
  return result;
}