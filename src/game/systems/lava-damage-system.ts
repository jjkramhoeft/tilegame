import { BIOME, DIRECTION } from '../common/common';
import { PLAYER_LAVA_DAMAGE } from '../common/config';
import { Direction } from '../common/types';
import { CHARACTER_STATES } from '../components/state-machine/states/character/character-states';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { Earth } from '../ground/earth';

// Works on any CharacterGameObject (player or companion); behaviour is unchanged
// for the player. Uses the base `stateMachine` rather than the Player-only
// `currentState` getter so it can be reused.
export function updateLavaDamageLogic(character: CharacterGameObject, earth: Earth): void {
    const currentState = character.stateMachine.currentStateName;
    if (currentState === CHARACTER_STATES.FALLING_STATE || currentState === CHARACTER_STATES.DEATH_STATE) {
        return;
    }

    const tilePosition = earth.getTileXYFromScreenCoordinates(character.x, character.y, true);
    const tile = earth.getTile(tilePosition.x, tilePosition.y);

    if (tile === undefined || tile.biome !== BIOME.LAVA) {
        return;
    }

    character.hit(getLavaPushBackDirection(character), PLAYER_LAVA_DAMAGE);
}

function getLavaPushBackDirection(character: CharacterGameObject): Direction {
    const lastMoveDirections = character.getLastMoveDirections();
    const lastMoveDirection = lastMoveDirections[lastMoveDirections.length - 1] ?? character.direction;

    switch (lastMoveDirection) {
        case DIRECTION.DOWN:
            return DIRECTION.UP;
        case DIRECTION.UP:
            return DIRECTION.DOWN;
        case DIRECTION.LEFT:
            return DIRECTION.RIGHT;
        case DIRECTION.RIGHT:
            return DIRECTION.LEFT;
    }
}