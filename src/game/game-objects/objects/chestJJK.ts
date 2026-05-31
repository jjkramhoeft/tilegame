import * as Phaser from 'phaser';
import { CHEST_STATE, INTERACTIVE_OBJECT_TYPE } from '../../common/common';
import { CHEST_OPEN_CLOSE_DELAY_MS } from '../../common/config';
import type { Gear, Potion, Weapon } from '../../common/common';
import { ChestState, CustomGameObject, Position } from '../../common/types';
import { InteractiveObjectComponent } from '../../components/game-object/interactive-object-component';


export type ChestJJKConfig = {
  worldPosition: Position;
  tilePosition: Position;
  id: number;
  contents: ChestReward;
}

export type ChestReward = {
  gear: Gear;
  weapon: Weapon;
  potion: Potion;
}

export class ChestJJK extends Phaser.Physics.Arcade.Image implements CustomGameObject {
  #state: ChestState;
  #id: number;
  #contents: ChestReward;
  #nextOpenAt = 0;

  constructor(scene: Phaser.Scene, config: ChestJJKConfig, chestState: ChestState) {
    super(scene, config.worldPosition.x, config.worldPosition.y, 'containers', (config.id-1) * 2);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    this.#state = chestState;
    this.#id = config.id;
    this.#contents = config.contents;

    // add components
    new InteractiveObjectComponent(
      this,
      INTERACTIVE_OBJECT_TYPE.OPEN,
      () => this.canOpen,
      () => {
        this.open();
      },
    );

    // if chest is already revealed, enable it immediately
    if (this.#state === CHEST_STATE.REVEALED) {
      this.enableObject();
    }
  }

  get id(): number {
    return this.#id;
  }

  get contents(): ChestReward {
    return this.#contents;
  }

  get canOpen(): boolean {
    return this.#state === CHEST_STATE.REVEALED && this.scene.time.now >= this.#nextOpenAt;
  }

  public open(): boolean {
    if (!this.canOpen) {
      return false;
    }

    this.#state = CHEST_STATE.OPEN;
    this.setFrame((this.#id-1)*2+1);
    return true;

  }

  public close(): void {
    if (this.#state !== CHEST_STATE.OPEN) {
      return;
    }

    this.#state = CHEST_STATE.REVEALED;
    this.setFrame((this.#id-1)*2);
    this.#nextOpenAt = this.scene.time.now + CHEST_OPEN_CLOSE_DELAY_MS;
  }

  public disableObject(): void {
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    // make not visible until player re-enters room
    this.active = false;
    this.visible = false;
  }

  public enableObject(): void {
    if (this.#state === CHEST_STATE.HIDDEN) {
      return;
    }

    // enable body on game object so we trigger the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    // make visible to the player
    this.active = true;
    this.visible = true;
  }

  public reveal(): void {
    if (this.#state !== CHEST_STATE.HIDDEN) {
      return;
    }
    this.#state = CHEST_STATE.REVEALED;
    this.enableObject();
  }
}
