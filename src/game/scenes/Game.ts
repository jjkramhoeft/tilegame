import { Scene } from 'phaser';
import { WorldMap } from '../tilemap/WorldMap';

export class Game extends Scene
{
    private worldMap?: WorldMap;

    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        WorldMap.preload(this);
    }

    create ()
    {
        this.worldMap = new WorldMap(this);
        this.worldMap.initializeEmpty();
        this.worldMap.seedDemoWorld();
    }

    update ()
    {
        this.worldMap?.update();
    }
}
