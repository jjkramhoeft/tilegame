import { BIOME } from '../common/common';
import { Player } from '../game-objects/player/player';
import { Earth } from '../ground/earth';

export function updateSwimmingLogic(player: Player, earth: Earth): void {
    const playerTilePosition = earth.getTileXYFromScreenCoordinates(player.x, player.y, true);
    const tile = earth.getTile(playerTilePosition.x, playerTilePosition.y);
    const isOnWater = tile !== undefined && tile.biome === BIOME.WATER;

    const currentState = player.currentState;

    if (isOnWater && (currentState === 'MOVE_STATE' || currentState === 'IDLE_STATE')) {
        player.swim();
    } else if (!isOnWater && currentState === 'SWIM_STATE') {
        player.stopSwimming();
    }
}