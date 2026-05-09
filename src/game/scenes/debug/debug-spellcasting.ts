import * as Phaser from 'phaser';
import { Player } from '../../game-objects/player/player';
import { Lamb } from '../../game-objects/enemies/lamb';
import { Chicken } from '../../game-objects/enemies/chicken';
import { Spider } from '../../game-objects/enemies/spider';
import { CastingFeedback, Earth, EarthCastingConfig } from '../../ground/earth';
import { Direction, Position } from '../../common/types';
import { BIOME } from '../../common/common';
import { LEVEL_UP_TILE_THRESHOLDS, PLAYER_SPEED, TILES_BEFORE_DECORATION_UNLOCK, TILES_BEFORE_BLOCKING_UNLOCK, TILES_BEFORE_ANIMAL_UNLOCK } from '../../common/config';
import { DataManager } from '../../common/data-manager';
import { CUSTOM_EVENTS, EVENT_BUS, type TilesPlacedUpdated } from '../../common/event-bus';

type MagicFlagKey = {
    [Key in keyof EarthCastingConfig]: EarthCastingConfig[Key] extends boolean ? Key : never;
}[keyof EarthCastingConfig];

type FeedbackCountKey = {
    [Key in keyof CastingFeedback]: CastingFeedback[Key] extends number ? Key : never;
}[keyof CastingFeedback];

type CastVector = {
    x: number;
    y: number;
};

type BiomeProgressionRule = {
    unlockedKey?: MagicFlagKey;
    tilesPlacedKey: FeedbackCountKey;
    decorationUnlockedKey: MagicFlagKey;
    decorationsPlacedKey: FeedbackCountKey;
    blockingUnlockedKey: MagicFlagKey;
    blockingPlacedKey: FeedbackCountKey;
    chestPlacableKey: MagicFlagKey;
    chestPlacedKey: MagicFlagKey;
    unlockOnBlockingKeys: MagicFlagKey[];
    animalUnlockKey: MagicFlagKey;
};

const CHEST_PROGRESS_FLAGS: Record<number, { placedKey: MagicFlagKey; placableKey: MagicFlagKey }> = {
    1: { placedKey: 'isChest1Placed', placableKey: 'isChest1Placable' },
    2: { placedKey: 'isChest2Placed', placableKey: 'isChest2Placable' },
    3: { placedKey: 'isChest3Placed', placableKey: 'isChest3Placable' },
    4: { placedKey: 'isChest4Placed', placableKey: 'isChest4Placable' },
    5: { placedKey: 'isChest5Placed', placableKey: 'isChest5Placable' },
    6: { placedKey: 'isChest6Placed', placableKey: 'isChest6Placable' },
};

const BIOME_PROGRESSIONS: BiomeProgressionRule[] = [
    {
        tilesPlacedKey: 'rockTilesPlaced',
        decorationUnlockedKey: 'isRockDecorationUnlocked',
        decorationsPlacedKey: 'rockDecorationsPlaced',
        blockingUnlockedKey: 'isRockBlockingUnlocked',
        blockingPlacedKey: 'rockBlockingPlaced',
        chestPlacableKey: 'isChest1Placable',
        chestPlacedKey: 'isChest1Placed',
        animalUnlockKey: 'isRockAnimalsUnlocked',
        unlockOnBlockingKeys: ['isDesertUnlocked'],
    },
    {
        unlockedKey: 'isDesertUnlocked',
        tilesPlacedKey: 'desertTilesPlaced',
        decorationUnlockedKey: 'isDesertDecorationUnlocked',
        decorationsPlacedKey: 'desertDecorationsPlaced',
        blockingUnlockedKey: 'isDesertBlockingUnlocked',
        blockingPlacedKey: 'desertBlockingPlaced',
        chestPlacableKey: 'isChest2Placable',
        chestPlacedKey: 'isChest2Placed',
        animalUnlockKey: 'isDesertAnimalsUnlocked',
        unlockOnBlockingKeys: ['isGrassUnlocked', 'isWaterUnlocked'],
    },
    {
        unlockedKey: 'isGrassUnlocked',
        tilesPlacedKey: 'grassTilesPlaced',
        decorationUnlockedKey: 'isGrassDecorationUnlocked',
        decorationsPlacedKey: 'grassDecorationsPlaced',
        blockingUnlockedKey: 'isGrassBlockingUnlocked',
        blockingPlacedKey: 'grassBlockingPlaced',
        chestPlacableKey: 'isChest3Placable',
        chestPlacedKey: 'isChest3Placed',
        animalUnlockKey: 'isGrassAnimalsUnlocked',
        unlockOnBlockingKeys: ['isForestUnlocked'],
    },
    {
        unlockedKey: 'isForestUnlocked',
        tilesPlacedKey: 'forestTilesPlaced',
        decorationUnlockedKey: 'isForestDecorationUnlocked',
        decorationsPlacedKey: 'forestDecorationsPlaced',
        blockingUnlockedKey: 'isForestBlockingUnlocked',
        blockingPlacedKey: 'forestBlockingPlaced',
        chestPlacableKey: 'isChest4Placable',
        chestPlacedKey: 'isChest4Placed',
        animalUnlockKey: 'isForestAnimalsUnlocked',
        unlockOnBlockingKeys: ['isSwampUnlocked', 'isMountainUnlocked'],
    },
    {
        unlockedKey: 'isSwampUnlocked',
        tilesPlacedKey: 'swampTilesPlaced',
        decorationUnlockedKey: 'isSwampDecorationUnlocked',
        decorationsPlacedKey: 'swampDecorationsPlaced',
        blockingUnlockedKey: 'isSwampBlockingUnlocked',
        blockingPlacedKey: 'swampBlockingPlaced',
        chestPlacableKey: 'isChest5Placable',
        chestPlacedKey: 'isChest5Placed',
        animalUnlockKey: 'isSwampAnimalsUnlocked',
        unlockOnBlockingKeys: ['isCrystalUnlocked'],
    },
    {
        unlockedKey: 'isCrystalUnlocked',
        tilesPlacedKey: 'crystalTilesPlaced',
        decorationUnlockedKey: 'isCrystalDecorationUnlocked',
        decorationsPlacedKey: 'crystalDecorationsPlaced',
        blockingUnlockedKey: 'isCrystalBlockingUnlocked',
        blockingPlacedKey: 'crystalBlockingPlaced',
        chestPlacableKey: 'isChest6Placable',
        chestPlacedKey: 'isChest6Placed',
        animalUnlockKey: 'isCrystalAnimalsUnlocked',
        unlockOnBlockingKeys: ['isLavaUnlocked'],
    },
];

export class DebugSpellcasting {

    #playerCurrentMagic: EarthCastingConfig = {
        isRockDecorationUnlocked: false,
        isRockBlockingUnlocked: false,
        isRockAnimalsUnlocked: false,
        isChest1Placable: false,
        isChest1Placed: false,
        isDesertUnlocked: false,
        isDesertDecorationUnlocked: false,
        isDesertBlockingUnlocked: false,
        isDesertAnimalsUnlocked: false,
        isChest2Placable: false,
        isChest2Placed: false,
        isGrassUnlocked: false,
        isGrassDecorationUnlocked: false,
        isGrassBlockingUnlocked: false,
        isGrassAnimalsUnlocked: false,
        isChest3Placable: false,
        isChest3Placed: false,
        isForestUnlocked: false,
        isForestDecorationUnlocked: false,
        isForestBlockingUnlocked: false,
        isForestAnimalsUnlocked: false,
        isChest4Placable: false,
        isChest4Placed: false,
        isSwampUnlocked: false,
        isSwampDecorationUnlocked: false,
        isSwampBlockingUnlocked: false,
        isSwampAnimalsUnlocked: false,
        isChest5Placable: false,
        isChest5Placed: false,
        isCrystalUnlocked: false,
        isCrystalDecorationUnlocked: false,
        isCrystalBlockingUnlocked: false,
        isCrystalAnimalsUnlocked: false,
        isChest6Placable: false,
        isChest6Placed: false,
        isWaterUnlocked: false,
        isWaterAnimalsUnlocked: false,
        isLavaUnlocked: false,
        isMountainUnlocked: false,
        powerLevel: 1,
    };

    #spellSound: Phaser.Sound.BaseSound;
    #levelUpSound: Phaser.Sound.BaseSound;
    #previousStateName: string | undefined;
    #castingFeedbackTotals: CastingFeedback = this.createEmptyCastingFeedback();
    #enemyGroup: Phaser.GameObjects.Group;
    #critterGroup: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, enemyGroup: Phaser.GameObjects.Group, critterGroup: Phaser.GameObjects.Group) {
        this.#enemyGroup = enemyGroup;
        this.#critterGroup = critterGroup;
        this.#spellSound = scene.sound.add('spellnotes1', { volume: 0.9 });
        this.#levelUpSound = scene.sound.add('levelup', { volume: 0.9 });
        //If debug mode is on then ease progression to save test time.
        if (DataManager.instance.data.isDebugMode) {
            this.#playerCurrentMagic.isLavaUnlocked = true;
            this.#playerCurrentMagic.powerLevel = 5;
            DataManager.instance.updatePlayerCurrentPower(this.#playerCurrentMagic.powerLevel);
        }
    }

    update(scene: Phaser.Scene, player: Player, earth: Earth): void {
        const currentStateName = player.stateMachine.currentStateName;
        if (this.shouldCast(currentStateName)) {
            this.cast(scene, player, earth);
        }

        this.#previousStateName = currentStateName;
    }

    private shouldCast(currentStateName: string | undefined): boolean {
        return currentStateName === 'ATTACK_STATE' &&
            this.#previousStateName !== 'ATTACK_STATE' &&
            this.#previousStateName !== 'SWIM_STATE';
    }

    private cast(scene: Phaser.Scene, player: Player, earth: Earth): void {
        if (this.#spellSound.isPlaying === false) {
            this.#spellSound.play();
        }

        const directions = player.getLastMoveDirections();
        const travelVector = this.getCastTravelVector(directions);
        this.playSpellEffect(scene, player, travelVector);

        const casterPosition = earth.getTileXYFromScreenCoordinates(player.x, player.y, true);
        const targetPosition = this.getTargetPosition(casterPosition, directions);

        console.log('Casting spell magic:', JSON.stringify(this.#playerCurrentMagic, null, 2));
        const feedback = earth.AddTiles(this.#playerCurrentMagic, casterPosition, targetPosition, directions);
        console.log('Casting spell feedback:', JSON.stringify(feedback, null, 2));

        this.applyCastingFeedback(feedback);
        this.tryPlaceMob(scene, player, earth);//ToDo: Replace with actual animal placement logic once more animals are added and the logic is decoupled from debug spellcasting.
    }

    private tryPlaceMob(scene: Phaser.Scene, player: Player, earth: Earth): void {
        const animalBiome = this.pickAnimalBiome(this.#playerCurrentMagic);
        if (animalBiome === null) {
            return;
        }

        if (Phaser.Math.Between(0, 1) === 0) {
            return;
        }

        const animalTilePosition = earth.getTileXYFromScreenCoordinates(player.x, player.y, false);
        animalTilePosition.y--; // Place the animal on the tile above the player for testing purposes.

        const animalTile = earth.getTile(animalTilePosition.x, animalTilePosition.y);
        if (animalTile === undefined || animalTile.biome === BIOME.VOID) {
            return;
        }

        const mobPosition = this.getTileCenterPosition(animalTilePosition);
        switch (Phaser.Math.Between(0, 2)) {
            case 0: {
                console.log(`New lamb from ${animalBiome} biome is now placable!`);
                const lamb = new Lamb({
                    scene,
                    position: mobPosition,
                });
                lamb.enableObject();
                this.#critterGroup.add(lamb);
                DataManager.instance.increaseLivingCreatureCount();
                break;
            }
            case 1: {
                console.log(`New chicken from ${animalBiome} biome is now placable!`);
                const chicken = new Chicken({
                    scene,
                    position: mobPosition,
                });
                chicken.enableObject();
                this.#critterGroup.add(chicken);
                DataManager.instance.increaseLivingCreatureCount();
                break;
            }
            case 2: {
                console.log(`New spider from ${animalBiome} biome is now placable!`);
                const spider = new Spider({
                    scene,
                    position: mobPosition,
                });
                spider.enableObject();
                this.#enemyGroup.add(spider);
                DataManager.instance.increaseLivingCreatureCount();
                break;
            }
        }
    }

    private pickAnimalBiome(magicState: EarthCastingConfig): BIOME | null {
        if (magicState.isRockAnimalsUnlocked) {
            return BIOME.ROCK;
        }

        return null;
    }

    private getTileCenterPosition(tilePosition: Position): Position {
        return {
            x: tilePosition.x * 64 + 32,
            y: tilePosition.y * 64 + 32,
        };
    }

    private getCastTravelVector(directions: Direction[]): CastVector {
        const travelVector: CastVector = { x: 0, y: 0 };
        for (const direction of directions) {
            switch (direction) {
                case 'UP': travelVector.y -= PLAYER_SPEED; break;
                case 'DOWN': travelVector.y += PLAYER_SPEED; break;
                case 'LEFT': travelVector.x -= PLAYER_SPEED; break;
                case 'RIGHT': travelVector.x += PLAYER_SPEED; break;
            }
        }
        return travelVector;
    }

    private playSpellEffect(scene: Phaser.Scene, player: Player, travelVector: CastVector): void {
        const spell = scene.add
            .sprite(player.x + travelVector.x / 10, player.y + travelVector.y / 10, 'spell-music-11')
            .setScale(0.5)
            .setOrigin(0.5, 0.5);

        spell.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        spell.play('spell-music-anim');
        scene.tweens.add({
            targets: spell,
            x: spell.x + travelVector.x,
            y: spell.y + travelVector.y,
            duration: 1500,
            ease: 'Sine.easeOut',
            onComplete: () => spell.destroy(),
        });
        spell.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            spell.destroy();
        });
    }

    private getTargetPosition(casterPosition: Position, directions: Direction[]): Position {
        const targetPosition = { x: casterPosition.x, y: casterPosition.y };
        for (const direction of directions) {
            switch (direction) {
                case 'UP': targetPosition.y -= 1; break;
                case 'DOWN': targetPosition.y += 1; break;
                case 'LEFT': targetPosition.x -= 1; break;
                case 'RIGHT': targetPosition.x += 1; break;
            }
        }
        return targetPosition;
    }

    private applyCastingFeedback(feedback: CastingFeedback): void {
        this.applyChestPlacement(feedback.chestNumberPlaced);
        this.addCastingFeedbackToTotals(feedback);
        this.applyBiomeProgression(this.#castingFeedbackTotals);
        this.applyPowerLevelProgression(this.#castingFeedbackTotals);
        this.emitTilesPlaced();
    }

    private emitTilesPlaced(): void {
        const payload: TilesPlacedUpdated = {
            totalPlacedTiles: this.getPlacedTileCount(this.#castingFeedbackTotals),
        };
        EVENT_BUS.emit(CUSTOM_EVENTS.TILES_PLACED, payload);
    }

    private createEmptyCastingFeedback(): CastingFeedback {
        return {
            rockTilesPlaced: 0,
            rockDecorationsPlaced: 0,
            rockBlockingPlaced: 0,
            desertTilesPlaced: 0,
            desertDecorationsPlaced: 0,
            desertBlockingPlaced: 0,
            grassTilesPlaced: 0,
            grassDecorationsPlaced: 0,
            grassBlockingPlaced: 0,
            forestTilesPlaced: 0,
            forestDecorationsPlaced: 0,
            forestBlockingPlaced: 0,
            swampTilesPlaced: 0,
            swampDecorationsPlaced: 0,
            swampBlockingPlaced: 0,
            crystalTilesPlaced: 0,
            crystalDecorationsPlaced: 0,
            crystalBlockingPlaced: 0,
            waterTilesPlaced: 0,
            lavaTilesPlaced: 0,
            mountainTilesPlaced: 0,
            chestNumberPlaced: undefined,
        };
    }

    private addCastingFeedbackToTotals(feedback: CastingFeedback): void {
        this.#castingFeedbackTotals.rockTilesPlaced += feedback.rockTilesPlaced;
        this.#castingFeedbackTotals.rockDecorationsPlaced += feedback.rockDecorationsPlaced;
        this.#castingFeedbackTotals.rockBlockingPlaced += feedback.rockBlockingPlaced;
        this.#castingFeedbackTotals.desertTilesPlaced += feedback.desertTilesPlaced;
        this.#castingFeedbackTotals.desertDecorationsPlaced += feedback.desertDecorationsPlaced;
        this.#castingFeedbackTotals.desertBlockingPlaced += feedback.desertBlockingPlaced;
        this.#castingFeedbackTotals.grassTilesPlaced += feedback.grassTilesPlaced;
        this.#castingFeedbackTotals.grassDecorationsPlaced += feedback.grassDecorationsPlaced;
        this.#castingFeedbackTotals.grassBlockingPlaced += feedback.grassBlockingPlaced;
        this.#castingFeedbackTotals.forestTilesPlaced += feedback.forestTilesPlaced;
        this.#castingFeedbackTotals.forestDecorationsPlaced += feedback.forestDecorationsPlaced;
        this.#castingFeedbackTotals.forestBlockingPlaced += feedback.forestBlockingPlaced;
        this.#castingFeedbackTotals.swampTilesPlaced += feedback.swampTilesPlaced;
        this.#castingFeedbackTotals.swampDecorationsPlaced += feedback.swampDecorationsPlaced;
        this.#castingFeedbackTotals.swampBlockingPlaced += feedback.swampBlockingPlaced;
        this.#castingFeedbackTotals.crystalTilesPlaced += feedback.crystalTilesPlaced;
        this.#castingFeedbackTotals.crystalDecorationsPlaced += feedback.crystalDecorationsPlaced;
        this.#castingFeedbackTotals.crystalBlockingPlaced += feedback.crystalBlockingPlaced;
        this.#castingFeedbackTotals.waterTilesPlaced += feedback.waterTilesPlaced;
        this.#castingFeedbackTotals.lavaTilesPlaced += feedback.lavaTilesPlaced;
        this.#castingFeedbackTotals.mountainTilesPlaced += feedback.mountainTilesPlaced;
    }

    private applyChestPlacement(chestNumberPlaced: number | undefined): void {
        if (chestNumberPlaced === undefined || chestNumberPlaced <= 0) {
            return;
        }

        const chestProgressFlags = CHEST_PROGRESS_FLAGS[chestNumberPlaced];
        if (!chestProgressFlags) {
            return;
        }

        //ToDo play chest sound (this.#chestSound.isPlaying === false) { this.#chestSound.play(); }
        this.setMagicFlag(chestProgressFlags.placedKey, true);
        this.setMagicFlag(chestProgressFlags.placableKey, false);
    }

    private applyBiomeProgression(feedback: CastingFeedback): void {
        for (const progression of BIOME_PROGRESSIONS) {
            // Skip biomes that are still locked; rock has no unlock flag and is always active.
            if (progression.unlockedKey !== undefined && !this.getMagicFlag(progression.unlockedKey)) {
                continue;
            }

            // Tile placement unlocks decorations for the current biome.
            if (feedback[progression.tilesPlacedKey] > TILES_BEFORE_DECORATION_UNLOCK) {
                this.setMagicFlag(progression.decorationUnlockedKey, true);
            }

            // Blocking placement unlocks animals and enemies for the current biome.
            if (feedback[progression.blockingPlacedKey] >= TILES_BEFORE_ANIMAL_UNLOCK) {
                this.setMagicFlag(progression.animalUnlockKey, true);
            }

            // Decoration placement is the gate for blocking tiles, chests, and the next biome unlocks.
            if (feedback[progression.decorationsPlacedKey] <= TILES_BEFORE_BLOCKING_UNLOCK || this.getMagicFlag(progression.blockingUnlockedKey)) {
                continue;
            }

            this.setMagicFlag(progression.blockingUnlockedKey, true);
            if (!this.getMagicFlag(progression.chestPlacedKey)) {
                this.setMagicFlag(progression.chestPlacableKey, true);
            }

            // Opening blocking progression also reveals the biome branches that follow it.
            for (const unlockKey of progression.unlockOnBlockingKeys) {
                this.setMagicFlag(unlockKey, true);
            }
        }
    }

    private applyPowerLevelProgression(feedback: CastingFeedback): void {
        const placedTileCount = this.getPlacedTileCount(feedback);
        const debugDivider = DataManager.instance.data.isDebugMode ? 10 : 2;
        const levelUpThreshold = LEVEL_UP_TILE_THRESHOLDS[this.#playerCurrentMagic.powerLevel];
        if (levelUpThreshold === undefined || placedTileCount < levelUpThreshold / debugDivider) {
            return;
        }

        this.#playerCurrentMagic.powerLevel++;
        DataManager.instance.updatePlayerCurrentPower(this.#playerCurrentMagic.powerLevel);
        if (this.#levelUpSound.isPlaying === false) {
            this.#levelUpSound.play();
        }
    }

    private getPlacedTileCount(feedback: CastingFeedback): number {
        return feedback.rockTilesPlaced +
            feedback.desertTilesPlaced +
            feedback.grassTilesPlaced +
            feedback.forestTilesPlaced +
            feedback.swampTilesPlaced +
            feedback.crystalTilesPlaced +
            feedback.lavaTilesPlaced +
            feedback.waterTilesPlaced +
            feedback.mountainTilesPlaced;
    }

    private getMagicFlag(key: MagicFlagKey): boolean {
        return this.#playerCurrentMagic[key];
    }

    private setMagicFlag(key: MagicFlagKey, value: boolean): void {
        this.#playerCurrentMagic[key] = value;
    }
}
