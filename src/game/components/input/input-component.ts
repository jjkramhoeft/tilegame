export class InputComponent {
  #up: boolean;
  #down: boolean;
  #left: boolean;
  #right: boolean;
  #actionKey: boolean;
  #attackKey: boolean;
  #castKey: boolean;
  #isMovementLocked: boolean;

  constructor() {
    this.#up = false;
    this.#left = false;
    this.#right = false;
    this.#down = false;
    this.#actionKey = false;
    this.#attackKey = false;
    this.#castKey = false;
    this.#isMovementLocked = false;
  }

  // lock
  get isMovementLocked(): boolean {
    return this.#isMovementLocked;
  }
  set isMovementLocked(val: boolean) {
    this.#isMovementLocked = val;
  }

  // Up
  get isUpDown(): boolean {
    return this.#up;
  }
  get isUpJustDown(): boolean {
    return this.#up;
  }
  set isUpDown(val: boolean) {
    this.#up = val;
  }

  // Down
  get isDownDown(): boolean {
    return this.#down;
  }
  get isDownJustDown(): boolean {
    return this.#down;
  }
  set isDownDown(val: boolean) {
    this.#down = val;
  }

  // Left
  get isLeftDown(): boolean {
    return this.#left;
  }
  set isLeftDown(val: boolean) {
    this.#left = val;
  }

  // Right
  get isRightDown(): boolean {
    return this.#right;
  }
  set isRightDown(val: boolean) {
    this.#right = val;
  }

  // Action 
  get isActionKeyJustDown(): boolean {
    return this.#actionKey;
  }
  set isActionKeyJustDown(val: boolean) {
    this.#actionKey = val;
  }

  // Attack
  get isAttackKeyJustDown(): boolean {
    return this.#attackKey;
  }
  set isAttackKeyJustDown(val: boolean) {
    this.#attackKey = val;
  }

  // Cast
  get isCastKeyJustDown(): boolean {
    return this.#castKey;
  }
  set isCastKeyJustDown(val: boolean) {
    this.#castKey = val;
  }

  public reset(): void {
    this.#down = false;
    this.#up = false;
    this.#left = false;
    this.#right = false;
    this.#attackKey = false;
    this.#actionKey = false;
    this.#castKey = false;
    this.#isMovementLocked = false;
  }
}
