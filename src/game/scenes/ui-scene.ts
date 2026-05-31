import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { GameDataManager } from '../common/game-data-manager';
import {
  CUSTOM_EVENTS,
  EVENT_BUS,
  PLAYER_UPDATE_TYPE,
  registerEventBusListenersUntilShutdown,
  type LivingCreaturesUpdated,
  type ProgressionHelpCloseAction as NarratorDialogCloseAction,
  type ProgressionHelpClosed as NarratorDialogClosed,
  type ProgressionHelpPayload as NarratorDialogPayload,
  type PlayerHealthUpdated,
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
const NARRATOR_DIALOG_OPTION_X = 185;
const NARRATOR_DIALOG_CURSOR_X = 165;
const DIALOG_FIRST_OPTION_Y = 85;
const NARRATOR_DIALOG_MESSAGE_X = 75;
const NARRATOR_DIALOG_MESSAGE_Y = 45;
const NARRATOR_DIALOG_OPTION_Y = 180;
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
  NarratorDialog,
}

export class UiScene extends Phaser.Scene {
  #hudContainer!: Phaser.GameObjects.Container;
  #hearts!: Phaser.GameObjects.Sprite[];
  #power!: Phaser.GameObjects.Sprite[];
  #progress!: Phaser.GameObjects.Sprite[];

  #saveDialogContainer!: Phaser.GameObjects.Container;
  #saveDialogCursorGameObject!: Phaser.GameObjects.Image;

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
  #selectedSaveOptionIndex!: number;
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
      console.debug('[UiScene] create start', {
        isDebugMode: GameDataManager.instance.data.isDebugMode,
        initialMode: this.#getUiModeName(),
      });
    }

    if (!this.input.keyboard) {
      console.warn('[UiScene] keyboard plugin is not setup properly');
      return;
    }

    this.#createHud();
    this.#createChestDialog();
    this.#createSaveDialog();
    this.#createNarratorDialog();

    this.#controls = new KeyboardComponent(this.input.keyboard);
    this.#selectedMenuOptionIndex = 0;
    this.#selectedSaveOptionIndex = 0;
    this.#chestOpenSound = this.sound.add(ASSET_KEYS.CHEST);
    this.#chestCloseSound = this.sound.add(ASSET_KEYS.CHEST_2);
    this.#levelUpSound = this.sound.add(ASSET_KEYS.LEVELUP, { volume: 1.0 });
    this.#uiDownSound = this.sound.add(ASSET_KEYS.MENU_006);
    this.#uiUpSound = this.sound.add(ASSET_KEYS.MENU_024);
    this.#uiSelectSound = this.sound.add(ASSET_KEYS.BLIP_SELECT_7);
    this.#narratorSound = this.sound.add(ASSET_KEYS.SUCCESS_1);

    registerEventBusListenersUntilShutdown(this, [
      { event: CUSTOM_EVENTS.PLAYER_HEALTH_UPDATED, listener: this.updateHealthInHud, context: this },
      { event: CUSTOM_EVENTS.PLAYER_POWER_UPDATED, listener: this.updatePowerInHud, context: this },
      { event: CUSTOM_EVENTS.LIVING_CREATURES_UPDATED, listener: this.updateLivingCreaturesInHud, context: this },
      { event: CUSTOM_EVENTS.SHOW_HEALTH_HUD, listener: this.showHealthHud, context: this },
      { event: CUSTOM_EVENTS.SHOW_POWER_HUD, listener: this.showPowerHud, context: this },
      { event: CUSTOM_EVENTS.SHOW_PROGRESS_HUD, listener: this.showProgressHud, context: this },
      { event: CUSTOM_EVENTS.SHOW_CHEST_DIALOG, listener: this.showDialog, context: this },
      { event: CUSTOM_EVENTS.SHOW_NARRATOR_DIALOG, listener: this.showNarratorDialog, context: this },
    ]);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (ENABLE_LOGGING) {
        console.debug('[UiScene] shutdown cleanup', {
          mode: this.#getUiModeName(),
          narratorDialogVisible: this.#narratorDialogContainer?.visible,
          saveDialogVisible: this.#saveDialogContainer?.visible,
          dialogVisible: this.#chestDialogContainer?.visible,
        });
      }

    });
  }

  #resetSceneState(): void {
    this.#narratorDialogCloseAction = 'close';
    this.#selectedMenuOptionIndex = 0;
    this.#selectedSaveOptionIndex = 0;
    this.#uiMode = UiMode.HudOnly;
  }

  public async updateHealthInHud(data: PlayerHealthUpdated): Promise<void> {
    if (data.type === PLAYER_UPDATE_TYPE.INCREASE) {
      this.#syncMeter(this.#hearts, GameDataManager.instance.data.maxHealth, data.currentHealth);
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
    this.#syncMeter(this.#hearts, GameDataManager.instance.data.maxHealth, data.currentHealth);
  }

  public updatePowerInHud(data: PlayerPowerUpdated): void {
    this.#syncMeter(this.#power, GameDataManager.instance.data.maxPower, data.currentPower + 2);
    if (data.type === PLAYER_UPDATE_TYPE.INCREASE && !this.#levelUpSound.isPlaying) {
      this.#levelUpSound.play();
    }
  }

  public updateProgressInHud(data: PlayerProgressUpdated): void {
    this.#syncMeter(this.#progress, GameDataManager.instance.data.maxProgress, data.currentProgress);
  }

  public updateLivingCreaturesInHud(data: LivingCreaturesUpdated): void {
    this.#syncLivingCreaturesMeter(data.currentLivingCreatures, data.maxLivingCreaturesThisGame);
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

  public showDialog(dialog: DialogPayload): void {
    this.#uiMode = UiMode.ChestDialog;
    this.#selectedMenuOptionIndex = 0;
    this.#selectedSaveOptionIndex = 0;
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
    this.#saveDialogContainer.visible = false;
    this.#chestDialogContainer.visible = false;
    this.#narratorDialogText.setText(getText(payload.textKey));
    this.#narratorDialogContainer.visible = true;
    //console.debug('[UiScene] narrator dialog visible', {mode: this.#getUiModeName(), closeAction: this.#narratorDialogCloseAction, });
    if (!this.#narratorSound.isPlaying) {
      this.#narratorSound.play();
    }
  }

  public update(): void {
    if (this.#controls.isEscapeKeyJustDown) {
      if (this.#uiMode === UiMode.HudOnly) {
        this.#openSaveDialog();
      }
      return;
    }

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
      textureKey: ASSET_KEYS.HEARTS_16,
    });
    this.#power = this.#createMeter({
      currentValue: playerData.currentPower,
      maxValue: playerData.maxPower,
      startX: HUD_POWER_X,
      textureKey: ASSET_KEYS.POWER_16,
      horizontalSpacing: 2,
    });
    this.#progress = this.#createMeter({
      currentValue: this.#getLivingCreaturesMeterValue(playerData.currentLivingCreatures),
      maxValue: this.#getLivingCreaturesMeterValue(playerData.maxLivingCreaturesThisGame),
      startX: HUD_PROGRESS_X,
      textureKey: ASSET_KEYS.PROGRESS_16,
    });

    this.#setMeterVisible(this.#hearts, false);
    this.#setMeterVisible(this.#power, false);
    this.#setMeterVisible(this.#progress, false);

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

  #setMeterVisible(meter: Phaser.GameObjects.Sprite[], visible: boolean): void {
    meter.forEach((sprite) => {
      sprite.visible = visible;
    });
  }

  #syncLivingCreaturesMeter(currentLivingCreatures: number, maxLivingCreaturesThisGame: number): void {
    this.#syncMeter(
      this.#progress,
      this.#getLivingCreaturesMeterValue(maxLivingCreaturesThisGame),
      this.#getLivingCreaturesMeterValue(currentLivingCreatures),
    );
  }

  #getLivingCreaturesMeterValue(currentLivingCreatures: number): number {
    return Math.min(currentLivingCreatures, HUD_METER_SPRITE_COUNT) * 2;
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

  #openSaveDialog(): void {
    if (this.#uiMode === UiMode.ChestDialog) {
      return;
    }
    if (ENABLE_LOGGING) { console.debug('Escape key just down, opening escape and save dialog'); }
    this.#selectedSaveOptionIndex = 0;
    this.#saveDialogContainer.visible = true;
    this.#uiMode = UiMode.SaveDialog;
    this.#updateSaveDialogCursor();
  }

  #confirmSelectedOption(): void {/*
    console.debug('[UiScene] confirm selected option', {
      mode: this.#getUiModeName(),
      selectedMenuOptionIndex: this.#selectedMenuOptionIndex,
      selectedSaveOptionIndex: this.#selectedSaveOptionIndex,
      narratorDialogCloseAction: this.#narratorDialogCloseAction,
    });*/

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

    if (this.#uiMode === UiMode.NarratorDialog) {
      const closeAction = this.#narratorDialogCloseAction;
      const closedPayload: NarratorDialogClosed = { closeAction };
      //console.debug('[UiScene] closing narrator dialog', closedPayload);
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
      case UiMode.SaveDialog: return 'SaveDialog';
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