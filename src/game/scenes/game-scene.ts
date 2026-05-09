import * as Phaser from 'phaser';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Earth } from '../ground/earth';
import { Tile } from '../ground/tile';
import { SEX, WEAPON, GEAR, DIRECTION } from '../common/common';
import {
    CUSTOM_EVENTS,
    EVENT_BUS,
    type ProgressionHelpClosed,
    type ProgressionHelpPayload,
    type TilesPlacedUpdated,
} from '../common/event-bus';
import { ChestJJK } from '../game-objects/objects/chestJJK';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { GameObject2, Position } from '../common/types';
import { DataManager } from '../common/data-manager';
import { writeChestDialogInfo } from '../common/chest-dialog';
import { addChest, setupDebugChests } from './debug/debug-chests';
import { spawnDebugEnemies } from './debug/debug-enemies';
import { updateFallingLogic } from './debug/debug-falling';
import { updateSwimmingLogic } from './debug/debug-swimming';
import { DebugSpellcasting } from './debug/debug-spellcasting';
import { setupDebugBlocking } from './debug/debug-blocking';
import { SCENE_KEYS } from './scene-keys';

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
    #isGameplayReady = false;
    #isIntroPending = false;
    #introShown = false;
    #controlsHelpShown = false;
    #followUpShown = false;
    #hasPlayerMoved = false;
    #gameOverShown = false;

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

        this.#chestJJKGroup = this.add.group([]);

        this.#earth = new Earth(this, (position, chestNumber) => {
            addChest(position, this, this.#chests, this.#chestJJKGroup, chestNumber);
        });
        this.#earth.createMap(1000, 1000);

        this.#setupPlayer();
        this.#setupCamera();

        this.#enemyGroup = this.add.group();
        this.#critterGroup = this.add.group();
        this.#registerCustomEvents();

        this.scene.launch(SCENE_KEYS.UI_SCENE);
        this.#showIntroHelp();
    }

    update() {
        if (!this.#isGameplayReady) {
            return;
        }

        if (!this.#hasPlayerMoved && this.#isMovementInputDown()) {
            this.#hasPlayerMoved = true;
        }

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

    public getChestArray(): ChestJJK[] {
        return this.#chests;
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
        this.#controls.isMovementLocked = true;

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
        EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_DEFEATED, this.#handlePlayerDefeatedEvent, this);
        EVENT_BUS.on(CUSTOM_EVENTS.DIALOG_CLOSED, this.#handleDialogClosed, this);
        EVENT_BUS.on(CUSTOM_EVENTS.PROGRESSION_HELP_CLOSED, this.#handleProgressionHelpClosed, this);
        EVENT_BUS.on(CUSTOM_EVENTS.TILES_PLACED, this.#handleTilesPlaced, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);
            //EVENT_BUS.off(CUSTOM_EVENTS.ENEMY_DESTROYED, this.#checkForAllEnemiesAreDefeated, this);
            EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_DEFEATED, this.#handlePlayerDefeatedEvent, this);
            EVENT_BUS.off(CUSTOM_EVENTS.DIALOG_CLOSED, this.#handleDialogClosed, this);
            EVENT_BUS.off(CUSTOM_EVENTS.PROGRESSION_HELP_CLOSED, this.#handleProgressionHelpClosed, this);
            EVENT_BUS.off(CUSTOM_EVENTS.TILES_PLACED, this.#handleTilesPlaced, this);
        });
    }

    #showIntroHelp(): void {
        if (this.#introShown) {
            return;
        }

        this.#introShown = true;
        this.#isIntroPending = true;
        this.#showProgressionHelp({ textKey: 'ui.progression.intro' });
    }

    #startGameplay(): void {
        if (this.#isGameplayReady) {
            return;
        }

        const firstTilePosition = this.#placeStartingTile();

        if (DataManager.instance.data.isDebugMode) {
            this.#chests = setupDebugChests(this, this.#earth, firstTilePosition, this.#chestJJKGroup);
            setupDebugBlocking(this, this.#earth, firstTilePosition);
            spawnDebugEnemies(this, this.#enemyGroup!, this.#critterGroup!, this.#earth, firstTilePosition);
        }

        this.#registerColliders();
        this.#debugSpellcasting = new DebugSpellcasting(this, this.#critterGroup!);
        this.#isGameplayReady = true;
        this.#controls.isMovementLocked = false;
        this.#startControlsHelpTimer();
    }

    #placeStartingTile(): Position {
        const firstTilePosition = this.#earth.getTileXYFromScreenCoordinates(this.#playerStartPosition.x, this.#playerStartPosition.y, true);
        const firstTile = new Tile({
            tilenumber: firstTilePosition,
            biome: 1,
        });
        this.#earth.AddTile(firstTile);
        return firstTilePosition;
    }

    #startControlsHelpTimer(): void {
        this.time.delayedCall(10000, () => {
            if (this.#hasPlayerMoved || this.#controlsHelpShown || this.#gameOverShown) {
                return;
            }

            this.#controlsHelpShown = true;
            this.#showProgressionHelp({ textKey: 'ui.progression.controlsHelp' });
        });
    }

    #handleProgressionHelpClosed(data: ProgressionHelpClosed): void {
        if (this.#isIntroPending) {
            this.#isIntroPending = false;
            this.#startGameplay();
            return;
        }

        if (data.closeAction === 'mainMenu') {
            this.scene.stop(SCENE_KEYS.UI_SCENE);
            this.scene.start(SCENE_KEYS.INTRO);
            return;
        }

        if (data.closeAction === 'restart') {
            this.scene.stop(SCENE_KEYS.UI_SCENE);
            this.scene.restart();
            return;
        }

        if (this.#isGameplayReady && !this.#gameOverShown) {
            this.#controls.isMovementLocked = false;
        }
    }

    #handleTilesPlaced(data: TilesPlacedUpdated): void {
        if (this.#followUpShown || data.totalPlacedTiles < 4) {
            return;
        }

        this.#followUpShown = true;
        this.#showProgressionHelp({ textKey: 'ui.progression.followUp' });
    }

    #handlePlayerDefeatedEvent(): void {
        if (this.#gameOverShown) {
            return;
        }

        this.#gameOverShown = true;
        this.time.delayedCall(1000, () => {
            this.#showProgressionHelp({ textKey: 'ui.progression.gameOver', closeAction: 'mainMenu' });
        });
    }

    #showProgressionHelp(payload: ProgressionHelpPayload): void {
        this.#controls.isMovementLocked = true;
        this.time.delayedCall(0, () => {
            EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_PROGRESSION_HELP, payload);
        });
    }

    #isMovementInputDown(): boolean {
        return this.#controls.isUpDown || this.#controls.isDownDown || this.#controls.isLeftDown || this.#controls.isRightDown;
    }

    #handleDialogClosed(): void {
        let d = DataManager.instance.data;
        const dialogResultInfo = d.lastDialogResultInfo;
        console.debug(`Dialog closed, Player: ${d.sex} ${d.gear} ${d.weapon}, last option selected: ${d.lastDialogOptionSelected}, dialog result info: ${JSON.stringify(dialogResultInfo)}`);
        if (dialogResultInfo) {
            const chest = this.#getChestById(dialogResultInfo.chestNumber);
            if (!chest) {
                console.warn(`Unable to apply chest dialog result. Chest id ${dialogResultInfo.chestNumber} was not found.`);
                DataManager.instance.data = d;
                return;
            }

            if (d.lastDialogOptionSelected === 0) {// Top Option Selected, can be either weapon or gear.
                // Weapons is in the top option
                if (!(dialogResultInfo.option1WeaponToPlayer === WEAPON.NONE && dialogResultInfo.option1WeaponToLeave === WEAPON.NONE)) {
                    d.weapon = dialogResultInfo.option1WeaponToPlayer;
                    chest.contents.weapon = dialogResultInfo.option1WeaponToLeave;
                }
                // Gear is in the top option
                if (!(dialogResultInfo.option1GearToPlayer === GEAR.NONE && dialogResultInfo.option1GearToLeave === GEAR.NONE)) {
                    d.gear = dialogResultInfo.option1GearToPlayer;
                    chest.contents.gear = dialogResultInfo.option1GearToLeave;
                }
            }
            if (d.lastDialogOptionSelected === 1) {
                // Option 2 selected kan only be gear
                if (!(dialogResultInfo.option2GearToPlayer === GEAR.NONE && dialogResultInfo.option2GearToLeave === GEAR.NONE)) {
                    d.gear = dialogResultInfo.option2GearToPlayer;
                    chest.contents.gear = dialogResultInfo.option2GearToLeave;
                }
            }
        }
        DataManager.instance.data = d;
    }

    #getChestById(chestId: number | undefined): ChestJJK | undefined {
        return this.#chests.find((chest) => chest.id === chestId);
    }

    #handleOpenChest(chest: ChestJJK): void {

        const chestInfo = writeChestDialogInfo(chest);
        DataManager.instance.data = {
            ...DataManager.instance.data,
            lastDialogResultInfo: chestInfo,
        };
        EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_DIALOG, chestInfo.dialog);
    }

}
