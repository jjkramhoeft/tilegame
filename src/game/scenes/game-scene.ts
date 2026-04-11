import * as Phaser from 'phaser';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/enemies/spider';
import { Wisp } from '../game-objects/enemies/wisp';
import { Drow } from '../game-objects/enemies/boss/drow';
import { Earth, EarthCastingConfig } from '../ground/earth';
import { Tile } from '../ground/tile';
import { SEX, WEAPON, GEAR } from '../common/common';

export class GameScene extends Phaser.Scene {
    #controls!: KeyboardComponent;
    #player!: Player;
    #spider!: Spider;
    #wisp!: Wisp;
    #drow!: Drow;
    #enemyGroup?: Phaser.GameObjects.Group;
    #earth!: Earth;
    #playerStartPosition = { x: 32035, y: 32020 };
    #playerCurrentMagic: EarthCastingConfig = {
        isDesertUnlocked: true,
        isGrassUnlocked: true,
        isForestUnlocked: true,
        isSwampUnlocked: true,
        isCrystalUnlocked: true,
        isWaterUnlocked: true,
        isLavaUnlocked: true,
        isMountainUnlocked: true,
        powerLevel: 5,
    };


    constructor() {
        super('GameScene');
    }

    get player(): Player {
        return this.#player;
    }

    create() {
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly.');
            return;
        }
        this.#controls = new KeyboardComponent(this.input.keyboard);

        this.#earth = new Earth(this);
        this.#earth.createMap(1000, 1000);

        this.#setupPlayer();
        this.#setupCamera();

        this.#enemyGroup = this.add.group();

        const firstTilePosition = this.#earth.getTileXYFromScreenCoordinates(this.#playerStartPosition.x, this.#playerStartPosition.y, true);
        const firstTile = new Tile({
            tilenumber: firstTilePosition,
            biome: 1,
        });
        this.#earth.AddTile(firstTile);


        this.#spider = new Spider({
            scene: this,
            position: { x: 32000 + 350, y: 32000 + 200 },
        });
        //this.#spider.enableObject();
        this.#enemyGroup.add(this.#spider);

        this.#wisp = new Wisp({
            scene: this,
            position: { x: 32000 + 200, y: 32000 + 250 },
        });
        //this.#wisp.enableObject();
        this.#enemyGroup.add(this.#wisp);

        this.#drow = new Drow({
            scene: this,
            position: { x: 32000 + 250, y: 32000 + 300 },
        });
        //this.#drow.enableObject();
        this.#enemyGroup.add(this.#drow);


        this.#registerColliders();

    }

    update() {
        this.#enemyGroup?.getChildren().forEach((enemy) => {
            enemy.update();
        });

        // Creating falling logic. (Temporary, placed here - while developing.)
        if (this.#player.stateMachine.currentStateName === 'MOVE_STATE') {
            const playerTilePosition = this.#earth.getTileXYFromScreenCoordinates(this.#player.x, this.#player.y, true);
            const tileBelow = this.#earth.getTile(playerTilePosition.x, playerTilePosition.y);
            if(playerTilePosition.atBorder===false) {
                if(tileBelow === undefined) {
                    this.#player.fall();
                }
            }
            else if(tileBelow === undefined) {
                //At tile border. Check if other tile also doesn't exist
                const borderTile = this.#earth.getBorderTile(this.#player.x, this.#player.y);
                if(borderTile === undefined && tileBelow === undefined) {
                    this.#player.fall();
                }
            }
        }

        // Creating new tiles logic. (Temporary, placed here - while developing.)
        if (this.#player.stateMachine.currentStateName === 'ATTACK_STATE') {
            console.log('Player casting/attacking');
            const casterPosition = this.#earth.getTileXYFromScreenCoordinates(this.#player.x, this.#player.y, true);
            const tilePosition = { x: casterPosition.x, y: casterPosition.y };
            const directions = this.#player.getLastMoveDirections();
            console.log(directions);
            directions.forEach(dir => {
                switch (dir) {
                    case 'UP': tilePosition.y -= 1; break;
                    case 'DOWN': tilePosition.y += 1; break;
                    case 'LEFT': tilePosition.x -= 1; break;
                    case 'RIGHT': tilePosition.x += 1; break;
                }
            });

            const feedback = this.#earth.AddTiles(this.#playerCurrentMagic, casterPosition, tilePosition, directions);
            if (feedback) {
                if(feedback.rockTilesPlaced > 10) {this.#playerCurrentMagic.isDesertUnlocked = true;}
                if(feedback.desertTilesPlaced > 10) {this.#playerCurrentMagic.isGrassUnlocked = true;}
                if(feedback.grassTilesPlaced > 10) {this.#playerCurrentMagic.isForestUnlocked = true;}
                if(feedback.forestTilesPlaced > 10) {
                    this.#playerCurrentMagic.isSwampUnlocked = true;
                    this.#playerCurrentMagic.isWaterUnlocked = true;
                }
                if(feedback.forestTilesPlaced > 20) {
                    this.#playerCurrentMagic.isCrystalUnlocked = true;
                }
                if(feedback.forestTilesPlaced > 30) {
                    this.#playerCurrentMagic.isLavaUnlocked = true;
                    //this.#playerCurrentMagic.isMountainUnlocked = true;
                }
                const sum = feedback.rockTilesPlaced + feedback.desertTilesPlaced + feedback.grassTilesPlaced + feedback.forestTilesPlaced;
                const x = Math.floor(sum/20);
                if(x > this.#playerCurrentMagic.powerLevel) {
                    this.#playerCurrentMagic.powerLevel ++;
                }
            }
        }
    }

    #setupPlayer(): void {
        this.#player = new Player({
            scene: this,
            position: this.#playerStartPosition,
            controls: this.#controls,
            maxLife: 3,
            currentLife: 3,
            sex: SEX.MALE,
            gear: GEAR.NONE,
            weapon: WEAPON.NONE,
        });

    }

    #setupCamera(): void {
        this.cameras.main.setBounds(0, 0, 64000, 64000);
        this.cameras.main.startFollow(this.#player);
    }

    #registerColliders(): void {
        // collision between player and map 
        this.physics.add.collider(this.#player, this.#earth.getBlockingGeometryGroup()
            /*  , (_player, geometry) => {
                    console.log('Player collided with blocking tile index:', (geometry as Phaser.GameObjects.Zone).getData('tileIndex'));
            }*/
        );
    }

}
