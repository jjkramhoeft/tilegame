import * as Phaser from 'phaser';
import { WorldMap } from '../tilemap/WorldMap';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/enemies/spider';
import { Wisp } from '../game-objects/enemies/wisp';
import { Drow } from '../game-objects/enemies/boss/drow';
import { Earth, EarthCastingConfig } from '../ground/earth';
import { Tile } from '../ground/tile';

export class GameScene extends Phaser.Scene
{
    #controls!: KeyboardComponent;
    #player!: Player;
    #spider!: Spider;
    #wisp!:Wisp;
    #drow!: Drow;
    #enemyGroup?: Phaser.GameObjects.Group;
    #earth!: Earth;
    #playerStartPosition = { x: 400, y: 250 };

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

        this.#earth = new Earth(this);
        this.#earth.createMap(100, 100);
       
        this.#setupMap();  // old map.

       

        this.#setupPlayer();
        this.#setupCamera();

        this.#enemyGroup = this.add.group();

        const firstTilePosition = this.#earth.getTileXYFromScreenCoordinates(this.#playerStartPosition.x, this.#playerStartPosition.y,true);
        const firstTile = new Tile({
            tilenumber: firstTilePosition,
            biome: 1,
        });
        this.#earth.AddTile(firstTile);      

        /*
        this.#spider = new Spider({
            scene: this,
            position: {x: 350, y: 200},
        });
        this.#spider.enableObject(); 
        this.#enemyGroup.add(this.#spider);

        this.#wisp = new Wisp({
            scene: this,
            position: {x: 200, y: 250},
        });
        this.#wisp.enableObject();
        this.#enemyGroup.add(this.#wisp);

        this.#drow = new Drow({
            scene: this,
            position: {x: 250, y: 300},
        });
        this.#drow.enableObject();
        this.#enemyGroup.add(this.#drow);
        */
    }

    update ()
    {
        this.#enemyGroup?.getChildren().forEach((enemy) => {
                enemy.update();
        });

        // Creating new tiles logic. (Temporary, placed here - while developing.)
        if(this.#player.stateMachine.currentStateName === 'ATTACK_STATE'){
            console.log('Player casting/attacking');
            const casterPosition = this.#earth.getTileXYFromScreenCoordinates(this.#player.x, this.#player.y,true);
            const tilePosition = {x: casterPosition.x, y: casterPosition.y};
            const directions = this.#player.getLastMoveDirections();
            console.log(directions);
            directions.forEach(dir => {
                switch(dir){
                    case 'UP': tilePosition.y -= 1; break;
                    case 'DOWN': tilePosition.y += 1; break;
                    case 'LEFT': tilePosition.x -= 1; break;
                    case 'RIGHT': tilePosition.x += 1; break;
                }
            });
            
            this.#earth.AddTiles({
                isDesertUnlocked: true,
                isGrassUnlocked: true,
                isForestUnlocked: true,
                isSwampUnlocked: true,
                isCrystalUnlocked: true,
                isWaterUnlocked: true,
                isLavaUnlocked: true,
                isMountainUnlocked: true,
                powerLevel: 2,
            } as EarthCastingConfig, 
            casterPosition,
            tilePosition,
            directions);               
        }
    }

    #setupMap(): void{
        this.worldMap = new WorldMap(this);
        this.worldMap.seedDemoWorld();
    }

    #setupPlayer(): void {
        this.#player = new Player({
            scene: this,
            position: this.#playerStartPosition,
            controls: this.#controls,
            maxLife: 3,
            currentLife: 3
        });
    }

    #setupCamera(): void {
        this.cameras.main.setBounds(-100, -100, 2000, 2000);
        this.cameras.main.startFollow(this.#player);
    }
}
