import * as Phaser from 'phaser';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Earth } from '../ground/earth';
import { WEAPON, GEAR, DIRECTION, BIOME } from '../common/common';
import {
    CUSTOM_EVENTS,
    EVENT_BUS,
    registerEventBusListenersUntilShutdown,
} from '../common/event-bus';
import { ChestJJK } from '../game-objects/objects/chestJJK';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { GameObject2, Position } from '../common/types';
import { GameDataManager } from '../common/game-data-manager';
import { writeChestDialogInfo } from '../common/chest-dialog';
import { setupDebugChests } from './debug/debug-chests';
import { spawnDebugEnemies } from './debug/debug-enemies';
import { updateFallingLogic } from '../systems/falling-system';
import { updateLavaDamageLogic } from '../systems/lava-damage-system';
import { updateSwimmingLogic } from '../systems/swimming-system';
import { SpellCastingService } from '../spellcasting/spell-casting-service';
import { setupDebugBlocking } from './debug/debug-blocking';
import { SCENE_KEYS } from './scene-keys';
import { Tile } from '../ground/tile';
import { GameProgression } from '../progression/game-progression';
import { GAME_STATES } from '../components/state-machine/states/game/game-state-keys';
import { ChestSpawnService } from '../spawning/chest-spawn-service';
import { AnimalSpawnService } from '../spawning/animal-spawn-service';
import { ENABLE_LOGGING } from '../common/config';
import { ASSET_KEYS } from '../common/assets';

export class GameScene extends Phaser.Scene {

    addMob(endTile: Position, biome: BIOME) {
        this.#animalSpawn.spawnForBiome(endTile, biome);
    }

    addChest(position: Position, chestNumber: number) {
        this.#chestSpawn.spawn(position, chestNumber);
    }

    #controls!: KeyboardComponent;
    #player!: Player;
    #enemyGroup?: Phaser.GameObjects.Group;
    #critterGroup?: Phaser.GameObjects.Group;
    #earth!: Earth;
    #playerStartWorldPosition = { x: 32035, y: 32020 };
    #chestJJKGroup!: Phaser.GameObjects.Group;
    #chestSpawn!: ChestSpawnService;
    #animalSpawn!: AnimalSpawnService;
    #spellCasting!: SpellCastingService;
    #progression!: GameProgression;
    #colliders: Phaser.Physics.Arcade.Collider[] = [];
    #playerColliders: Phaser.Physics.Arcade.Collider[] = [];
    #isGameplayReady = false;

    constructor() {
        super('game-scene');
    }

    create() {
        this.#resetSceneState();
        if (!this.input.keyboard) { console.warn('Phaser keyboard plugin is not setup properly.'); return; }
        this.#controls = new KeyboardComponent(this.input.keyboard);
        this.#chestJJKGroup = this.add.group([]);
        this.#earth = new Earth(this, (position, chestNumber) => { this.addChest(position, chestNumber); });
        this.#earth.createMap(1000, 1000);
        this.#setupPlayer();
        this.#setupCamera();
        this.#enemyGroup = this.add.group();
        this.#critterGroup = this.add.group();
        this.#chestSpawn = new ChestSpawnService(this, this.#chestJJKGroup, this.#earth.getTileSize());
        this.#animalSpawn = new AnimalSpawnService(this, this.#enemyGroup, this.#critterGroup, this.#earth.getTileSize());
        this.#registerCustomEvents();
        this.scene.launch(SCENE_KEYS.UI_SCENE);
        // Common setup that applies to both debug and progression paths.
        this.#registerColliders();
        this.#spellCasting = new SpellCastingService(this, this.#earth);
        this.#isGameplayReady = true;

        this.#progression = new GameProgression(this);

        if (GameDataManager.instance.data.isDebugMode) {
            // Debug bypass: GameProgression is constructed (so PLAYER_DEFEATED
            // routing exists if ever needed) but `start()` is never called, so
            // no game state is active and no narrator/listener side-effects fire.
            // Unlock the map so it can be debugged without playing through progression.
            this.#progression.unlockMap();
            this.#startDebugGameplay();
            return;
        }

        // Progression-driven start: hide player until StartState reveals it.
        this.#player.setVisible(false);
        this.#player.setActive(false);
        this.#controls.isMovementLocked = true;
        this.#progression.start(GAME_STATES.START);
    }

    update() {
        if (!this.#isGameplayReady) { return; }

        if (this.#controls.isMapKeyJustDown &&
            this.#progression?.isMapUnlocked &&
            !this.#controls.isMovementLocked
        ) {
            this.#openMap();
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
    }

    #resetSceneState(): void {
        this.#removeAllColliders();
        this.#enemyGroup = undefined;
        this.#critterGroup = undefined;
        this.#isGameplayReady = false;
    }

    public removePlayerColliders(): void {
        this.#destroyColliders(this.#playerColliders);
        this.#colliders = this.#colliders.filter((collider) => !this.#playerColliders.includes(collider));
        this.#playerColliders = [];
    }

    #trackCollider(collider: Phaser.Physics.Arcade.Collider, removeWithPlayer = false): void {
        this.#colliders.push(collider);
        if (removeWithPlayer) {
            this.#playerColliders.push(collider);
        }
    }

    #removeAllColliders(): void {
        this.#destroyColliders(this.#colliders);
        this.#colliders = [];
        this.#playerColliders = [];
    }

    #destroyColliders(colliders: Phaser.Physics.Arcade.Collider[]): void {
        colliders.forEach((collider) => collider.destroy());
    }

    #setupPlayer(): void {
        GameDataManager.instance.resetForNewGame();
        this.#player = new Player({
            scene: this,
            position: this.#playerStartWorldPosition,
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

    public getPlayerStartWorldPosition(): Position {
        return { ...this.#playerStartWorldPosition };
    }

    #registerColliders(): void {
        // collision between player and blocking map geometry (treetrunks, stones, etc.)
        const blockingGeometryGroup = this.#earth.getBlockingGeometryGroup();
        this.#trackCollider(this.physics.add.collider(this.#player, blockingGeometryGroup), true);

        // register collisions between player and JJKChest game objects
        this.#trackCollider(this.physics.add.collider(this.#player, this.#chestJJKGroup, (_player, chest) => {
            // add chest game object to players collision list
            this.#player.collidedWithGameObject(chest as GameObject2);
        }), true);

        // register collisions between enemies and the player.
        this.#trackCollider(this.physics.add.overlap(this.#player, this.#enemyGroup!, (_player, enemy) => {
            const enemyObj = enemy as CharacterGameObject;
            if (enemyObj.contactDamage <= 0) {
                return;
            }
            this.#player.hit(DIRECTION.DOWN, enemyObj.contactDamage);
        }), true);

        // critters (passive animals) collide with the player and bounce away without damaging the player.
        this.#trackCollider(this.physics.add.collider(this.#player, this.#critterGroup!, () => {
            this.#playPlayerAnimalBumpSound();
        }), true);

        // register overlap between player weapon and enemies
        this.#trackCollider(this.physics.add.overlap(this.#player.weaponBody, this.#enemyGroup!, (_weaponBody, enemy) => {
            if (this.#player.isCasting) {
                return;
            }
            const enemyObj = enemy as CharacterGameObject;
            if (enemyObj.hit(this.#player.direction, this.#player.weaponDamage)) {
                this.#playWeaponHitSound();
            }
        }), true);

        // critters (passive mobs) can be hit by the player's weapon but do not damage the player on contact.
        this.#trackCollider(this.physics.add.overlap(this.#player.weaponBody, this.#critterGroup!, (_weaponBody, critter) => {
            if (this.#player.isCasting) {
                return;
            }
            const critterObj = critter as CharacterGameObject;
            if (critterObj.hit(this.#player.direction, this.#player.weaponDamage)) {
                this.#playWeaponHitSound();
            }
        }), true);

        // enemies and critters bounce against blocking map geometry.
        this.#trackCollider(this.physics.add.collider(this.#enemyGroup!, blockingGeometryGroup));
        this.#trackCollider(this.physics.add.collider(this.#critterGroup!, blockingGeometryGroup));

        // register overlap enemies and void tiles from map, so enemies can avoid falling into void.
        this.#trackCollider(this.physics.add.collider(this.#enemyGroup!, this.#earth.getVoidLayer(), (_enemy, _voidTile) => {
            //const enemyObj = enemy as CharacterGameObject; enemyObj.hit(DIRECTION.DOWN, 999); currently enemies do not take damage from bumping into the void.
        }));

        // critters also avoid falling into void tiles.
        this.#trackCollider(this.physics.add.collider(this.#critterGroup!, this.#earth.getVoidLayer()));
    }

    #playWeaponHitSound(): void {
        const weapon = GameDataManager.instance.data.weapon;
        const soundKey = weapon === WEAPON.DAGGER ? 'attack-dagger'
            : weapon === WEAPON.STAFF ? 'attack-staff'
                : weapon === WEAPON.SWORD ? 'attack-sword'
                    : 'attack-punch';
        const sound = this.sound.get(soundKey) ?? this.sound.add(soundKey);
        if (!sound.isPlaying) {
            sound.play();
        }
    }

    #playPlayerAnimalBumpSound(): void {
        const sound = this.sound.get(ASSET_KEYS.BUMP) ?? this.sound.add(ASSET_KEYS.BUMP);
        if (!sound.isPlaying) {
            sound.play();
        }
    }

    #registerCustomEvents(): void {
        if (ENABLE_LOGGING) { console.debug('[GameScene] registering custom events'); }

        registerEventBusListenersUntilShutdown(this, [
            { event: CUSTOM_EVENTS.OPENED_CHEST, listener: this.#handleOpenChest, context: this },
            { event: CUSTOM_EVENTS.PLAYER_DEFEATED, listener: this.#handlePlayerDefeatedEvent, context: this },
            { event: CUSTOM_EVENTS.CHEST_DIALOG_CLOSED, listener: this.#handleChestDialogClosed, context: this },
        ]);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#removeAllColliders();
            this.scene.stop(SCENE_KEYS.UI_SCENE);
        });
    }

    #startDebugGameplay(): void {

        const firstTilePosition = this.placeStartingTile();

        setupDebugChests(this.#earth, firstTilePosition, (position, chestNumber) => this.addChest(position, chestNumber));
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
        this.addChest({ x: firstTilePosition.x + 7, y: firstTilePosition.y }, 7);

        this.#controls.isMovementLocked = false;
    }

    /** Place the very first tile under the player start position. Returns its tile coordinates. */
    public placeStartingTile(): Position {
        const startTile = this.#earth.placeStartingTile(this.#playerStartWorldPosition);
        GameDataManager.instance.setStartTile(startTile);
        return startTile;
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

    #openMap(): void {
        this.scene.sleep(SCENE_KEYS.UI_SCENE);
        this.scene.launch(SCENE_KEYS.MAP_SCENE);
        this.scene.pause();
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
        this.addChest(tilePos, 7);
    }

    #handlePlayerDefeatedEvent(): void {
        //ToDo: show game over
    }

    #handleChestDialogClosed(): void {
        const dataManager = GameDataManager.instance;
        const dialogResultInfo = dataManager.getLastDialogResultInfo();
        const selectedOption = dataManager.getLastDialogOptionSelected();
        if (!dialogResultInfo) {
            return;
        }

        const chest = this.#getChestById(dialogResultInfo.chestNumber);
        if (!chest) {
            console.warn(`Unable to apply chest dialog result. Chest id ${dialogResultInfo.chestNumber} was not found.`);
            return;
        }

        // Handle fruit potion chest.
        if (dialogResultInfo.chestNumber === 7) {
            if (selectedOption === 0) {
                dataManager.updatePlayerPotion(dialogResultInfo.option1PotionToPlayer);
                // Boost max health to 6 (3 full hearts) and fully heal. Only apply when
                // not already maxed, to avoid redundant HUD churn. The potion is
                // unlimited in this chest, so chest contents are not cleared.
                if (dataManager.getMaxHealth() < 6) {
                    this.#player.lifeComponent.setMaxLife(6, true);
                    dataManager.updatePlayerMaxHealth(6);
                    // Animate the HUD filling one half-heart at a time instead of
                    // snapping straight to full. Each step emits PLAYER_HEALTH_UPDATED
                    // (INCREASE) which redraws the meter against the new maxHealth.
                    this.#animateHealthGainTo(6);
                }
            }
            return;
        }

        // handle regular chest with weapon and gear options.
        if (selectedOption === 0) {// Top Option Selected, can be either weapon or gear.
            // Weapons is in the top option
            if (!(dialogResultInfo.option1WeaponToPlayer === WEAPON.NONE && dialogResultInfo.option1WeaponToLeave === WEAPON.NONE)) {
                dataManager.updatePlayerWeapon(dialogResultInfo.option1WeaponToPlayer);
                chest.contents.weapon = dialogResultInfo.option1WeaponToLeave;
            }
            // Gear is in the top option
            if (!(dialogResultInfo.option1GearToPlayer === GEAR.NONE && dialogResultInfo.option1GearToLeave === GEAR.NONE)) {
                dataManager.updatePlayerGear(dialogResultInfo.option1GearToPlayer);
                chest.contents.gear = dialogResultInfo.option1GearToLeave;
            }
        }
        if (selectedOption === 1) {
            // Option 2 selected kan only be gear
            if (!(dialogResultInfo.option2GearToPlayer === GEAR.NONE && dialogResultInfo.option2GearToLeave === GEAR.NONE)) {
                dataManager.updatePlayerGear(dialogResultInfo.option2GearToPlayer);
                chest.contents.gear = dialogResultInfo.option2GearToLeave;
            }
        }
    }

    /** Step current health up by one half-heart per `stepDelayMs` until reaching `target`.
     *  Each step emits PLAYER_HEALTH_UPDATED so the HUD redraws incrementally. */
    #animateHealthGainTo(target: number, stepDelayMs = 120): void {
        const tick = () => {
            const cur = GameDataManager.instance.getCurrentHealth();
            if (cur >= target) {
                return;
            }
            GameDataManager.instance.updatePlayerCurrentHealth(cur + 1);
            if (cur + 1 < target) {
                this.time.delayedCall(stepDelayMs, tick);
            }
        };
        tick();
    }

    #handleOpenChest(chest: ChestJJK): void {
        const chestInfo = writeChestDialogInfo(chest);
        GameDataManager.instance.setLastDialogResultInfo(chestInfo);
        EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_CHEST_DIALOG, chestInfo.dialog);
    }

    // Getters  ------------------------------------

    #getChestById(chestId: number | undefined): ChestJJK | undefined {
        return this.#chestSpawn.getById(chestId);
    }

    public getChestGroup(): Phaser.GameObjects.Group {
        return this.#chestJJKGroup;
    }

    public getChestArray(): ChestJJK[] {
        return this.#chestSpawn.getAll();
    }

    public getBlockingGeometryGroup(): Phaser.GameObjects.Group {
        return this.#earth.getBlockingGeometryGroup();
    }

    get playerPosition(): Position {
        return { x: this.#player.x, y: this.#player.y };
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
        return this.#chestSpawn.getAll();
    }

    get chestJJKGroup(): Phaser.GameObjects.Group {
        return this.#chestJJKGroup;
    }

    get progression(): GameProgression {
        return this.#progression;
    }

    get spellCasting(): SpellCastingService {
        return this.#spellCasting;
    }

}
