import * as Phaser from 'phaser';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/enemies/spider';
import { Wisp } from '../game-objects/enemies/wisp';
import { Drow } from '../game-objects/enemies/boss/drow';
import { Earth, EarthCastingConfig } from '../ground/earth';
import { Tile } from '../ground/tile';
import { SEX, WEAPON, GEAR, CHEST_STATE, DIRECTION } from '../common/common';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { ChestJJK } from '../game-objects/objects/chestJJK';
import { GameObject2 } from '../common/types';
import { DataManager } from '../common/data-manager';
import { PLAYER_SPEED } from '../common/config';
import { ChestDialogInfo, writeChestDialogInfo } from './ui-scene';

export class GameScene extends Phaser.Scene {
    #controls!: KeyboardComponent;
    #player!: Player;
    #spider!: Spider;
    #wisp!: Wisp;
    #drow!: Drow;
    #enemyGroup?: Phaser.GameObjects.Group;
    #earth!: Earth;
    #playerStartPosition = { x: 32035, y: 32020 };
    #chests: ChestJJK[] = [];
    #chestJJKGroup!: Phaser.GameObjects.Group;
    #playerCurrentMagic: EarthCastingConfig = {
        isDesertUnlocked: false,
        isGrassUnlocked: false,
        isForestUnlocked: false,
        isSwampUnlocked: false,
        isCrystalUnlocked: false,
        isWaterUnlocked: false,
        isLavaUnlocked: false,
        isMountainUnlocked: false,
        powerLevel: 1,
    };
    #spellSound: Phaser.Sound.BaseSound;
    #previousStateName: string | undefined;

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

        this.#chestJJKGroup = this.add.group([]);

        this.#setupPlayer();
        this.#setupCamera();

        this.#enemyGroup = this.add.group();

        const firstTilePosition = this.#earth.getTileXYFromScreenCoordinates(this.#playerStartPosition.x, this.#playerStartPosition.y, true);
        const firstTile = new Tile({
            tilenumber: firstTilePosition,
            biome: 1,
        });
        this.#earth.AddTile(firstTile);

        // Temp chests for testing ------------------------------------------------
        const chest1Tile = new Tile({
            tilenumber: { x: firstTilePosition.x + 2, y: firstTilePosition.y },
            biome: 1,
            chest: 1,
        });
        this.#earth.AddTile(chest1Tile);
        this.#chests.push(new ChestJJK(this, {
            id: 1,
            tilePosition: { x: chest1Tile.tileX, y: chest1Tile.tileY },
            worldPosition: { x: chest1Tile.tileX * 64, y: chest1Tile.tileY * 64 + 64 },
            contents: {
                gear: GEAR.BASIC,
                weapon: WEAPON.DAGGER,
            }
        }, CHEST_STATE.REVEALED));
        this.#chestJJKGroup.add(this.#chests[0]);

        const chest2Tile = new Tile({
            tilenumber: { x: firstTilePosition.x + 3, y: firstTilePosition.y + 3 },
            biome: 1,
            chest: 2,
        });
        this.#earth.AddTile(chest2Tile);
        this.#chests.push(new ChestJJK(this, {
            id: 2,
            tilePosition: { x: chest2Tile.tileX, y: chest2Tile.tileY },
            worldPosition: { x: chest2Tile.tileX * 64, y: chest2Tile.tileY * 64 + 64 },
            contents: {
                gear: GEAR.NONE,
                weapon: WEAPON.STAFF,
            }
        }, CHEST_STATE.REVEALED));
        this.#chestJJKGroup.add(this.#chests[1]);

        // Temp enemies for testing ------------------------------------------------
       
        this.#spider = new Spider({
            scene: this,
            position: { x: 32000 + 350, y: 32000 + 200 },            
        });
        this.#spider.enableObject();
        this.#enemyGroup.add(this.#spider);
 /*
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
        */

        this.#registerColliders();
        this.#registerCustomEvents();

        this.scene.launch('UiScene');

        this.#spellSound = this.sound.add('spellnotes1', { volume: 0.9 });
        //this.#stepSound = this.sound.add('steps', { volume: 1.0 });
    }

    update() {
        this.#enemyGroup?.getChildren().forEach((enemy) => {
            enemy.update();
        });

        // Creating falling logic. (Temporary, placed here - while developing.)
        if (this.#player.stateMachine.currentStateName === 'MOVE_STATE') {
            const playerTilePosition = this.#earth.getTileXYFromScreenCoordinates(this.#player.x, this.#player.y, true);
            const tileBelow = this.#earth.getTile(playerTilePosition.x, playerTilePosition.y);
            if (playerTilePosition.atBorder === false) {
                if (tileBelow === undefined) {
                    this.#player.fall();
                }
            }
            else if (tileBelow === undefined) {
                //At tile border. Check if other tile also doesn't exist
                const borderTile = this.#earth.getBorderTile(this.#player.x, this.#player.y);
                if (borderTile === undefined && tileBelow === undefined) {
                    this.#player.fall();
                }
            }
        }


        // Spell casting and Creating new tiles logic. (Temporary, placed here - while developing.)
        if (this.#player.stateMachine.currentStateName === 'ATTACK_STATE' &&
            this.#previousStateName !== 'ATTACK_STATE'
            // &&            this.#spellSound.isPlaying === false
        ) {
            //console.log('Player casting/attacking');
            if (this.#spellSound.isPlaying === false) {
                this.#spellSound.play();
            }

            const lastDirections = this.#player.getLastMoveDirections();
            let oldvx = 0;
            let oldvy = 0;
            for (const dir of lastDirections) {
                switch (dir) {
                    case 'UP': oldvy -= PLAYER_SPEED; break;
                    case 'DOWN': oldvy += PLAYER_SPEED; break;
                    case 'LEFT': oldvx -= PLAYER_SPEED; break;
                    case 'RIGHT': oldvx += PLAYER_SPEED; break;
                }
            }
            const spell = this.add.sprite(this.player.x + oldvx / 10, this.player.y + oldvy / 10, 'spell-music-11').setScale(0.5).setOrigin(0.5, 0.5);
            spell.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            spell.play('spell-music-anim');
            this.tweens.add({
                targets: spell,
                x: spell.x + oldvx,
                y: spell.y + oldvy,
                duration: 1500,
                ease: 'Sine.easeOut',
                onComplete: () => spell.destroy()
            });
            spell.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                spell.destroy();
            });

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
                if (feedback.rockTilesPlaced > 10) { this.#playerCurrentMagic.isDesertUnlocked = true; }
                if (feedback.desertTilesPlaced > 10) { this.#playerCurrentMagic.isGrassUnlocked = true; }
                if (feedback.grassTilesPlaced > 10) { this.#playerCurrentMagic.isForestUnlocked = true; }
                if (feedback.forestTilesPlaced > 10) {
                    this.#playerCurrentMagic.isSwampUnlocked = true;
                    this.#playerCurrentMagic.isWaterUnlocked = true;
                }
                if (feedback.forestTilesPlaced > 20) {
                    this.#playerCurrentMagic.isCrystalUnlocked = true;
                }
                if (feedback.forestTilesPlaced > 30) {
                    this.#playerCurrentMagic.isLavaUnlocked = true;
                    //this.#playerCurrentMagic.isMountainUnlocked = true;
                }
                const sum = feedback.rockTilesPlaced + feedback.desertTilesPlaced + feedback.grassTilesPlaced + feedback.forestTilesPlaced;
                const x = Math.floor(sum / 20);
                if (x > this.#playerCurrentMagic.powerLevel) {
                    this.#playerCurrentMagic.powerLevel++;
                }
            }
        }

        this.#previousStateName = this.#player.stateMachine.currentStateName;
    }

    #setupPlayer(): void {
        const currentData = DataManager.instance.data;
        DataManager.instance.data = {
            currentHealth: 6,
            maxHealth: 6,
            sex: currentData.sex ?? SEX.MALE,
            gear: GEAR.NONE,
            weapon: WEAPON.NONE,
            lastDialogOptionSelected: 0,
            languageIsDanish: currentData.languageIsDanish ?? false,
        };
        this.#player = new Player({
            scene: this,
            position: this.#playerStartPosition,
            controls: this.#controls,
            maxLife: 3,
            currentLife: 3
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

        // register collisions between player and blocking game objects (doors, pots, chests, etc.)
        this.physics.add.collider(this.#player, this.#chestJJKGroup, (player, gameObject) => {
            // add game object to players collision list
            this.#player.collidedWithGameObject(gameObject as GameObject2);
        });

        this.physics.add.overlap(this.#player, this.#enemyGroup!, () => {
            this.#player.hit(DIRECTION.DOWN, 1);
        });
    }

    #registerCustomEvents(): void {
        EVENT_BUS.on(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);
        //EVENT_BUS.on(CUSTOM_EVENTS.ENEMY_DESTROYED, this.#checkForAllEnemiesAreDefeated, this);
        //EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_DEFEATED, this.#handlePlayerDefeatedEvent, this);
        EVENT_BUS.on(CUSTOM_EVENTS.DIALOG_CLOSED, this.#handleDialogClosed, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);
            //EVENT_BUS.off(CUSTOM_EVENTS.ENEMY_DESTROYED, this.#checkForAllEnemiesAreDefeated, this);
            //EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_DEFEATED, this.#handlePlayerDefeatedEvent, this);
            EVENT_BUS.off(CUSTOM_EVENTS.DIALOG_CLOSED, this.#handleDialogClosed, this);
        });
    }

    #handleDialogClosed(): void {
        let d = DataManager.instance.data;
        if (d.lastDialogResultInfo) {
            if (d.lastDialogOptionSelected === 0) {
                // Option 1 selected
                // Weapons
                if(d.lastDialogResultInfo.option1WeaponToPlayer === WEAPON.NONE && d.lastDialogResultInfo.option1WeaponToLeave === GEAR.NONE){ 
                    // Do nothing.
                }
                else {
                    d.weapon = d.lastDialogResultInfo.option1WeaponToPlayer;
                    this.#chests[d.lastDialogResultInfo.chestNumber! - 1].contents.weapon = d.lastDialogResultInfo.option1WeaponToLeave;
                }
                // Gear
                if(d.lastDialogResultInfo.option1GearToPlayer === GEAR.NONE && d.lastDialogResultInfo.option1GearToLeave === GEAR.NONE){
                    // Do nothing.
                }
                else {
                    d.gear = d.lastDialogResultInfo.option1GearToPlayer;
                    this.#chests[d.lastDialogResultInfo.chestNumber! - 1].contents.gear = d.lastDialogResultInfo.option1GearToLeave;
                }
                DataManager.instance.data = d;
            }
            if (d.lastDialogOptionSelected === 1) {
                // Option 2 selected 
                if(d.lastDialogResultInfo.option2GearToPlayer === GEAR.NONE && d.lastDialogResultInfo.option2GearToLeave === GEAR.NONE){
                    // Do nothing.
                }
                else {
                    d.gear = d.lastDialogResultInfo.option2GearToPlayer;
                    this.#chests[d.lastDialogResultInfo.chestNumber! - 1].contents.gear = d.lastDialogResultInfo.option2GearToLeave;
                }
                DataManager.instance.data = d;
            }
        }
        //this.scene.resume();
    }

    #handleOpenChest(chest: ChestJJK): void {
       
        const chestInfo = writeChestDialogInfo(chest);
        DataManager.instance.data = {
            ...DataManager.instance.data,
            lastDialogResultInfo: chestInfo,
        };
        EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_DIALOG, chestInfo.message);
    }

}
