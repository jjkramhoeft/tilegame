import * as Phaser from 'phaser';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Earth } from '../ground/earth';
import { Tile } from '../ground/tile';
import { SEX, WEAPON, GEAR, DIRECTION } from '../common/common';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { ChestJJK } from '../game-objects/objects/chestJJK';
import { GameObject2 } from '../common/types';
import { DataManager } from '../common/data-manager';
import { writeChestDialogInfo } from './ui-scene';
import { setupDebugChests } from './debug/debug-chests';
import { spawnDebugEnemies } from './debug/debug-enemies';
import { updateFallingLogic } from './debug/debug-falling';
import { DebugSpellcasting } from './debug/debug-spellcasting';

export class GameScene extends Phaser.Scene {
    #controls!: KeyboardComponent;
    #player!: Player;
    #enemyGroup?: Phaser.GameObjects.Group;
    #earth!: Earth;
    #playerStartPosition = { x: 32035, y: 32020 };
    #chests: ChestJJK[] = [];
    #chestJJKGroup!: Phaser.GameObjects.Group;
    #debugSpellcasting!: DebugSpellcasting;

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

        this.#chests = setupDebugChests(this, this.#earth, firstTilePosition, this.#chestJJKGroup);
        spawnDebugEnemies(this, this.#enemyGroup);

        this.#registerColliders();
        this.#registerCustomEvents();

        this.scene.launch('UiScene');

        this.#debugSpellcasting = new DebugSpellcasting(this);
    }

    update() {
        this.#enemyGroup?.getChildren().forEach((enemy) => {
            enemy.update();
        });

        updateFallingLogic(this.#player, this.#earth);
        this.#debugSpellcasting.update(this, this.#player, this.#earth);
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
        this.physics.add.collider(this.#player, this.#chestJJKGroup, (/*player,*/ gameObject) => {
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
            if (d.lastDialogOptionSelected === 0) {// Top Option Selected, can be either weapon or gear.
                // Weapons is in the top option
                if (!(d.lastDialogResultInfo.option1WeaponToPlayer === WEAPON.NONE && d.lastDialogResultInfo.option1WeaponToLeave === WEAPON.NONE)) {
                    d.weapon = d.lastDialogResultInfo.option1WeaponToPlayer;
                    this.#chests[d.lastDialogResultInfo.chestNumber! - 1].contents.weapon = d.lastDialogResultInfo.option1WeaponToLeave;
                }
                // Gear is in the top option
                if (!(d.lastDialogResultInfo.option1GearToPlayer === GEAR.NONE && d.lastDialogResultInfo.option1GearToLeave === GEAR.NONE)) {
                    d.gear = d.lastDialogResultInfo.option1GearToPlayer;
                    this.#chests[d.lastDialogResultInfo.chestNumber! - 1].contents.gear = d.lastDialogResultInfo.option1GearToLeave;
                }
            }
            if (d.lastDialogOptionSelected === 1) {
                // Option 2 selected kan only be gear
                if (!(d.lastDialogResultInfo.option2GearToPlayer === GEAR.NONE && d.lastDialogResultInfo.option2GearToLeave === GEAR.NONE)) {
                    d.gear = d.lastDialogResultInfo.option2GearToPlayer;
                    this.#chests[d.lastDialogResultInfo.chestNumber! - 1].contents.gear = d.lastDialogResultInfo.option2GearToLeave;
                }
            }
        }
        DataManager.instance.data = d;
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
