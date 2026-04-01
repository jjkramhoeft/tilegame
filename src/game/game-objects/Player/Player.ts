
import * as Phaser from 'phaser';
import { GameObject, Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';

export type PlayerConfig = {
  scene: Phaser.Scene;
  position: Position;
  controls: InputComponent;
  assetKey: string;
  frame?: string | number
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  #controls: InputComponent;

  constructor(config: PlayerConfig) {
    const { scene, position, assetKey, frame } = config;
    const { x, y } = position;
    super(
      scene,
      x,
      y,
      assetKey,
      frame || 0
    );
    this.#controls = config.controls;

    // enable auto update functionality
    config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    config.scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      },
      this,
    );

    scene.add.existing(this);
    scene.physics.add.existing(this);

  }

  get physicsBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  public update(): void {
    if (this.#controls.isDownDown) {
      this.play({ key: 'male-nude-none-idle-down', repeat: -1 }, true);
    } else if (this.#controls.isUpDown) {
      this.play({ key: 'male-nude-none-idle-up', repeat: -1 }, true);
    }

    if (this.#controls.isRightDown) {
      this.play({ key: 'male-nude-none-idle-right', repeat: -1 }, true);
    } else if (this.#controls.isLeftDown) {
      this.play({ key: 'male-nude-none-idle-left', repeat: -1 }, true);
    }

    //super.update();
    //this.#collidingObjectsComponent.reset();
    //this.#weaponComponent.update();
  }
}