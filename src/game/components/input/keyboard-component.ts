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

  #castKey: Phaser.Input.Keyboard.Key;
  #altCastKey: Phaser.Input.Keyboard.Key;

  #enterKey: Phaser.Input.Keyboard.Key;

  #escapeKey: Phaser.Input.Keyboard.Key;

  #mapKey: Phaser.Input.Keyboard.Key;

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

    this.#castKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.#altCastKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    
    this.#escapeKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.#mapKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    // Primary keys
    // Arrow keys for movement, 
    // z for attack key, x for action key, c for cast key, m for map key
    // Layout:
    //                    ^
    // z x c      m     < v >

    // Alternative keys
    // wasd for movement, 
    // r for attack key, enter for action key, t for cast key, m for map key
    // Layout:
    //   w    r t    enter
    // a s d       m
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
  get isLeftJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.left) || Phaser.Input.Keyboard.JustDown(this.#altLeftKey);
  }

  get isRightDown(): boolean {
    return this.#cursorKeys.right.isDown || this.#altRightKey.isDown;
  }
  get isRightJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.right) || Phaser.Input.Keyboard.JustDown(this.#altRightKey);
  }

  get isActionKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#actionKey) || Phaser.Input.Keyboard.JustDown(this.#enterKey);
  }

  get isAttackKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#attackKey) || Phaser.Input.Keyboard.JustDown(this.#altAttackKey);
  }

  get isEscapeKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#escapeKey);
  }

  get isMapKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#mapKey);
  }  

  get isCastKeyDown(): boolean {
    return this.#castKey.isDown || this.#altCastKey.isDown;
  }
  get isCastKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#castKey) || Phaser.Input.Keyboard.JustDown(this.#altCastKey); 
  }
}
