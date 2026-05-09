import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { DataManager } from '../common/data-manager';
import {
  CUSTOM_EVENTS,
  EVENT_BUS,
  PLAYER_UPDATE_TYPE,
  type ProgressionHelpCloseAction,
  type ProgressionHelpClosed,
  type ProgressionHelpPayload,
  type PlayerHealthUpdated,
  type PlayerPowerUpdated,
  type PlayerProgressUpdated,
} from '../common/event-bus';
import { DEFAULT_UI_HEADING_STYLE, DEFAULT_UI_OPTION_STYLE } from '../common/common';
import type { DialogPayload } from '../common/chest-dialog';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { getText } from '../common/texts';

const HUD_ICON_SIZE = 16;
const HUD_ROW_LENGTH = 10;
const HUD_METER_SPRITE_COUNT = 20;
const HUD_FIRST_ROW_Y = 25;
const HUD_SECOND_ROW_Y = 43;
const HUD_HEALTH_X = 50;
const HUD_POWER_X = 400;
const HUD_PROGRESS_X = 800;
const HUD_EMPTY_FRAME = 0;
const HUD_FULL_FRAME = 2;
const HUD_NONE_FRAME = 3;

const DIALOG_X = 205;
const DIALOG_Y = 80;
const SAVE_DIALOG_Y = 480;
const DIALOG_WIDTH = 610;
const DIALOG_HEIGHT = 250;
const DIALOG_HEADING_X = 75;
const DIALOG_HEADING_Y = 40;
const DIALOG_OPTION_X = 65;
const SAVE_DIALOG_OPTION_X = 165;
const DIALOG_CURSOR_X = 45;
const SAVE_DIALOG_CURSOR_X = 145;
const PROGRESSION_HELP_OPTION_X = 185;
const PROGRESSION_HELP_CURSOR_X = 165;
const DIALOG_FIRST_OPTION_Y = 85;
const PROGRESSION_HELP_MESSAGE_X = 75;
const PROGRESSION_HELP_MESSAGE_Y = 45;
const PROGRESSION_HELP_OPTION_Y = 180;
const DIALOG_OPTION_SPACING = 40;
const DIALOG_CURSOR_SIZE = 16;
const SAVE_DIALOG_OPTION_COUNT = 3;

type HudMeterConfig = {
  currentValue: number;
  maxValue: number;
  startX: number;
  textureKey: string;
  horizontalSpacing?: number;
};

const enum UiMode {
  HudOnly,
  ChestDialog,
  SaveDialog,
  ProgressionHelpDialog,
}

export class UiScene extends Phaser.Scene {
  #hudContainer!: Phaser.GameObjects.Container;
  #hearts!: Phaser.GameObjects.Sprite[];
  #power!: Phaser.GameObjects.Sprite[];
  #progress!: Phaser.GameObjects.Sprite[];

  #saveDialogContainer!: Phaser.GameObjects.Container;
  #saveDialogCursorGameObject!: Phaser.GameObjects.Image;

  #progressionHelpContainer!: Phaser.GameObjects.Container;
  #progressionHelpText!: Phaser.GameObjects.Text;
  #progressionHelpCloseAction: ProgressionHelpCloseAction = 'close';

  #dialogContainer!: Phaser.GameObjects.Container;
  #dialogContainerText!: Phaser.GameObjects.Text;
  #dialogOptions!: Phaser.GameObjects.Text[];
  #activeDialogOptionCount!: number;
  #cursorGameObject!: Phaser.GameObjects.Image;

  #controls!: KeyboardComponent;
  #selectedMenuOptionIndex!: number;
  #selectedSaveOptionIndex!: number;
  #uiMode = UiMode.HudOnly;

  constructor() {
    super({
      key: SCENE_KEYS.UI_SCENE,
    });
  }

  public create(): void {
    this.#resetSceneState();

    console.debug('[UiScene] create start', {
      isDebugMode: DataManager.instance.data.isDebugMode,
      initialMode: this.#getUiModeName(),
    });

    if (!this.input.keyboard) {
      console.warn('[UiScene] keyboard plugin is not setup properly');
      return;
    }

    this.#createHud();
    this.#createDialog();
    this.#createSaveDialog();
    this.#createProgressionHelpDialog();

    this.#controls = new KeyboardComponent(this.input.keyboard);
    this.#selectedMenuOptionIndex = 0;
    this.#selectedSaveOptionIndex = 0;

    EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_HEALTH_UPDATED, this.updateHealthInHud, this);
    EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_POWER_UPDATED, this.updatePowerInHud, this);
    EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_PROGRESS_UPDATED, this.updateProgressInHud, this);
    EVENT_BUS.on(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
    EVENT_BUS.on(CUSTOM_EVENTS.SHOW_PROGRESSION_HELP, this.showProgressionHelp, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      console.debug('[UiScene] shutdown cleanup', {
        mode: this.#getUiModeName(),
        progressionHelpVisible: this.#progressionHelpContainer?.visible,
        saveDialogVisible: this.#saveDialogContainer?.visible,
        dialogVisible: this.#dialogContainer?.visible,
      });

      EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_HEALTH_UPDATED, this.updateHealthInHud, this);
      EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_POWER_UPDATED, this.updatePowerInHud, this);
      EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_PROGRESS_UPDATED, this.updateProgressInHud, this);
      EVENT_BUS.off(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
      EVENT_BUS.off(CUSTOM_EVENTS.SHOW_PROGRESSION_HELP, this.showProgressionHelp, this);
    });
  }

  #resetSceneState(): void {
    this.#progressionHelpCloseAction = 'close';
    this.#selectedMenuOptionIndex = 0;
    this.#selectedSaveOptionIndex = 0;
    this.#uiMode = UiMode.HudOnly;
  }

  public async updateHealthInHud(data: PlayerHealthUpdated): Promise<void> {
    if (data.type === PLAYER_UPDATE_TYPE.INCREASE) {
      this.#syncMeter(this.#hearts, DataManager.instance.data.maxHealth, data.currentHealth);
      return;
    }

    const healthDifference = data.previousHealth - data.currentHealth;
    let health = data.previousHealth;
    for (let index = 0; index < healthDifference; index += 1) {
      const heartIndex = Math.round(health / 2) - 1;
      const isHalfHeart = health % 2 === 1;
      let animationName = 'JJK_LOOSE_SECOND_HALF';
      if (!isHalfHeart) {
        animationName = 'JJK_LOOSE_FIRST_HALF';
      }
      await new Promise((resolve) => {
        this.#hearts[heartIndex].play(animationName);
        this.#hearts[heartIndex].once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationName, () => {
          resolve(undefined);
        });
      });
      health -= 1;
    }
    this.#syncMeter(this.#hearts, DataManager.instance.data.maxHealth, data.currentHealth);
  }

  public updatePowerInHud(data: PlayerPowerUpdated): void {
    this.#syncMeter(this.#power, DataManager.instance.data.maxPower, data.currentPower+2);
  }

  public updateProgressInHud(data: PlayerProgressUpdated): void {
    this.#syncMeter(this.#progress, DataManager.instance.data.maxProgress, data.currentProgress);
  }

  public showDialog(dialog: DialogPayload): void {
    this.#uiMode = UiMode.ChestDialog;
    this.#selectedMenuOptionIndex = 0;
    this.#selectedSaveOptionIndex = 0;
    this.#activeDialogOptionCount = dialog.options.length;
    this.#dialogContainer.visible = true;
    this.#dialogContainerText.setText(dialog.heading);
    this.#dialogOptions.forEach((option, index) => {
      option.setText(dialog.options[index] ?? '');
      option.visible = index < dialog.options.length;
    });
    this.#updateDialogCursor();
  }

  public showProgressionHelp(payload: ProgressionHelpPayload): void {
    console.debug('[UiScene] showProgressionHelp', {
      payload,
      previousMode: this.#getUiModeName(),
      progressionHelpVisible: this.#progressionHelpContainer.visible,
      saveDialogVisible: this.#saveDialogContainer.visible,
      dialogVisible: this.#dialogContainer.visible,
    });

    this.#uiMode = UiMode.ProgressionHelpDialog;
    this.#progressionHelpCloseAction = payload.closeAction ?? 'close';
    this.#saveDialogContainer.visible = false;
    this.#dialogContainer.visible = false;
    this.#progressionHelpText.setText(getText(payload.textKey));
    this.#progressionHelpContainer.visible = true;
    console.debug('[UiScene] progression help visible', {
      mode: this.#getUiModeName(),
      closeAction: this.#progressionHelpCloseAction,
    });
  }

  public update(): void {
    if (this.#controls.isEscapeKeyJustDown) {
      if (this.#uiMode === UiMode.HudOnly) {
        this.#openSaveDialog();
      }
      return;
    }

    if (this.#controls.isEnterKeyJustDown) {
      this.#confirmSelectedOption();
      return;
    }

    if (this.#controls.isUpJustDown) {
      this.#moveSelection(-1);
      return;
    }

    if (this.#controls.isDownJustDown) {
      this.#moveSelection(1);
    }
  }

  public getSelectedDialogOption(): number {
    return this.#selectedMenuOptionIndex;
  }

  #createHud(): void {
    const playerData = DataManager.instance.data;

    this.#hudContainer = this.add.container(0, 0, []);
    this.#hearts = this.#createMeter({
      currentValue: playerData.currentHealth,
      maxValue: playerData.maxHealth,
      startX: HUD_HEALTH_X,
      textureKey: 'hearts16',
    });
    this.#power = this.#createMeter({
      currentValue: playerData.currentPower,
      maxValue: playerData.maxPower,
      startX: HUD_POWER_X,
      textureKey: 'power16',
      horizontalSpacing: 2,
    });
    this.#progress = this.#createMeter({
      currentValue: playerData.currentProgress,
      maxValue: playerData.maxProgress,
      startX: HUD_PROGRESS_X,
      textureKey: 'progress16',
    });

    this.#hudContainer.add(this.#hearts);
    this.#hudContainer.add(this.#power);
    this.#hudContainer.add(this.#progress);
  }

  #createMeter(config: HudMeterConfig): Phaser.GameObjects.Sprite[] {
    const meter: Phaser.GameObjects.Sprite[] = [];
    for (let index = 0; index < HUD_METER_SPRITE_COUNT; index += 1) {
      const position = this.#getMeterSpritePosition(config.startX, index, config.horizontalSpacing);
      const frame = this.#getMeterFrame(index, config.maxValue, config.currentValue);
      meter.push(this.add.sprite(position.x, position.y, config.textureKey, frame).setOrigin(0));
    }
    return meter;
  }

  #syncMeter(meter: Phaser.GameObjects.Sprite[], maxValue: number, currentValue: number): void {
    meter.forEach((sprite, index) => {
      sprite.setFrame(this.#getMeterFrame(index, maxValue, currentValue));
    });
  }

  #getMeterFrame(index: number, maxValue: number, currentValue: number): number {
    const numberOfSlots = Math.floor(maxValue / 2);
    const numberOfFullSlots = Math.floor(currentValue / 2);
    const hasHalfSlot = currentValue % 2 === 1;

    if (index < numberOfFullSlots) {
      return HUD_FULL_FRAME;
    }
    if (hasHalfSlot && index === numberOfFullSlots) {
      return HUD_FULL_FRAME;
    }
    if (index < numberOfSlots) {
      return HUD_EMPTY_FRAME;
    }
    return HUD_NONE_FRAME;
  }

  #getMeterSpritePosition(startX: number, index: number, horizontalSpacing: number = 0): { x: number; y: number } {
    const column = index % HUD_ROW_LENGTH;
    const row = Math.floor(index / HUD_ROW_LENGTH);
    return {
      x: startX + (HUD_ICON_SIZE + horizontalSpacing) * column,
      y: row === 0 ? HUD_FIRST_ROW_Y : HUD_SECOND_ROW_Y,
    };
  }

  #createDialog(): void {
    this.#dialogContainer = this.add.container(DIALOG_X, DIALOG_Y, [
      this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0).setDisplaySize(DIALOG_WIDTH, DIALOG_HEIGHT),
    ]);
    this.#dialogContainerText = this.add.text(DIALOG_HEADING_X, DIALOG_HEADING_Y, '', DEFAULT_UI_HEADING_STYLE).setOrigin(0);
    this.#dialogContainer.add(this.#dialogContainerText);

    this.#dialogOptions = [0, 1, 2].map((index) => {
      const option = this.add.text(
        DIALOG_OPTION_X,
        DIALOG_FIRST_OPTION_Y + index * DIALOG_OPTION_SPACING,
        '',
        DEFAULT_UI_OPTION_STYLE,
      ).setOrigin(0);
      this.#dialogContainer.add(option);
      return option;
    });

    this.#cursorGameObject = this.add.image(DIALOG_CURSOR_X, DIALOG_FIRST_OPTION_Y, ASSET_KEYS.UI_CURSOR, 0)
      .setOrigin(0)
      .setDisplaySize(DIALOG_CURSOR_SIZE, DIALOG_CURSOR_SIZE);
    this.#dialogContainer.add(this.#cursorGameObject);
    this.#dialogContainer.visible = false;
    this.#activeDialogOptionCount = 0;
  }

  #createSaveDialog(): void {
    this.#saveDialogContainer = this.add.container(DIALOG_X, SAVE_DIALOG_Y, [
      this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0).setDisplaySize(DIALOG_WIDTH, DIALOG_HEIGHT),
    ]);
    [
      getText('ui.save.backToMainMenu'),
      getText('ui.save.save'),
      getText('ui.save.continuePlaying'),
    ].forEach((text, index) => {
      const option = this.add.text(
        SAVE_DIALOG_OPTION_X,
        DIALOG_FIRST_OPTION_Y + index * DIALOG_OPTION_SPACING,
        text,
        DEFAULT_UI_OPTION_STYLE,
      ).setOrigin(0);
      this.#saveDialogContainer.add(option);
    });

    this.#saveDialogCursorGameObject = this.add.image(SAVE_DIALOG_CURSOR_X, DIALOG_FIRST_OPTION_Y, ASSET_KEYS.UI_CURSOR, 0)
      .setOrigin(0)
      .setDisplaySize(DIALOG_CURSOR_SIZE, DIALOG_CURSOR_SIZE);
    this.#saveDialogContainer.add(this.#saveDialogCursorGameObject);
    this.#saveDialogContainer.visible = false;
  }

  #createProgressionHelpDialog(): void {
    this.#progressionHelpContainer = this.add.container(DIALOG_X, DIALOG_Y, [
      this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0).setDisplaySize(DIALOG_WIDTH, DIALOG_HEIGHT),
    ]);
    this.#progressionHelpText = this.add.text(
      PROGRESSION_HELP_MESSAGE_X,
      PROGRESSION_HELP_MESSAGE_Y,
      '',
      DEFAULT_UI_HEADING_STYLE,
    ).setOrigin(0);
    this.#progressionHelpContainer.add(this.#progressionHelpText);

    const continueOption = this.add.text(
      PROGRESSION_HELP_OPTION_X,
      PROGRESSION_HELP_OPTION_Y,
      getText('ui.progression.continue'),
      DEFAULT_UI_OPTION_STYLE,
    ).setOrigin(0);
    this.#progressionHelpContainer.add(continueOption);

    const cursor = this.add.image(PROGRESSION_HELP_CURSOR_X, PROGRESSION_HELP_OPTION_Y, ASSET_KEYS.UI_CURSOR, 0)
      .setOrigin(0)
      .setDisplaySize(DIALOG_CURSOR_SIZE, DIALOG_CURSOR_SIZE);
    this.#progressionHelpContainer.add(cursor);
    this.#progressionHelpContainer.visible = false;
  }

  #openSaveDialog(): void {
    if (this.#uiMode === UiMode.ChestDialog) {
      return;
    }
    console.debug('Escape key just down, opening escape and save dialog');
    this.#selectedSaveOptionIndex = 0;
    this.#saveDialogContainer.visible = true;
    this.#uiMode = UiMode.SaveDialog;
    this.#updateSaveDialogCursor();
  }

  #confirmSelectedOption(): void {
    console.debug('[UiScene] confirm selected option', {
      mode: this.#getUiModeName(),
      selectedMenuOptionIndex: this.#selectedMenuOptionIndex,
      selectedSaveOptionIndex: this.#selectedSaveOptionIndex,
      progressionHelpCloseAction: this.#progressionHelpCloseAction,
    });

    if (this.#uiMode === UiMode.ChestDialog) {
      const playerData = DataManager.instance.data;
      playerData.lastDialogOptionSelected = this.#selectedMenuOptionIndex;
      DataManager.instance.data = playerData;
      this.#dialogContainer.visible = false;
      EVENT_BUS.emit(CUSTOM_EVENTS.DIALOG_CLOSED);
      this.#uiMode = UiMode.HudOnly;
      return;
    }

    if (this.#uiMode === UiMode.SaveDialog) {
      if (this.#selectedSaveOptionIndex === 0) {
        this.scene.stop(SCENE_KEYS.GAME_SCENE);
        this.scene.start(SCENE_KEYS.INTRO);
        this.scene.stop(SCENE_KEYS.UI_SCENE);
        return;
      } else if (this.#selectedSaveOptionIndex === 2) {
        this.#saveDialogContainer.visible = false;
        this.#uiMode = UiMode.HudOnly;
      }
    }

    if (this.#uiMode === UiMode.ProgressionHelpDialog) {
      const closeAction = this.#progressionHelpCloseAction;
      const closedPayload: ProgressionHelpClosed = { closeAction };
      console.debug('[UiScene] closing progression help', closedPayload);
      this.#progressionHelpContainer.visible = false;
      this.#progressionHelpCloseAction = 'close';
      this.#uiMode = UiMode.HudOnly;
      EVENT_BUS.emit(CUSTOM_EVENTS.PROGRESSION_HELP_CLOSED, closedPayload);
    }
  }

  #getUiModeName(): string {
    switch (this.#uiMode) {
      case UiMode.HudOnly: return 'HudOnly';
      case UiMode.ChestDialog: return 'ChestDialog';
      case UiMode.SaveDialog: return 'SaveDialog';
      case UiMode.ProgressionHelpDialog: return 'ProgressionHelpDialog';
    }
  }

  #moveSelection(direction: number): void {
    if (this.#uiMode === UiMode.ChestDialog) {
      this.#selectedMenuOptionIndex = Phaser.Math.Clamp(
        this.#selectedMenuOptionIndex + direction,
        0,
        Math.max(this.#activeDialogOptionCount - 1, 0),
      );
      this.#updateDialogCursor();
    } else if (this.#uiMode === UiMode.SaveDialog) {
      this.#selectedSaveOptionIndex = Phaser.Math.Clamp(
        this.#selectedSaveOptionIndex + direction,
        0,
        SAVE_DIALOG_OPTION_COUNT - 1,
      );
      this.#updateSaveDialogCursor();
    }
  }

  #updateDialogCursor(): void {
    this.#cursorGameObject.setY(DIALOG_FIRST_OPTION_Y + this.#selectedMenuOptionIndex * DIALOG_OPTION_SPACING);
  }

  #updateSaveDialogCursor(): void {
    this.#saveDialogCursorGameObject.setY(DIALOG_FIRST_OPTION_Y + this.#selectedSaveOptionIndex * DIALOG_OPTION_SPACING);
  }
}