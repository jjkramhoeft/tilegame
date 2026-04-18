import { Player } from '../../game-objects/player/player';
import { Earth } from '../../ground/earth';

export function updateFallingLogic(player: Player, earth: Earth): void {
    if (player.stateMachine.currentStateName !== 'MOVE_STATE') {
        return;
    }

    const playerTilePosition = earth.getTileXYFromScreenCoordinates(player.x, player.y, true);
    const tileBelow = earth.getTile(playerTilePosition.x, playerTilePosition.y);

    if (playerTilePosition.atBorder === false) {
        if (tileBelow === undefined) {
            player.fall();
        }
    }
    else if (tileBelow === undefined) {
        const borderTile = earth.getBorderTile(player.x, player.y);
        if (borderTile === undefined && tileBelow === undefined) {
            player.fall();
        }
    }
}
