import { Scene } from 'phaser';
import { WorldMap } from '../tilemap/WorldMap';
import { Player } from '../game-objects/Player/Player';
import { ASSET_KEYS } from '../../assets';

export class GameScene extends Scene
{
    #player!: Player;
    private worldMap?: WorldMap;

    constructor ()
    {
        super('GameScene');
    }

    preload ()
    {
        this.load.setPath('assets');
        WorldMap.preload(this);
        this.load.image(ASSET_KEYS.PLAYER, 'player.png');
    }

    create ()
    {
        this.worldMap = new WorldMap(this);
        this.worldMap.initializeEmpty();
        this.worldMap.seedDemoWorld();

        this.#player = new Player({
            scene: this,
            position: {x: 100, y: 100},
            assetKey: ASSET_KEYS.PLAYER,
            frame: 0
        });

    }

    update ()
    {
        this.worldMap?.update();
    }
}
