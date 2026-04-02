import * as Phaser from 'phaser';
import { InputComponent } from './input-component';

export class KeyboardComponent extends InputComponent {
  #cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  #altUpKey: Phaser.Input.Keyboard.Key;
  #altLeftKey: Phaser.Input.Keyboard.Key;
  #altRightKey: Phaser.Input.Keyboard.Key;
  #altDownKey: Phaser.Input.Keyboard.Key;

  #attackKey: Phaser.Input.Keyboard.Key;
  #altAttackKey: Phaser.Input.Keyboard.Key;

  #actionKey: Phaser.Input.Keyboard.Key;
  #enterKey: Phaser.Input.Keyboard.Key;

  constructor(keyboardPlugin: Phaser.Input.Keyboard.KeyboardPlugin) {
    super();
    this.#cursorKeys = keyboardPlugin.createCursorKeys();
    this.#altUpKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.#altLeftKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.#altRightKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.#altDownKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    this.#attackKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.#altAttackKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.#actionKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.#enterKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    // wasd as alternative to arrow keys for movement, R for cast spell/ability as alternative attack key
    // z = B, Attack
    // x = A, Talk, Run, Lift/Throw, Push/Pull
    // shift = Select, Open Save Menu
    // return/enter = Start, Open Inventory
  }

  get isUpDown(): boolean {
    return this.#cursorKeys.up.isDown || this.#altUpKey.isDown;
  }
  get isUpJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.up) || Phaser.Input.Keyboard.JustDown(this.#altUpKey);
  }

  get isDownDown(): boolean {
    return this.#cursorKeys.down.isDown || this.#altDownKey.isDown;
  }
  get isDownJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.down) || Phaser.Input.Keyboard.JustDown(this.#altDownKey);
  }

  get isLeftDown(): boolean {
    return this.#cursorKeys.left.isDown || this.#altLeftKey.isDown;
  }
  get isRightDown(): boolean {
    return this.#cursorKeys.right.isDown || this.#altRightKey.isDown;
  }
  get isActionKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#actionKey);
  }

  get isAttackKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#attackKey) || Phaser.Input.Keyboard.JustDown(this.#altAttackKey);
  }

  get isSelectKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift);
  }

  get isEnterKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#enterKey);
  }
}
