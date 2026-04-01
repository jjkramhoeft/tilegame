import { Scene } from 'phaser';
import { WorldMap } from '../tilemap/WorldMap';
import { Player } from '../game-objects/player/player';
import { ASSET_KEYS } from '../common/assets';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/Enemies/spider';
import { Wisp } from '../game-objects/Enemies/wisp';
import { Drow } from '../game-objects/Enemies/boss/drow';

export class GameScene extends Scene
{
    #controls!: KeyboardComponent;
    #player!: Player;
    #spider!: Spider;
    #wisp!:Wisp;
    #drow!: Drow;
    #enemyGroup?: Phaser.GameObjects.Group;

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
       
        //this.#setupMap();        

        this.#setupPlayer();
        this.#setupCamera();

        this.#enemyGroup = this.add.group();

        this.#spider = new Spider({
            scene: this,
            position: {x: 150, y: 200},
        });
        this.#enemyGroup.add(this.#spider);

        this.#wisp = new Wisp({
            scene: this,
            position: {x: 200, y: 250},
        });
        this.#enemyGroup.add(this.#wisp);

        this.#drow = new Drow({
            scene: this,
            position: {x: 250, y: 300},
        });
        this.#enemyGroup.add(this.#drow);
    }

    update ()
    {
        this.worldMap?.update();
        this.#enemyGroup?.getChildren().forEach((enemy) => {
                enemy.update();
        });

    }

    #setupMap(): void{
        this.worldMap = new WorldMap(this);
        this.worldMap.initializeEmpty();
        this.worldMap.seedDemoWorld();
    }

    #setupPlayer(): void {
        this.#player = new Player({
            scene: this,
            position: {x: 150, y: 150},
            controls: this.#controls,
            maxLife: 3,
            currentLife: 3
        });
    }

    #setupCamera(): void {
        this.cameras.main.setBounds(0, 0, 1024, 768);
        this.cameras.main.startFollow(this.#player);
    }
}
