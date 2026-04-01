import { GameObject2 } from '../../common/types';
import { InputComponent } from '../input/input-component';
import { BaseGameObjectComponent } from './base-game-object-component';

export class ControlsComponent extends BaseGameObjectComponent {
  #inputComponent: InputComponent;

  constructor(gameObject2: GameObject2, inputComponent: InputComponent) {
    super(gameObject2);
    this.#inputComponent = inputComponent;
  }

  get controls(): InputComponent {
    return this.#inputComponent;
  }
}
