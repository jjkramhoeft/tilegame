import * as Phaser from 'phaser';
import { Player } from '../../game-objects/player/player';
import { CastingFeedback, Earth, EarthCastingConfig } from '../../ground/earth';
import { Direction, Position } from '../../common/types';
import { LEVEL_UP_TILE_THRESHOLDS, PLAYER_SPEED, TILES_BEFORE_DECORATION_UNLOCK, TILES_BEFORE_BLOCKING_UNLOCK } from '../../common/config';
import { DataManager } from '../../common/data-manager';

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
    chestPlacableKey: MagicFlagKey;
    chestPlacedKey: MagicFlagKey;
    unlockOnBlockingKeys: MagicFlagKey[];
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
        chestPlacableKey: 'isChest1Placable',
        chestPlacedKey: 'isChest1Placed',
        unlockOnBlockingKeys: ['isDesertUnlocked'],
    },
    {
        unlockedKey: 'isDesertUnlocked',
        tilesPlacedKey: 'desertTilesPlaced',
        decorationUnlockedKey: 'isDesertDecorationUnlocked',
        decorationsPlacedKey: 'desertDecorationsPlaced',
        blockingUnlockedKey: 'isDesertBlockingUnlocked',
        chestPlacableKey: 'isChest2Placable',
        chestPlacedKey: 'isChest2Placed',
        unlockOnBlockingKeys: ['isGrassUnlocked', 'isWaterUnlocked'],
    },
    {
        unlockedKey: 'isGrassUnlocked',
        tilesPlacedKey: 'grassTilesPlaced',
        decorationUnlockedKey: 'isGrassDecorationUnlocked',
        decorationsPlacedKey: 'grassDecorationsPlaced',
        blockingUnlockedKey: 'isGrassBlockingUnlocked',
        chestPlacableKey: 'isChest3Placable',
        chestPlacedKey: 'isChest3Placed',
        unlockOnBlockingKeys: ['isForestUnlocked'],
    },
    {
        unlockedKey: 'isForestUnlocked',
        tilesPlacedKey: 'forestTilesPlaced',
        decorationUnlockedKey: 'isForestDecorationUnlocked',
        decorationsPlacedKey: 'forestDecorationsPlaced',
        blockingUnlockedKey: 'isForestBlockingUnlocked',
        chestPlacableKey: 'isChest4Placable',
        chestPlacedKey: 'isChest4Placed',
        unlockOnBlockingKeys: ['isSwampUnlocked', 'isMountainUnlocked'],
    },
    {
        unlockedKey: 'isSwampUnlocked',
        tilesPlacedKey: 'swampTilesPlaced',
        decorationUnlockedKey: 'isSwampDecorationUnlocked',
        decorationsPlacedKey: 'swampDecorationsPlaced',
        blockingUnlockedKey: 'isSwampBlockingUnlocked',
        chestPlacableKey: 'isChest5Placable',
        chestPlacedKey: 'isChest5Placed',
        unlockOnBlockingKeys: ['isCrystalUnlocked'],
    },
    {
        unlockedKey: 'isCrystalUnlocked',
        tilesPlacedKey: 'crystalTilesPlaced',
        decorationUnlockedKey: 'isCrystalDecorationUnlocked',
        decorationsPlacedKey: 'crystalDecorationsPlaced',
        blockingUnlockedKey: 'isCrystalBlockingUnlocked',
        chestPlacableKey: 'isChest6Placable',
        chestPlacedKey: 'isChest6Placed',
        unlockOnBlockingKeys: ['isLavaUnlocked'],
    },
];

export class DebugSpellcasting {

    #playerCurrentMagic: EarthCastingConfig = {
        isRockDecorationUnlocked: false,
        isRockBlockingUnlocked: false,
        isChest1Placable: false,
        isChest1Placed: false,
        isDesertUnlocked: false,
        isDesertDecorationUnlocked: false,
        isDesertBlockingUnlocked: false,
        isChest2Placable: false,
        isChest2Placed: false,
        isGrassUnlocked: false,
        isGrassDecorationUnlocked: false,
        isGrassBlockingUnlocked: false,
        isChest3Placable: false,
        isChest3Placed: false,
        isForestUnlocked: false,
        isForestDecorationUnlocked: false,
        isForestBlockingUnlocked: false,
        isChest4Placable: false,
        isChest4Placed: false,
        isSwampUnlocked: false,
        isSwampDecorationUnlocked: false,
        isSwampBlockingUnlocked: false,
        isChest5Placable: false,
        isChest5Placed: false,
        isCrystalUnlocked: false,
        isCrystalDecorationUnlocked: false,
        isCrystalBlockingUnlocked: false,
        isChest6Placable: false,
        isChest6Placed: false,
        isWaterUnlocked: false,
        isLavaUnlocked: false,
        isMountainUnlocked: false,
        powerLevel: 1,
    };

    #spellSound: Phaser.Sound.BaseSound;
    #levelUpSound: Phaser.Sound.BaseSound;
    #previousStateName: string | undefined;
    #castingFeedbackTotals: CastingFeedback = this.createEmptyCastingFeedback();

    constructor(scene: Phaser.Scene) {
        this.#spellSound = scene.sound.add('spellnotes1', { volume: 0.9 });
        this.#levelUpSound = scene.sound.add('levelup', { volume: 0.9 });
        //If debug mode is on then ease progression to save test time.
        if (DataManager.instance.data.isDebugMode) {
            this.#playerCurrentMagic.isWaterUnlocked = true;
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
        //ToDo: Place animal if ?
        if(this.#castingFeedbackTotals.rockBlockingPlaced>5){
                console.log('Spawn an animal!');
        }
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

            // Decoration placement is the gate for blocking tiles, chests, and the next biome unlocks.
            if (feedback[progression.decorationsPlacedKey] <= TILES_BEFORE_BLOCKING_UNLOCK || this.getMagicFlag(progression.blockingUnlockedKey)) {
                continue;
            }

            this.setMagicFlag(progression.blockingUnlockedKey, true);
            // Enable the player to place the biome chest once blocking is unlocked, unless it already exists.
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
