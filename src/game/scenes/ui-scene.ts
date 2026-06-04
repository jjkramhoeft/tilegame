import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, HEART_TEXTURE_FRAME, POWER_TEXTURE_FRAME, PROGRESS_TEXTURE_FRAME, SPIN_HUD_ANIMATIONS } from '../common/assets';
import { GameDataManager } from '../common/game-data-manager';
import {
  CUSTOM_EVENTS,
  EVENT_BUS,
  PLAYER_UPDATE_TYPE,
  registerEventBusListenersUntilShutdown,
  type DimHelpKeyboardKeysPayload,
  type LivingCreaturesUpdated,
  type ProgressionHelpCloseAction as NarratorDialogCloseAction,
  type ProgressionHelpClosed as NarratorDialogClosed,
  type ProgressionHelpPayload as NarratorDialogPayload,
  type PlayerHealthUpdated,
  type PlayerMaxHealthUpdated,
  type PlayerPowerUpdated,
  type PlayerProgressUpdated,
} from '../common/event-bus';
import { DEFAULT_UI_HEADING_STYLE, DEFAULT_UI_OPTION_STYLE } from '../common/common';
import type { DialogPayload } from '../common/chest-dialog';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { getText } from '../common/texts';
import { ENABLE_LOGGING } from '../common/config';

const HUD_ICON_SIZE = 16;
const HUD_ROW_LENGTH = 10;
const HUD_METER_SPRITE_COUNT = 20;
const HUD_FIRST_ROW_Y = 25;
const HUD_SECOND_ROW_Y = 43;
const HUD_HEALTH_X = 50;
const HUD_POWER_X = 400;
const HUD_PROGRESS_X = 800;

const KEYBOARD_HELP_Y_OFFSET = 105;
const KEYBOARD_HELP_ACTION_Y = 6;
const KEYBOARD_HELP_TEXT_Y = 42;
const KEYBOARD_HELP_MOVE_TEXT_Y = 65;
const KEYBOARD_HELP_ITEM_SPACING = 130;
const KEYBOARD_HELP_DIM_TINT = 0x999999;
const KEYBOARD_HELP_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  align: 'center',
  fontFamily: ASSET_KEYS.FONT_PIXEL_SERIF_16PX,
  fontSize: 18,
  color: '#FFFFFF',
  stroke: '#000000',
  strokeThickness: 4,
};

const DIALOG_X = 205;
const DIALOG_Y = 80;
const DIALOG_WIDTH = 610;
const DIALOG_HEIGHT = 250;
const DIALOG_HEADING_X = 75;
const DIALOG_HEADING_Y = 40;
const DIALOG_OPTION_X = 65;
const DIALOG_CURSOR_X = 45;
const NARRATOR_DIALOG_OPTION_X = 185;
const NARRATOR_DIALOG_CURSOR_X = 165;
const DIALOG_FIRST_OPTION_Y = 85;
const NARRATOR_DIALOG_MESSAGE_X = 75;
const NARRATOR_DIALOG_MESSAGE_Y = 45;
const NARRATOR_DIALOG_OPTION_Y = 180;
const DIALOG_OPTION_SPACING = 40;
const DIALOG_CURSOR_SIZE = 16;

type HudMeterConfig = {
  currentValue: number;
  maxValue: number;
  startX: number;
  textureKey: string;
  horizontalSpacing?: number;
  fullIndex: number;
  emptyIndex: number;
};

type KeyboardHelpTextKey = DimHelpKeyboardKeysPayload['textKey'];
type KeyboardHelpObject = Phaser.GameObjects.Image | Phaser.GameObjects.Text;

const enum UiMode {
  HudOnly,
  ChestDialog,
  NarratorDialog,
}

export class UiScene extends Phaser.Scene {
  #hudContainer!: Phaser.GameObjects.Container;
  #hearts!: Phaser.GameObjects.Sprite[];
  #power!: Phaser.GameObjects.Sprite[];
  #progress!: Phaser.GameObjects.Sprite[];
  #keyBoardHelpContainer!: Phaser.GameObjects.Container;
  #keyboardHelpObjects = new Map<KeyboardHelpTextKey, KeyboardHelpObject[]>();

  #narratorDialogContainer!: Phaser.GameObjects.Container;
  #narratorDialogText!: Phaser.GameObjects.Text;
  #narratorDialogCloseAction: NarratorDialogCloseAction = 'close';

  #chestDialogContainer!: Phaser.GameObjects.Container;
  #chestDialogContainerText!: Phaser.GameObjects.Text;
  #chestDialogOptions!: Phaser.GameObjects.Text[];
  #activeChestDialogOptionCount!: number;
  #cursorGameObject!: Phaser.GameObjects.Image;

  #controls!: KeyboardComponent;
  #selectedMenuOptionIndex!: number;
  #uiMode = UiMode.HudOnly;
  #chestOpenSound!: Phaser.Sound.BaseSound;
  #chestCloseSound!: Phaser.Sound.BaseSound;
  #levelUpSound!: Phaser.Sound.BaseSound;
  #uiDownSound!: Phaser.Sound.BaseSound;
  #uiUpSound!: Phaser.Sound.BaseSound;
  #uiSelectSound!: Phaser.Sound.BaseSound;
  #narratorSound!: Phaser.Sound.BaseSound;
  constructor() {
    super({
      key: SCENE_KEYS.UI_SCENE,
    });
  }

  public create(): void {
    this.#resetSceneState();

    if (ENABLE_LOGGING) {
      console.debug('[UiScene] create start', { isDebugMode: GameDataManager.instance.data.isDebugMode, initialMode: this.#getUiModeName(), });
    }

    if (!this.input.keyboard) { console.warn('[UiScene] keyboard plugin is not setup properly'); return; }

    this.#createHud();
    this.#createKeyboardHelpContainer();
    this.#createChestDialog();
    this.#createNarratorDialog();

    this.#controls = new KeyboardComponent(this.input.keyboard);
    this.#selectedMenuOptionIndex = 0;
    this.#chestOpenSound = this.sound.add(ASSET_KEYS.CHEST);
    this.#chestCloseSound = this.sound.add(ASSET_KEYS.CHEST_2);
    this.#levelUpSound = this.sound.add(ASSET_KEYS.LEVELUP, { volume: 1.0 });
    this.#uiDownSound = this.sound.add(ASSET_KEYS.UI_DOWN);
    this.#uiUpSound = this.sound.add(ASSET_KEYS.UI_UP);
    this.#uiSelectSound = this.sound.add(ASSET_KEYS.UI_SELECT);
    this.#narratorSound = this.sound.add(ASSET_KEYS.SUCCESS_1);

    registerEventBusListenersUntilShutdown(this, [
      { event: CUSTOM_EVENTS.PLAYER_HEALTH_UPDATED, listener: this.updateHealthInHud, context: this },
      { event: CUSTOM_EVENTS.PLAYER_MAX_HEALTH_UPDATED, listener: this.updateMaxHealthInHud, context: this },
      { event: CUSTOM_EVENTS.PLAYER_POWER_UPDATED, listener: this.updatePowerInHud, context: this },
      { event: CUSTOM_EVENTS.LIVING_CREATURES_UPDATED, listener: this.updateLivingCreaturesInHud, context: this },
      { event: CUSTOM_EVENTS.SHOW_HEALTH_HUD, listener: this.showHealthHud, context: this },
      { event: CUSTOM_EVENTS.SHOW_POWER_HUD, listener: this.showPowerHud, context: this },
      { event: CUSTOM_EVENTS.SHOW_PROGRESS_HUD, listener: this.showProgressHud, context: this },
      { event: CUSTOM_EVENTS.SHOW_HELP_KEYBORD, listener: this.showKeyboardHelp, context: this },
      { event: CUSTOM_EVENTS.HIDE_HELP_KEYBORD, listener: this.hideKeyboardHelp, context: this },
      { event: CUSTOM_EVENTS.DIM_HELP_KEYBORD_KEYS, listener: this.dimKeyboardHelpKeys, context: this },
      { event: CUSTOM_EVENTS.SHOW_CHEST_DIALOG, listener: this.showDialog, context: this },
      { event: CUSTOM_EVENTS.SHOW_NARRATOR_DIALOG, listener: this.showNarratorDialog, context: this },
    ]);
  }

  #resetSceneState(): void {
    this.#narratorDialogCloseAction = 'close';
    this.#selectedMenuOptionIndex = 0;
    this.#uiMode = UiMode.HudOnly;
  }

  public async updateHealthInHud(data: PlayerHealthUpdated): Promise<void> {
    const animationName = SPIN_HUD_ANIMATIONS.HEARTH;
    this.#ensureHealthMeterCapacity(GameDataManager.instance.data.maxHealth);
    
    if (data.type === PLAYER_UPDATE_TYPE.INCREASE) {
      // This updateHealthInHud only increases the health by 1, so we can just play the animation once and then sync the meter to the correct value at the end of the animation.
      await this.#playMeterSpriteAnimation(this.#hearts, data.currentHealth - 1, animationName, 'heart');
      this.#syncMeter(this.#hearts, data.currentHealth, HEART_TEXTURE_FRAME.FULL, HEART_TEXTURE_FRAME.NONE);
      return;
    }

    // This updateHealthInHud can decreases the health by more than 1, so we need to play the animation for each heart that is lost.
    const healthDifference = data.previousHealth - data.currentHealth;
    let health = data.previousHealth;
    for (let index = 0; index < healthDifference; index += 1) {
      await this.#playMeterSpriteAnimation(this.#hearts, health - 1, animationName, 'heart');
      health -= 1;
    }
    this.#syncMeter(this.#hearts, data.currentHealth, HEART_TEXTURE_FRAME.FULL, HEART_TEXTURE_FRAME.NONE);
  }

  public updateMaxHealthInHud(data: PlayerMaxHealthUpdated): void {
    this.#ensureHealthMeterCapacity(data.currentMaxHealth);
    this.#syncMeter(this.#hearts, GameDataManager.instance.data.currentHealth, HEART_TEXTURE_FRAME.FULL, HEART_TEXTURE_FRAME.NONE);
  }

  public updatePowerInHud(data: PlayerPowerUpdated): void {
    // This updatePowerInHud always increases the power by 1, so we can just play the animation once and then sync the meter to the correct value at the end of the animation.
    const power = this.#power[data.currentPower + 1];
    if (power) {
      power.play(SPIN_HUD_ANIMATIONS.POWER);
    } else {
      console.warn('[UiScene] Unable to animate power HUD. Invalid power index.', { currentPower: data.currentPower, meterLength: this.#power.length });
    }
    this.#syncMeter(this.#power, data.currentPower, POWER_TEXTURE_FRAME.FULL, POWER_TEXTURE_FRAME.NONE);
    if (data.type === PLAYER_UPDATE_TYPE.INCREASE && !this.#levelUpSound.isPlaying) {
      this.#levelUpSound.play();
    }
  }

  public updateProgressInHud(data: PlayerProgressUpdated): void {
    this.#syncMeter(this.#progress, data.currentProgress, PROGRESS_TEXTURE_FRAME.FULL, PROGRESS_TEXTURE_FRAME.NONE);
  }

  public updateLivingCreaturesInHud(data: LivingCreaturesUpdated): void {
    this.#syncLivingCreaturesMeter(data.currentLivingCreatures);
  }

  public showHealthHud(): void {
    this.#setMeterVisible(this.#hearts, true);
  }

  public showPowerHud(): void {
    this.#setMeterVisible(this.#power, true);
  }

  public showProgressHud(): void {
    this.#setMeterVisible(this.#progress, true);
  }

  public showKeyboardHelp(): void {
    this.#resetKeyboardHelpKeys();
    this.#keyBoardHelpContainer.visible = true;
  }

  public hideKeyboardHelp(): void {
    this.#keyBoardHelpContainer.visible = false;
  }

  public dimKeyboardHelpKeys(payload?: DimHelpKeyboardKeysPayload): void {
    if (!payload) {
      return;
    }
    const objects = this.#keyboardHelpObjects.get(payload.textKey);
    if (!objects) {
      return;
    }
    this.#setKeyboardHelpObjectsDimmed(objects, true);
  }

  public showDialog(dialog: DialogPayload): void {
    this.#uiMode = UiMode.ChestDialog;
    this.#selectedMenuOptionIndex = 0;
    this.#activeChestDialogOptionCount = dialog.options.length;
    this.#chestDialogContainer.visible = true;
    this.#chestDialogContainerText.setText(dialog.heading);
    this.#chestDialogOptions.forEach((option, index) => {
      option.setText(dialog.options[index] ?? '');
      option.visible = index < dialog.options.length;
    });
    this.#updateDialogCursor();
    if (!this.#chestOpenSound.isPlaying) {
      this.#chestOpenSound.play();
    }
  }

  public showNarratorDialog(payload: NarratorDialogPayload): void {
    this.#uiMode = UiMode.NarratorDialog;
    this.#narratorDialogCloseAction = payload.closeAction ?? 'close';
    this.#chestDialogContainer.visible = false;
    this.#narratorDialogText.setText(getText(payload.textKey));
    this.#narratorDialogContainer.visible = true;
    if (!this.#narratorSound.isPlaying) {
      this.#narratorSound.play();
    }
  }

  public update(): void {

    const narratorConfirmWithActionKey = this.#controls.isActionKeyJustDown &&
      (this.#uiMode === UiMode.NarratorDialog || this.#uiMode === UiMode.ChestDialog);

    if (narratorConfirmWithActionKey) {
      this.#confirmSelectedOption();
      this.#uiSelectSound.play();
      return;
    }

    if (this.#uiMode !== UiMode.HudOnly) {
      if (this.#controls.isUpJustDown) {
        this.#moveSelection(-1);
        this.#uiUpSound.play();
        return;
      }

      if (this.#controls.isDownJustDown) {
        this.#moveSelection(1);
        this.#uiDownSound.play();
      }
    }
  }

  public getSelectedDialogOption(): number {
    return this.#selectedMenuOptionIndex;
  }

  public isChestDialogShown(): boolean {
    return this.#uiMode === UiMode.ChestDialog;
  }

  #createHud(): void {
    const playerData = GameDataManager.instance.data;

    this.#hudContainer = this.add.container(0, 0, []);
    this.#hearts = this.#createMeter({
      currentValue: playerData.currentHealth,
      maxValue: playerData.maxHealth,
      startX: HUD_HEALTH_X,
      textureKey: ASSET_KEYS.HUD_ICONS,
      fullIndex: HEART_TEXTURE_FRAME.FULL,
      emptyIndex: HEART_TEXTURE_FRAME.NONE,
    });
    this.#power = this.#createMeter({
      currentValue: playerData.currentPower,
      maxValue: playerData.maxPower,
      startX: HUD_POWER_X,
      textureKey: ASSET_KEYS.HUD_ICONS,
      fullIndex: POWER_TEXTURE_FRAME.FULL,
      emptyIndex: POWER_TEXTURE_FRAME.NONE,
      horizontalSpacing: 2,
    });
    this.#progress = this.#createMeter({
      currentValue: this.#getLivingCreaturesMeterValue(playerData.currentLivingCreatures),
      maxValue: this.#getLivingCreaturesMeterValue(playerData.maxLivingCreaturesThisGame),
      startX: HUD_PROGRESS_X,
      textureKey: ASSET_KEYS.HUD_ICONS,
      fullIndex: PROGRESS_TEXTURE_FRAME.FULL,
      emptyIndex: PROGRESS_TEXTURE_FRAME.NONE,
    });

    this.#setMeterVisible(this.#hearts, true);// todo false
    this.#setMeterVisible(this.#power, true);
    this.#setMeterVisible(this.#progress, true);

    this.#hudContainer.add(this.#hearts);
    this.#hudContainer.add(this.#power);
    this.#hudContainer.add(this.#progress);
  }

  #createKeyboardHelpContainer(): void {
    this.#keyboardHelpObjects.clear();
    this.#keyBoardHelpContainer = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height - KEYBOARD_HELP_Y_OFFSET,
      [],
    );

    this.#createKeyboardHelpMove(KEYBOARD_HELP_ITEM_SPACING);
    this.#createKeyboardHelpAction('Attack', -KEYBOARD_HELP_ITEM_SPACING, 8, getText('keyboard.attack'));
    this.#createKeyboardHelpAction('Cast', -20, 10, getText('keyboard.cast'));

    this.#keyBoardHelpContainer.visible = false;
  }

  #createKeyboardHelpMove(x: number): void {
    const objects: KeyboardHelpObject[] = [
      this.add.image(x, -10, ASSET_KEYS.KEYBOARDKEYS, 13),
      this.add.image(x - 16, 22, ASSET_KEYS.KEYBOARDKEYS, 14),
      this.add.image(x, 22, ASSET_KEYS.KEYBOARDKEYS, 15),
      this.add.image(x + 16, 22, ASSET_KEYS.KEYBOARDKEYS, 16),
      this.add.text(x, KEYBOARD_HELP_MOVE_TEXT_Y, getText('keyboard.move'), KEYBOARD_HELP_TEXT_STYLE).setOrigin(0.5),
    ];
    this.#keyBoardHelpContainer.add(objects);
    this.#keyboardHelpObjects.set('Move', objects);
  }

  #createKeyboardHelpAction(textKey: KeyboardHelpTextKey, x: number, frame: number, label: string): void {
    const objects: KeyboardHelpObject[] = [
      this.add.image(x, KEYBOARD_HELP_ACTION_Y, ASSET_KEYS.KEYBOARDKEYS, frame),
      this.add.text(x, KEYBOARD_HELP_TEXT_Y, label, KEYBOARD_HELP_TEXT_STYLE).setOrigin(0.5),
    ];
    this.#keyBoardHelpContainer.add(objects);
    this.#keyboardHelpObjects.set(textKey, objects);
  }

  #resetKeyboardHelpKeys(): void {
    this.#keyboardHelpObjects.forEach((objects) => {
      this.#setKeyboardHelpObjectsDimmed(objects, false);
    });
  }

  #setKeyboardHelpObjectsDimmed(objects: KeyboardHelpObject[], dimmed: boolean): void {
    objects.forEach((object) => {
      if (dimmed) {
        object.setTint(KEYBOARD_HELP_DIM_TINT).setTintMode(Phaser.TintModes.MULTIPLY);
        return;
      }
      object.clearTint();
    });
  }

  #createMeter(config: HudMeterConfig): Phaser.GameObjects.Sprite[] {
    const meter: Phaser.GameObjects.Sprite[] = [];
    for (let index = 0; index < config.maxValue; index += 1) {
      const position = this.#getMeterSpritePosition(config.startX, index, config.horizontalSpacing);
      const frame = config.currentValue > index ? config.fullIndex : config.emptyIndex;
      meter.push(this.add.sprite(position.x, position.y, config.textureKey, frame).setOrigin(0));
    }
    return meter;
  }

  #ensureHealthMeterCapacity(maxHealth: number): void {
    const visible = this.#hearts[0]?.visible ?? true;
    const currentHealth = GameDataManager.instance.data.currentHealth;
    for (let index = this.#hearts.length; index < maxHealth; index += 1) {
      const position = this.#getMeterSpritePosition(HUD_HEALTH_X, index);
      const frame = currentHealth > index ? HEART_TEXTURE_FRAME.FULL : HEART_TEXTURE_FRAME.NONE;
      const sprite = this.add.sprite(position.x, position.y, ASSET_KEYS.HUD_ICONS, frame)
        .setOrigin(0)
        .setVisible(visible);
      this.#hearts.push(sprite);
      this.#hudContainer.add(sprite);
    }
  }

  async #playMeterSpriteAnimation(
    meter: Phaser.GameObjects.Sprite[],
    spriteIndex: number,
    animationName: string,
    meterName: string,
  ): Promise<void> {
    const sprite = meter[spriteIndex];
    if (!sprite) {
      console.warn(`[UiScene] Unable to animate ${meterName} HUD. Invalid sprite index.`, { spriteIndex, meterLength: meter.length });
      return;
    }
    await new Promise((resolve) => {
      sprite.play(animationName);
      sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationName, () => {
        resolve(undefined);
      });
    });
  }

  #syncMeter(meter: Phaser.GameObjects.Sprite[], currentValue: number, fullIndex: number, emptyIndex: number): void {
    
    meter.forEach((sprite, index) => {
      sprite.setFrame(currentValue > index ? fullIndex : emptyIndex);
    });
  }

  #setMeterVisible(meter: Phaser.GameObjects.Sprite[], visible: boolean): void {
    meter.forEach((sprite) => {
      sprite.visible = visible;
    });
  }

  #syncLivingCreaturesMeter(currentLivingCreatures: number): void {
    this.#syncMeter(
      this.#progress,
      this.#getLivingCreaturesMeterValue(currentLivingCreatures),
      PROGRESS_TEXTURE_FRAME.FULL,
      PROGRESS_TEXTURE_FRAME.NONE,
    );
  }

  #getLivingCreaturesMeterValue(currentLivingCreatures: number): number {
    return Math.min(currentLivingCreatures, HUD_METER_SPRITE_COUNT) * 2;
  }

  #getMeterSpritePosition(startX: number, index: number, horizontalSpacing: number = 0): { x: number; y: number } {
    const column = index % HUD_ROW_LENGTH;
    const row = Math.floor(index / HUD_ROW_LENGTH);
    return {
      x: startX + (HUD_ICON_SIZE + horizontalSpacing) * column,
      y: row === 0 ? HUD_FIRST_ROW_Y : HUD_SECOND_ROW_Y,
    };
  }

  #createChestDialog(): void {
    this.#chestDialogContainer = this.add.container(DIALOG_X, DIALOG_Y, [
      this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0).setDisplaySize(DIALOG_WIDTH, DIALOG_HEIGHT),
    ]);
    this.#chestDialogContainerText = this.add.text(DIALOG_HEADING_X, DIALOG_HEADING_Y, '', DEFAULT_UI_HEADING_STYLE).setOrigin(0);
    this.#chestDialogContainer.add(this.#chestDialogContainerText);

    this.#chestDialogOptions = [0, 1, 2].map((index) => {
      const option = this.add.text(
        DIALOG_OPTION_X,
        DIALOG_FIRST_OPTION_Y + index * DIALOG_OPTION_SPACING,
        '',
        DEFAULT_UI_OPTION_STYLE,
      ).setOrigin(0);
      this.#chestDialogContainer.add(option);
      return option;
    });

    this.#cursorGameObject = this.add.image(DIALOG_CURSOR_X, DIALOG_FIRST_OPTION_Y, ASSET_KEYS.UI_CURSOR, 0)
      .setOrigin(0)
      .setDisplaySize(DIALOG_CURSOR_SIZE, DIALOG_CURSOR_SIZE);
    this.#chestDialogContainer.add(this.#cursorGameObject);

    const navigationHelpText = this.add.text(DIALOG_HEADING_X + 50, DIALOG_FIRST_OPTION_Y + 3 * DIALOG_OPTION_SPACING, getText('ui.dialog_navigation_help'), DEFAULT_UI_HEADING_STYLE).setOrigin(0);
    this.#chestDialogContainer.add(navigationHelpText);

    this.#chestDialogContainer.visible = false;
    this.#activeChestDialogOptionCount = 0;
  }

  #createNarratorDialog(): void {
    this.#narratorDialogContainer = this.add.container(DIALOG_X, DIALOG_Y, [
      this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0).setDisplaySize(DIALOG_WIDTH, DIALOG_HEIGHT),
    ]);
    this.#narratorDialogText = this.add.text(
      NARRATOR_DIALOG_MESSAGE_X,
      NARRATOR_DIALOG_MESSAGE_Y,
      '',
      DEFAULT_UI_HEADING_STYLE,
    ).setOrigin(0);
    this.#narratorDialogContainer.add(this.#narratorDialogText);

    const continueOption = this.add.text(
      NARRATOR_DIALOG_OPTION_X,
      NARRATOR_DIALOG_OPTION_Y,
      getText('ui.progression.continue'),
      DEFAULT_UI_OPTION_STYLE,
    ).setOrigin(0);
    this.#narratorDialogContainer.add(continueOption);

    const cursor = this.add.image(NARRATOR_DIALOG_CURSOR_X, NARRATOR_DIALOG_OPTION_Y, ASSET_KEYS.UI_CURSOR, 0)
      .setOrigin(0)
      .setDisplaySize(DIALOG_CURSOR_SIZE, DIALOG_CURSOR_SIZE);
    this.#narratorDialogContainer.add(cursor);
    this.#narratorDialogContainer.visible = false;
  }

  #confirmSelectedOption(): void {

    if (this.#uiMode === UiMode.ChestDialog) {
      GameDataManager.instance.setLastDialogOptionSelected(this.#selectedMenuOptionIndex);
      this.#chestDialogContainer.visible = false;
      if (!this.#chestCloseSound.isPlaying) {
        this.#chestCloseSound.play();
      }
      EVENT_BUS.emit(CUSTOM_EVENTS.CHEST_DIALOG_CLOSED);
      this.#uiMode = UiMode.HudOnly;
      return;
    }

    if (this.#uiMode === UiMode.NarratorDialog) {
      const closeAction = this.#narratorDialogCloseAction;
      const closedPayload: NarratorDialogClosed = { closeAction };
      this.#narratorDialogContainer.visible = false;
      this.#narratorDialogCloseAction = 'close';
      this.#uiMode = UiMode.HudOnly;
      EVENT_BUS.emit(CUSTOM_EVENTS.NARRATOR_DIALOG_CLOSED, closedPayload);
    }
  }

  #getUiModeName(): string {
    switch (this.#uiMode) {
      case UiMode.HudOnly: return 'HudOnly';
      case UiMode.ChestDialog: return 'ChestDialog';
      case UiMode.NarratorDialog: return 'NarratorDialog';
    }
  }

  #moveSelection(direction: number): void {
    if (this.#uiMode === UiMode.ChestDialog) {
      this.#selectedMenuOptionIndex = Phaser.Math.Clamp(
        this.#selectedMenuOptionIndex + direction,
        0,
        Math.max(this.#activeChestDialogOptionCount - 1, 0),
      );
      this.#updateDialogCursor();
    }
  }

  #updateDialogCursor(): void {
    this.#cursorGameObject.setY(DIALOG_FIRST_OPTION_Y + this.#selectedMenuOptionIndex * DIALOG_OPTION_SPACING);
  }
}