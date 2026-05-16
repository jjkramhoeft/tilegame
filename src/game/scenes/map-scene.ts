import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { DEFAULT_UI_HEADING_STYLE } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';

const MAP_WIDTH = 1024;
const MAP_HEIGHT = 768;

export class MapScene extends Phaser.Scene {
  #controls!: KeyboardComponent;

  constructor() {
    super({ key: SCENE_KEYS.MAP_SCENE });
  }

  public create(): void {
    this.add
      .image(0, 0, ASSET_KEYS.MAP_BACKGROUND)
      .setOrigin(0)
      .setDisplaySize(MAP_WIDTH, MAP_HEIGHT);

    this.add
      .text(MAP_WIDTH / 2, MAP_HEIGHT - 60, "Press 'x' to return", DEFAULT_UI_HEADING_STYLE)
      .setOrigin(0.5);

    if (!this.input.keyboard) {
      console.warn('[MapScene] keyboard plugin missing');
      return;
    }
    this.#controls = new KeyboardComponent(this.input.keyboard);
  }

  public update(): void {
    if (!this.#controls) {
      return;
    }
    if (this.#controls.isActionKeyJustDown) {
      this.#closeMap();
    }
  }

  #closeMap(): void {
    this.scene.wake(SCENE_KEYS.UI_SCENE);
    this.scene.resume(SCENE_KEYS.GAME_SCENE);
    this.scene.stop();
  }
}
