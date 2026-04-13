import * as Phaser from 'phaser';
import { GameObject2, InteractiveObjectType } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class InteractiveObjectComponent extends BaseGameObjectComponent {
  #objectType: InteractiveObjectType;
  #callback: () => void;
  #canInteractCheck: () => boolean;

  constructor(
    gameObject2: GameObject2,
    objectType: InteractiveObjectType,
    canInteractCheck = () => true,
    callback = () => undefined,
  ) {
    super(gameObject2);
    this.#objectType = objectType;
    this.#callback = callback;
    this.#canInteractCheck = canInteractCheck;
  }

  get objectType(): InteractiveObjectType {
    return this.#objectType;
  }

  public interact(): void {
    this.#callback();
  }

  public canInteractWith(): boolean {
    return this.#canInteractCheck();
  }
}
