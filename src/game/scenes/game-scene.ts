import * as Phaser from 'phaser';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Earth } from '../ground/earth';
import { SEX, WEAPON, GEAR, DIRECTION, BIOME, POTION } from '../common/common';
import {
    CUSTOM_EVENTS,
    EVENT_BUS,
} from '../common/event-bus';
import { ChestJJK } from '../game-objects/objects/chestJJK';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { GameObject2, Position } from '../common/types';
import { DataManager } from '../common/data-manager';
import { writeChestDialogInfo } from '../common/chest-dialog';
import { addChest, setupDebugChests } from './debug/debug-chests';
import { spawnDebugEnemies } from './debug/debug-enemies';
import { updateFallingLogic } from './debug/debug-falling';
import { updateLavaDamageLogic } from './debug/debug-lava';
import { updateSwimmingLogic } from './debug/debug-swimming';
import { DebugSpellcasting } from './debug/debug-spellcasting';
import { setupDebugBlocking } from './debug/debug-blocking';
import { SCENE_KEYS } from './scene-keys';
import { Tile } from '../ground/tile';
import { GameProgression } from '../progression/game-progression';
import { GAME_STATES } from '../components/state-machine/states/game/game-state-keys';

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
    #progression!: GameProgression;
    #playerMapCollider!: Phaser.Physics.Arcade.Collider;
    #playerChestCollider!: Phaser.Physics.Arcade.Collider;
    #playerMobCollider!: Phaser.Physics.Arcade.Collider;
    #playerCritterCollider!: Phaser.Physics.Arcade.Collider;
    #isGameplayReady = false;

    constructor() {
        super('game-scene');
    }

    get player(): Player {
        return this.#player;
    }

    get earth(): Earth {
        return this.#earth;
    }

    get controls(): KeyboardComponent {
        return this.#controls;
    }

    get chestArray(): ChestJJK[] {
        return this.#chests;
    }

    get chestJJKGroup(): Phaser.GameObjects.Group {
        return this.#chestJJKGroup;
    }

    create() {
        this.#resetSceneState();

        console.debug('[GameScene] create start', {
            isDebugMode: DataManager.instance.data.isDebugMode,
            uiSceneActive: this.scene.isActive(SCENE_KEYS.UI_SCENE),
            uiSceneSleeping: this.scene.isSleeping(SCENE_KEYS.UI_SCENE),
        });

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
        console.debug('[GameScene] UI scene launched', {
            uiSceneActive: this.scene.isActive(SCENE_KEYS.UI_SCENE),
            uiSceneSleeping: this.scene.isSleeping(SCENE_KEYS.UI_SCENE),
        });

        // Common setup that applies to both debug and progression paths.
        this.#registerColliders();
        this.#debugSpellcasting = new DebugSpellcasting(this, this.#enemyGroup!, this.#critterGroup!);
        this.#isGameplayReady = true;

        this.#progression = new GameProgression(this);

        if (DataManager.instance.data.isDebugMode) {
            console.debug('[GameScene] debug mode detected, bypassing progression help');
            // Debug bypass: GameProgression is constructed (so PLAYER_DEFEATED
            // routing exists if ever needed) but `start()` is never called, so
            // no game state is active and no narrator/listener side-effects fire.
            this.#startDebugGameplay();
            return;
        }

        // Progression-driven start: hide player until StartState reveals it.
        this.#player.setVisible(false);
        this.#player.setActive(false);
        this.#controls.isMovementLocked = true;
        this.#progression.start(GAME_STATES.START);
    }

    #resetSceneState(): void {
        this.#enemyGroup = undefined;
        this.#critterGroup = undefined;
        this.#chests = [];
        this.#isGameplayReady = false;
    }

    update() {
        if (!this.#isGameplayReady) {
            return;
        }

        this.#progression?.update();

        this.#enemyGroup?.getChildren().forEach((enemy) => {
            enemy.update();
        });
        this.#critterGroup?.getChildren().forEach((critter) => {
            critter.update();
        });

        updateFallingLogic(this.#player, this.#earth);
        updateSwimmingLogic(this.#player, this.#earth);
        updateLavaDamageLogic(this.#player, this.#earth);

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
        this.physics.world.removeCollider(this.#playerCritterCollider);
    }

    #setupPlayer(): void {
        const currentData = DataManager.instance.data;
        DataManager.instance.data = {
            currentHealth: 2,
            maxHealth: 2,
            currentPower: 1,
            maxPower: 1,
            currentProgress: 0,
            maxProgress: 0,
            currentLivingCreatures: 0,
            maxLivingCreaturesThisGame: 0,
            sex: currentData.sex ?? SEX.MALE,
            gear: GEAR.NONE,
            weapon: WEAPON.NONE,
            potion: POTION.NONE,
            lastDialogOptionSelected: 0,
            languageIsDanish: currentData.languageIsDanish ?? false,
            isDebugMode: currentData.isDebugMode ?? false,
            difficulty: currentData.difficulty ?? 'Easy',
        };
        this.#player = new Player({
            scene: this,
            position: this.#playerStartPosition,
            controls: this.#controls,
            maxLife: 2,
            currentLife: 2
        });
        this.#controls.isMovementLocked = true;

    }

    #setupCamera(): void {
        this.cameras.main.setBounds(0, 0, 64000, 64000);
        this.cameras.main.startFollow(this.#player);
    }

    #registerColliders(): void {
        // collision between player and blocking map geometry (treetrunks, stones, etc.)
        const blockingGeometryGroup = this.#earth.getBlockingGeometryGroup();
        this.#playerMapCollider = this.physics.add.collider(this.#player, blockingGeometryGroup);

        // register collisions between player and JJKChest game objects
        this.#playerChestCollider = this.physics.add.collider(this.#player, this.#chestJJKGroup, (_player, chest) => {
            // add chest game object to players collision list
            this.#player.collidedWithGameObject(chest as GameObject2);
        });

        // register collisions between enemies and the player.
        this.#playerMobCollider = this.physics.add.overlap(this.#player, this.#enemyGroup!, (_player, enemy) => {
            const enemyObj = enemy as CharacterGameObject;
            this.#player.hit(DIRECTION.DOWN, enemyObj.contactDamage);
        });

        // critters (passive animals) collide with the player and bounce away without damaging the player.
        this.#playerCritterCollider = this.physics.add.collider(this.#player, this.#critterGroup!);

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

        // enemies and critters bounce against blocking map geometry.
        this.physics.add.collider(this.#enemyGroup!, blockingGeometryGroup);
        this.physics.add.collider(this.#critterGroup!, blockingGeometryGroup);

        // register overlap enemies and void tiles from map, so enemies can avoid falling into void.
        this.physics.add.collider(this.#enemyGroup!, this.#earth.getVoidLayer(), (_enemy, _voidTile) => {
            //const enemyObj = enemy as CharacterGameObject; enemyObj.hit(DIRECTION.DOWN, 999); currently enemies do not take damage from bumping into the void.
        });

        // critters also avoid falling into void tiles.
        this.physics.add.collider(this.#critterGroup!, this.#earth.getVoidLayer());
    }

    #registerCustomEvents(): void {
        console.debug('[GameScene] registering custom events');

        EVENT_BUS.on(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);
        //EVENT_BUS.on(CUSTOM_EVENTS.ENEMY_DESTROYED, this.#checkForAllEnemiesAreDefeated, this);
        EVENT_BUS.on(CUSTOM_EVENTS.PLAYER_DEFEATED, this.#handlePlayerDefeatedEvent, this);
        EVENT_BUS.on(CUSTOM_EVENTS.CHEST_DIALOG_CLOSED, this.#handleChestDialogClosed, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            console.debug('[GameScene] shutdown cleanup');
            EVENT_BUS.off(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);
            //EVENT_BUS.off(CUSTOM_EVENTS.ENEMY_DESTROYED, this.#checkForAllEnemiesAreDefeated, this);
            EVENT_BUS.off(CUSTOM_EVENTS.PLAYER_DEFEATED, this.#handlePlayerDefeatedEvent, this);
            EVENT_BUS.off(CUSTOM_EVENTS.CHEST_DIALOG_CLOSED, this.#handleChestDialogClosed, this);
            this.scene.stop(SCENE_KEYS.UI_SCENE);
        });
    }

    #startDebugGameplay(): void {
        //console.debug('[GameScene] startDebugGameplay');

        const firstTilePosition = this.placeStartingTile();
        //console.debug('[GameScene] starting tile placed', firstTilePosition);

        this.#chests = setupDebugChests(this, this.#earth, firstTilePosition, this.#chestJJKGroup);
        setupDebugBlocking(this, this.#earth, firstTilePosition);
        spawnDebugEnemies(this, this.#enemyGroup!, this.#critterGroup!, this.#earth, firstTilePosition);
        this.#earth.AddVoidMarkerTile(firstTilePosition.x + 5, firstTilePosition.y + 3);
        this.#earth.AddVoidMarkerTile(firstTilePosition.x + 5, firstTilePosition.y + 4);
        this.#earth.AddVoidMarkerTile(firstTilePosition.x + 6, firstTilePosition.y + 3);
        this.#earth.AddVoidMarkerTile(firstTilePosition.x + 6, firstTilePosition.y + 4);
        //Tmp test of fruitPotionChest
        const fruitChestTile = new Tile({
            tilenumber: { x: firstTilePosition.x + 7, y: firstTilePosition.y },
            biome: BIOME.FOREST,
        });
        this.#earth.AddTile(fruitChestTile);
        addChest({ x: firstTilePosition.x + 7, y: firstTilePosition.y }, this, this.#chests, this.#chestJJKGroup, 7);
        //Tmp test of bigTree
        //this.#earth.placeGardenTiles();

        this.#controls.isMovementLocked = false;
        //console.debug('[GameScene] debug gameplay ready');
    }

    /** Place the very first tile under the player start position. Returns its tile coordinates. */
    public placeStartingTile(): Position {
        return this.#earth.placeStartingTile(this.#playerStartPosition);
    }

    /** Make the player visible and active in the world. Movement remains gated by `controls`. */
    public revealPlayer(): void {
        this.#player.setVisible(true);
        this.#player.setActive(true);
    }

    public unlockPlayerMovement(): void {
        this.#controls.isMovementLocked = false;
    }

    public lockPlayerMovement(): void {
        this.#controls.isMovementLocked = true;
    }

    /** When enabled, casting plays a quieter cue + animation but places no
     *  tiles or mobs. Used by the FirstTileState during the scripted intro. */
    public setLimitedCast(enabled: boolean): void {
        this.#debugSpellcasting.isLimitedCastEnabled = enabled;
    }

    /** Place the fruit potion chest (chest #7) on a forest tile near the big tree. */
    public placeFruitChestNearBigTree(): void {
        const first = this.#earth.getFirstTilePosition();
        if (!first) {
            console.warn('[GameScene] placeFruitChestNearBigTree called before starting tile placed');
            return;
        }
        const tilePos = { x: first.x + 1, y: first.y };
        const tile = new Tile({ tilenumber: tilePos, biome: BIOME.FOREST });
        this.#earth.AddTile(tile);
        addChest(tilePos, this, this.#chests, this.#chestJJKGroup, 7);
    }

    #handlePlayerDefeatedEvent(): void {
        //ToDo: show game over
    }

    #handleChestDialogClosed(): void {
        let d = DataManager.instance.data;
        const dialogResultInfo = d.lastDialogResultInfo;
        //console.debug(`Dialog closed, Player: ${d.sex} ${d.gear} ${d.weapon}, last option selected: ${d.lastDialogOptionSelected}, dialog result info: ${JSON.stringify(dialogResultInfo)}`);
        if (dialogResultInfo) {
            const chest = this.#getChestById(dialogResultInfo.chestNumber);
            if (!chest) {
                console.warn(`Unable to apply chest dialog result. Chest id ${dialogResultInfo.chestNumber} was not found.`);
                DataManager.instance.data = d;
                return;
            }
            // Handle fruit potion chest.
            if(dialogResultInfo.chestNumber===7){
                //console.debug('Applying potion result from chest dialog');
                if (d.lastDialogOptionSelected === 0) {
                    d.potion = dialogResultInfo.option1PotionToPlayer;
                    // Boost max health to 6 (3 full hearts) and fully heal. Only apply when
                    // not already maxed, to avoid redundant HUD churn. The potion is
                    // unlimited in this chest, so chest contents are not cleared.
                    if (d.maxHealth < 6) {
                        this.#player.lifeComponent.setMaxLife(6, true);
                        d.maxHealth = 6;
                        DataManager.instance.data = d;
                        DataManager.instance.updatePlayerMaxHealth(6);
                        // Animate the HUD filling one half-heart at a time instead of
                        // snapping straight to full. Each step emits PLAYER_HEALTH_UPDATED
                        // (INCREASE) which redraws the meter against the new maxHealth.
                        this.#animateHealthGainTo(6);
                        return;
                    }
                } else {
                    // Opted not to eat/drink, do nothing.
                }
                DataManager.instance.data = d;
                return;
            }
            // handle regular chest with weapon and gear options.
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

    /** Step current health up by one half-heart per `stepDelayMs` until reaching `target`.
     *  Each step emits PLAYER_HEALTH_UPDATED so the HUD redraws incrementally. */
    #animateHealthGainTo(target: number, stepDelayMs = 120): void {
        const tick = () => {
            const cur = DataManager.instance.data.currentHealth;
            if (cur >= target) {
                return;
            }
            DataManager.instance.updatePlayerCurrentHealth(cur + 1);
            if (cur + 1 < target) {
                this.time.delayedCall(stepDelayMs, tick);
            }
        };
        tick();
    }

    #handleOpenChest(chest: ChestJJK): void {

        const chestInfo = writeChestDialogInfo(chest);
        DataManager.instance.data = {
            ...DataManager.instance.data,
            lastDialogResultInfo: chestInfo,
        };
        EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_CHEST_DIALOG, chestInfo.dialog);
    }

}
