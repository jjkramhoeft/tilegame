import { PLAYER_CHEST_INTERACTION_RANGE } from '../../../../common/config';
import { findNearestOpenInteractiveObject } from '../../../../common/interaction-utility';
import { GameObject2 } from '../../../../common/types';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { ChestJJK } from '../../../../game-objects/objects/chestJJK';
import { StateMachine } from '../../state-machine';
import { CHARACTER_STATES } from './character-states';

type SceneWithChests = {
  chestArray?: ChestJJK[];
};

export function tryOpenNearestChest(gameObject: CharacterGameObject, stateMachine: StateMachine): boolean {
  const chests = (gameObject.scene as unknown as SceneWithChests).chestArray;
  if (chests === undefined || chests.length === 0) {
    return false;
  }

  const nearestChest = findNearestOpenInteractiveObject(
    gameObject,
    chests as GameObject2[],
    PLAYER_CHEST_INTERACTION_RANGE,
  );
  if (nearestChest === undefined) {
    return false;
  }

  stateMachine.setState(CHARACTER_STATES.OPEN_CHEST_STATE, nearestChest);
  return true;
}