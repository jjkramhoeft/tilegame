import * as Phaser from 'phaser';
import { CHEST_STATE, INTERACTIVE_OBJECT_TYPE } from '../../common/common';
import { ChestState, CustomGameObject, Position } from '../../common/types';
import { InteractiveObjectComponent } from '../../components/game-object/interactive-object-component';
//import { InventoryManager } from '../../components/inventory/inventory-manager';
//import { DataManager } from '../../common/data-manager';


export type ChestJJKConfig = {
  worldPosition: Position;
  tilePosition: Position;
  id: number;
  contents: ChestReward;
}

export type ChestReward = {
  gear: string;
  weapon: string;
}

export class ChestJJK extends Phaser.Physics.Arcade.Image implements CustomGameObject {
  #state: ChestState;
  #id: number;
  #contents: ChestReward;

  constructor(scene: Phaser.Scene, config: ChestJJKConfig, chestState: ChestState) {
    super(scene, config.worldPosition.x, config.worldPosition.y, 'containers', 0);

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
      () => {
        // JJK chest can always be opened
        return true;
      },
      () => {
        this.open();
      },
    );

    // disable physics body and make game objects inactive/not visible
    //this.disableObject();
  }

  get id(): number {
    return this.#id;
  }

  get contents(): ChestReward {
    return this.#contents;
  }

  public open(): void {
    if (this.#state !== CHEST_STATE.REVEALED) {
      return;
    }

    this.#state = CHEST_STATE.OPEN;
    this.setFrame(1);

  }

  public close(): void {
    if (this.#state !== CHEST_STATE.OPEN) {
      return;
    }

    this.#state = CHEST_STATE.REVEALED;
    this.setFrame(0);
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
