import * as Phaser from 'phaser';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Earth } from '../ground/earth';
import { Tile } from '../ground/tile';
import { SEX, WEAPON, GEAR, DIRECTION } from '../common/common';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { ChestJJK } from '../game-objects/objects/chestJJK';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { GameObject2 } from '../common/types';
import { DataManager } from '../common/data-manager';
import { writeChestDialogInfo } from './ui-scene';
import { setupDebugChests } from './debug/debug-chests';
import { spawnDebugEnemies } from './debug/debug-enemies';
import { updateFallingLogic } from './debug/debug-falling';
import { updateSwimmingLogic } from './debug/debug-swimming';
import { DebugSpellcasting } from './debug/debug-spellcasting';
import { setupDebugBlocking } from './debug/debug-blocking';

export class GameScene extends Phaser.Scene {
    #controls!: KeyboardComponent;
    #player!: Player;
    #enemyGroup?: Phaser.GameObjects.Group;
    #critterGroup?: Phaser.GameObjects.Group;
    #earth!: Earth;
    #playerStartPosition = { x: 32035, y: 32020 };
    #chests: ChestJJK[] = [];
    #chestJJKGroup!: Phaser.GameObjects.Group;
    #debugSpellcasting!: DebugSpellcasting;
    #playerMapCollider!: Phaser.Physics.Arcade.Collider;
    #playerChestCollider!: Phaser.Physics.Arcade.Collider;
    #playerMobCollider!: Phaser.Physics.Arcade.Collider;

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
        this.#critterGroup = this.add.group();

        const firstTilePosition = this.#earth.getTileXYFromScreenCoordinates(this.#playerStartPosition.x, this.#playerStartPosition.y, true);
        const firstTile = new Tile({
            tilenumber: firstTilePosition,
            biome: 1,
        });
        this.#earth.AddTile(firstTile);

        if (DataManager.instance.data.isDebugMode) {
            this.#chests = setupDebugChests(this, this.#earth, firstTilePosition, this.#chestJJKGroup);
            setupDebugBlocking(this, this.#earth, firstTilePosition);
            spawnDebugEnemies(this, this.#enemyGroup, this.#critterGroup, this.#earth, firstTilePosition);
        }

        this.#registerColliders();
        this.#registerCustomEvents();

        this.scene.launch('UiScene');

        this.#debugSpellcasting = new DebugSpellcasting(this);
    }

    update() {
        this.#enemyGroup?.getChildren().forEach((enemy) => {
            enemy.update();
        });
        this.#critterGroup?.getChildren().forEach((critter) => {
            critter.update();
        });

        updateFallingLogic(this.#player, this.#earth);
        updateSwimmingLogic(this.#player, this.#earth);

        this.#debugSpellcasting.update(this, this.#player, this.#earth);
    }

    public getChestGroup(): Phaser.GameObjects.Group {
        return this.#chestJJKGroup;
    }

    public getBlockingGeometryGroup(): Phaser.GameObjects.Group {
        return this.#earth.getBlockingGeometryGroup();
    }

    public removePlayerColliders(): void {
        this.physics.world.removeCollider(this.#playerMapCollider);
        this.physics.world.removeCollider(this.#playerChestCollider);
        this.physics.world.removeCollider(this.#playerMobCollider);
    }

    #setupPlayer(): void {
        const currentData = DataManager.instance.data;
        DataManager.instance.data = {
            currentHealth: 6,
            maxHealth: 6,
            currentPower: 1,
            maxPower: 1,
            currentProgress: 0,
            maxProgress: 0,
            sex: currentData.sex ?? SEX.MALE,
            gear: GEAR.NONE,
            weapon: WEAPON.NONE,
            lastDialogOptionSelected: 0,
            languageIsDanish: currentData.languageIsDanish ?? false,
            isDebugMode: currentData.isDebugMode ?? false,
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
        // collision between player and blocking map geometry (treetrunks, stones, etc.)
        this.#playerMapCollider = this.physics.add.collider(this.#player, this.#earth.getBlockingGeometryGroup());

        // register collisions between player and JJKChest game objects
        this.#playerChestCollider = this.physics.add.collider(this.#player, this.#chestJJKGroup, (_player, chest) => {
            // add chest game object to players collision list
            this.#player.collidedWithGameObject(chest as GameObject2);
        });

        // register collisions between enemies and the player.
        this.#playerMobCollider = this.physics.add.overlap(this.#player, this.#enemyGroup!, () => {
            this.#player.hit(DIRECTION.DOWN, 1);
        });

        // register overlap between player weapon and enemies
        this.physics.add.overlap(this.#player.weaponBody, this.#enemyGroup!, (_weaponBody, enemy) => {
            const enemyObj = enemy as CharacterGameObject;
            enemyObj.hit(this.#player.direction, this.#player.weaponDamage);
        });

        // critters (passive mobs) can be hit by the player's weapon but do not damage the player on contact.
        this.physics.add.overlap(this.#player.weaponBody, this.#critterGroup!, (_weaponBody, critter) => {
            const critterObj = critter as CharacterGameObject;
            critterObj.hit(this.#player.direction, this.#player.weaponDamage);
        });

        // register overlap enemies and void tiles from map, so enemies can avoid falling into void.
        this.physics.add.collider(this.#enemyGroup!, this.#earth.getVoidLayer(), (_enemy, _voidTile) => {
            //const enemyObj = enemy as CharacterGameObject; enemyObj.hit(DIRECTION.DOWN, 999); currently enemies do not take damage from bumping into the void.
        });

        // critters also avoid falling into void tiles.
        this.physics.add.collider(this.#critterGroup!, this.#earth.getVoidLayer());
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
        console.debug(`Dialog closed, Player: ${d.sex} ${d.gear} ${d.weapon}, last option selected: ${d.lastDialogOptionSelected}, dialog result info: ${JSON.stringify(d.lastDialogResultInfo)}`);
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
