import { Scene } from 'phaser';
import { WorldMap } from '../tilemap/WorldMap';

export class Game extends Scene
{
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
        WorldMap.create(this);
    }
}
