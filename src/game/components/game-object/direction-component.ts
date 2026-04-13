import { DIRECTION } from '../../common/common';
import { Direction, GameObject2 } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class DirectionComponent extends BaseGameObjectComponent {
  #direction: Direction;
  #callback: (direction: Direction) => void;

  constructor(gameObject2: GameObject2, onDirectionCallback = () => undefined) {
    super(gameObject2);
    this.#direction = DIRECTION.DOWN;
    this.#callback = onDirectionCallback;
  }

  get direction(): Direction {
    return this.#direction;
  }

  set direction(direction: Direction) {
    this.#direction = direction;
    this.#callback(this.#direction);
  }

  set callback(callback: (direction: Direction) => void) {
    this.#callback = callback;
  }
}
