import * as Phaser from 'phaser';
import { logChestDebug } from '../../common/chest-debug';
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
    logChestDebug('constructed', this.debugInfo);

    // add components
    new InteractiveObjectComponent(
      this,
      INTERACTIVE_OBJECT_TYPE.OPEN,
      () => {
        const canOpen = this.canOpen;
        logChestDebug('can interact check', { ...this.debugInfo, canOpen });
        return canOpen;
      },
      () => {
        logChestDebug('interactive callback invoked', this.debugInfo);
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

  get debugInfo(): Record<string, unknown> {
    return {
      id: this.#id,
      state: this.#state,
      canOpen: this.canOpen,
      now: this.scene.time.now,
      nextOpenAt: this.#nextOpenAt,
      cooldownRemainingMs: Math.max(0, this.#nextOpenAt - this.scene.time.now),
      active: this.active,
      visible: this.visible,
      position: { x: this.x, y: this.y },
      contents: { ...this.#contents },
    };
  }

  public open(): boolean {
    logChestDebug('open requested', this.debugInfo);
    if (!this.canOpen) {
      logChestDebug('open blocked', this.debugInfo);
      return false;
    }

    this.#state = CHEST_STATE.OPEN;
    this.setFrame((this.#id-1)*2+1);
    logChestDebug('opened', this.debugInfo);
    return true;

  }

  public close(): void {
    logChestDebug('close requested', this.debugInfo);
    if (this.#state !== CHEST_STATE.OPEN) {
      logChestDebug('close ignored because chest is not open', this.debugInfo);
      return;
    }

    this.#state = CHEST_STATE.REVEALED;
    this.setFrame((this.#id-1)*2);
    this.#nextOpenAt = this.scene.time.now + CHEST_OPEN_CLOSE_DELAY_MS;
    logChestDebug('closed and cooldown started', this.debugInfo);
  }

  public disableObject(): void {
    logChestDebug('disable requested', this.debugInfo);
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    // make not visible until player re-enters room
    this.active = false;
    this.visible = false;
    logChestDebug('disabled', this.debugInfo);
  }

  public enableObject(): void {
    logChestDebug('enable requested', this.debugInfo);
    if (this.#state === CHEST_STATE.HIDDEN) {
      logChestDebug('enable ignored because chest is hidden', this.debugInfo);
      return;
    }

    // enable body on game object so we trigger the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    // make visible to the player
    this.active = true;
    this.visible = true;
    logChestDebug('enabled', this.debugInfo);
  }

  public reveal(): void {
    logChestDebug('reveal requested', this.debugInfo);
    if (this.#state !== CHEST_STATE.HIDDEN) {
      logChestDebug('reveal ignored because chest is not hidden', this.debugInfo);
      return;
    }
    this.#state = CHEST_STATE.REVEALED;
    this.enableObject();
    logChestDebug('revealed', this.debugInfo);
  }
}
