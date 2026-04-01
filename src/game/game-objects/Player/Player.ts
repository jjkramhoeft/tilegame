
import * as Phaser from 'phaser';
import { Position } from '../Common/types';
import { InputComponent } from '../../components/input/input-component';

export type PlayerConfig ={
    scene: Phaser.Scene;    
    position: Position;
    controls: InputComponent;
    assetKey: string;
    frame?: string | number
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(config: PlayerConfig) {
    const {scene, position, assetKey, frame} = config;
    const {x, y} = position;
    super(scene, x, y, assetKey, frame||0);

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  get physicsBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }
}