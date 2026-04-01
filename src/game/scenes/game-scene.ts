import { Scene } from 'phaser';
import { WorldMap } from '../tilemap/WorldMap';
import { Player } from '../game-objects/player/player';
import { ASSET_KEYS } from '../common/assets';
import { KeyboardComponent } from '../components/input/keyboard-component';

export class GameScene extends Scene
{
    #controls!: KeyboardComponent;
    #player!: Player;
    private worldMap?: WorldMap;

    constructor ()
    {
        super('GameScene');
    }

    get player(): Player {
        return this.#player;
    }

    preload ()
    {
        this.load.setPath('assets');
        WorldMap.preload(this);
    }

    create ()
    {
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly.');
            return;
        }
        this.#controls = new KeyboardComponent(this.input.keyboard);

        this.worldMap = new WorldMap(this);
        this.worldMap.initializeEmpty();
        this.worldMap.seedDemoWorld();

        this.#player = new Player({
            scene: this,
            position: {x: 150, y: 150},
            controls: this.#controls,
            assetKey: ASSET_KEYS.MALE_NUDE_NONE_IDLE,
            frame: 0
        });

    }

    update ()
    {
        this.worldMap?.update();
    }
}
