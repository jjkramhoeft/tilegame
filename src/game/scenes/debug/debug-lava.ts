import { BIOME, DIRECTION } from '../../common/common';
import { PLAYER_LAVA_DAMAGE } from '../../common/config';
import { Direction } from '../../common/types';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { Player } from '../../game-objects/player/player';
import { Earth } from '../../ground/earth';

export function updateLavaDamageLogic(player: Player, earth: Earth): void {
    if (player.currentState === CHARACTER_STATES.FALLING_STATE || player.currentState === CHARACTER_STATES.DEATH_STATE) {
        return;
    }

    const playerTilePosition = earth.getTileXYFromScreenCoordinates(player.x, player.y, true);
    const tile = earth.getTile(playerTilePosition.x, playerTilePosition.y);

    if (tile === undefined || tile.biome !== BIOME.LAVA) {
        return;
    }

    player.hit(getLavaPushBackDirection(player), PLAYER_LAVA_DAMAGE);
}

function getLavaPushBackDirection(player: Player): Direction {
    const lastMoveDirections = player.getLastMoveDirections();
    const lastMoveDirection = lastMoveDirections[lastMoveDirections.length - 1] ?? player.direction;

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