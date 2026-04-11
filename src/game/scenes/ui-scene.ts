import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, HEART_ANIMATIONS, HEART_TEXTURE_FRAME } from '../common/assets';
import { DataManager } from '../common/data-manager';
import { CUSTOM_EVENTS, EVENT_BUS, PLAYER_HEALTH_UPDATE_TYPE, PlayerHealthUpdated } from '../common/event-bus';
import { DEFAULT_UI_HEADING_STYLE, DEFAULT_UI_OPTION_STYLE, DEFAULT_UI_TEXT_STYLE } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';

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
      let x = 157 + 8 * i;
      let y = 25;
      if (i >= 10) {
        x = 157 + 8 * (i - 10);
        y = 33;
      }
      let frame: string = HEART_TEXTURE_FRAME.NONE;
      if (i < numberOfFullHearts) {
        frame = HEART_TEXTURE_FRAME.FULL;
      } else if (i < numberOfHearts) {
        frame = HEART_TEXTURE_FRAME.EMPTY;
      }
      if (hasHalfHeart && i === numberOfFullHearts) {
        frame = HEART_TEXTURE_FRAME.HALF;
      }
      this.#hearts.push(this.add.sprite(x, y, ASSET_KEYS.HUD_NUMBERS, frame).setOrigin(0));
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
      let animationName = HEART_ANIMATIONS.LOSE_LAST_HALF;
      if (!isHalfHeart) {
        animationName = HEART_ANIMATIONS.LOSE_FIRST_HALF;
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
}
