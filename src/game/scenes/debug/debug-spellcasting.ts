import * as Phaser from 'phaser';
import { Player } from '../../game-objects/player/player';
import { Earth, EarthCastingConfig } from '../../ground/earth';
import { PLAYER_SPEED } from '../../common/config';
import { DataManager } from '../../common/data-manager';
import { TILES_BEFORE_DECORATION_UNLOCK, TILES_BEFORE_BLOCKING_UNLOCK } from '../../common/config';

export class DebugSpellcasting {

    #playerCurrentMagic: EarthCastingConfig = {
        isRockDecorationUnlocked: false,
        isRockBlockingUnlocked: false,
        isChest1Placable: false,
        isDesertUnlocked: false,
        isDesertDecorationUnlocked: false,
        isDesertBlockingUnlocked: false,
        isChest2Placable: false,
        isGrassUnlocked: false,
        isGrassDecorationUnlocked: false,
        isGrassBlockingUnlocked: false,
        isChest3Placable: false,
        isForestUnlocked: false,
        isForestDecorationUnlocked: false,
        isForestBlockingUnlocked: false,
        isChest4Placable: false,
        isSwampUnlocked: false,
        isSwampDecorationUnlocked: false,
        isSwampBlockingUnlocked: false,
        isChest5Placable: false,
        isCrystalUnlocked: false,
        isCrystalDecorationUnlocked: false,
        isCrystalBlockingUnlocked: false,
        isChest6Placable: false,
        isWaterUnlocked: false,
        isLavaUnlocked: false,
        isMountainUnlocked: false,
        powerLevel: 1,
    };

    #spellSound: Phaser.Sound.BaseSound;
    #levelUpSound: Phaser.Sound.BaseSound;
    #previousStateName: string | undefined;

    constructor(scene: Phaser.Scene) {
        this.#spellSound = scene.sound.add('spellnotes1', { volume: 0.9 });
        this.#levelUpSound = scene.sound.add('levelup', { volume: 0.9 });
        //If debug mode is on then ease progression to save test time.
        if (DataManager.instance.data.isDebugMode) {
            this.#playerCurrentMagic.isWaterUnlocked = true;
            this.#playerCurrentMagic.powerLevel = 5;
        }
    }

    update(scene: Phaser.Scene, player: Player, earth: Earth): void {
        if (player.stateMachine.currentStateName === 'ATTACK_STATE' &&
            this.#previousStateName !== 'ATTACK_STATE' &&
            this.#previousStateName !== 'SWIM_STATE'
        ) {
            if (this.#spellSound.isPlaying === false) {
                this.#spellSound.play();
            }

            const lastDirections = player.getLastMoveDirections();
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
            const spell = scene.add.sprite(player.x + oldvx / 10, player.y + oldvy / 10, 'spell-music-11').setScale(0.5).setOrigin(0.5, 0.5);
            spell.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            spell.play('spell-music-anim');
            scene.tweens.add({
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

            const casterPosition = earth.getTileXYFromScreenCoordinates(player.x, player.y, true);
            const tilePosition = { x: casterPosition.x, y: casterPosition.y };
            const directions = player.getLastMoveDirections();
            directions.forEach(dir => {
                switch (dir) {
                    case 'UP': tilePosition.y -= 1; break;
                    case 'DOWN': tilePosition.y += 1; break;
                    case 'LEFT': tilePosition.x -= 1; break;
                    case 'RIGHT': tilePosition.x += 1; break;
                }
            });

            console.log('Casting spell magic:', JSON.stringify(this.#playerCurrentMagic, null, 2));
            const feedback = earth.AddTiles(this.#playerCurrentMagic, casterPosition, tilePosition, directions);
            console.log('Casting spell feedback:', JSON.stringify(feedback, null, 2));
            //Adjust progression if needed.
            if (feedback) {
                if (feedback.rockTilesPlaced > TILES_BEFORE_DECORATION_UNLOCK && this.#playerCurrentMagic.isRockDecorationUnlocked === false) {
                    this.#playerCurrentMagic.isRockDecorationUnlocked = true;
                }
                if (feedback.rockDecorationsPlaced > TILES_BEFORE_BLOCKING_UNLOCK && this.#playerCurrentMagic.isRockBlockingUnlocked === false) {
                    this.#playerCurrentMagic.isRockBlockingUnlocked = true;
                    //ToDo enable chest 1 if not already enabled or placed
                    if (this.#playerCurrentMagic.isDesertUnlocked === false) {
                        this.#playerCurrentMagic.isDesertUnlocked = true;
                    }
                }
                if (this.#playerCurrentMagic.isDesertUnlocked) {
                    if (feedback.desertTilesPlaced > TILES_BEFORE_DECORATION_UNLOCK && this.#playerCurrentMagic.isDesertDecorationUnlocked === false) { this.#playerCurrentMagic.isDesertDecorationUnlocked = true; }
                    if (feedback.desertDecorationsPlaced > TILES_BEFORE_BLOCKING_UNLOCK && this.#playerCurrentMagic.isDesertBlockingUnlocked === false) {
                        this.#playerCurrentMagic.isDesertBlockingUnlocked = true;
                        //ToDo enable chest 2 if not already enabled or placed
                        if (this.#playerCurrentMagic.isGrassUnlocked === false) {
                            this.#playerCurrentMagic.isGrassUnlocked = true;
                        }
                        if (this.#playerCurrentMagic.isWaterUnlocked === false) {
                            this.#playerCurrentMagic.isWaterUnlocked = true;
                        }
                    }
                }
                if (this.#playerCurrentMagic.isGrassUnlocked) {
                    if (feedback.grassTilesPlaced > TILES_BEFORE_DECORATION_UNLOCK && this.#playerCurrentMagic.isGrassDecorationUnlocked === false) { this.#playerCurrentMagic.isGrassDecorationUnlocked = true; }
                    if (feedback.grassDecorationsPlaced > TILES_BEFORE_BLOCKING_UNLOCK && this.#playerCurrentMagic.isGrassBlockingUnlocked === false) {
                        this.#playerCurrentMagic.isGrassBlockingUnlocked = true;
                        //ToDo enable chest 3 if not already enabled or placed
                        if (this.#playerCurrentMagic.isForestUnlocked === false) {
                            this.#playerCurrentMagic.isForestUnlocked = true;
                        }
                    }
                }
                if (this.#playerCurrentMagic.isForestUnlocked) {
                    if (feedback.forestTilesPlaced > TILES_BEFORE_DECORATION_UNLOCK && this.#playerCurrentMagic.isForestDecorationUnlocked === false) { this.#playerCurrentMagic.isForestDecorationUnlocked = true; }
                    if (feedback.forestDecorationsPlaced > TILES_BEFORE_BLOCKING_UNLOCK && this.#playerCurrentMagic.isForestBlockingUnlocked === false) {
                        this.#playerCurrentMagic.isForestBlockingUnlocked = true;
                        //ToDo enable chest 4 if not already enabled or placed
                        if (this.#playerCurrentMagic.isSwampUnlocked === false) {
                            this.#playerCurrentMagic.isSwampUnlocked = true;
                        }
                        if (this.#playerCurrentMagic.isMountainUnlocked === false) {
                            this.#playerCurrentMagic.isMountainUnlocked = true;
                        }
                    }
                }
                if (this.#playerCurrentMagic.isSwampUnlocked) {
                    if (feedback.swampTilesPlaced > TILES_BEFORE_DECORATION_UNLOCK && this.#playerCurrentMagic.isSwampDecorationUnlocked === false) { this.#playerCurrentMagic.isSwampDecorationUnlocked = true; }
                    if (feedback.swampDecorationsPlaced > TILES_BEFORE_BLOCKING_UNLOCK && this.#playerCurrentMagic.isSwampBlockingUnlocked === false) {
                        this.#playerCurrentMagic.isSwampBlockingUnlocked = true;
                        //ToDo enable chest 5 if not already enabled or placed
                        if (this.#playerCurrentMagic.isCrystalUnlocked === false) {
                            this.#playerCurrentMagic.isCrystalUnlocked = true;
                        }
                    }
                }
                if (this.#playerCurrentMagic.isCrystalUnlocked) {
                    if (feedback.crystalTilesPlaced > TILES_BEFORE_DECORATION_UNLOCK && this.#playerCurrentMagic.isCrystalDecorationUnlocked === false) { this.#playerCurrentMagic.isCrystalDecorationUnlocked = true; }
                    if (feedback.crystalDecorationsPlaced > TILES_BEFORE_BLOCKING_UNLOCK && this.#playerCurrentMagic.isCrystalBlockingUnlocked === false) {
                        this.#playerCurrentMagic.isCrystalBlockingUnlocked = true;
                        //ToDo enable chest 6 if not already enabled or placed
                        if (this.#playerCurrentMagic.isLavaUnlocked === false) {
                            this.#playerCurrentMagic.isLavaUnlocked = true;
                        }
                    }
                }

                const sum = feedback.rockTilesPlaced +
                    feedback.desertTilesPlaced +
                    feedback.grassTilesPlaced +
                    feedback.forestTilesPlaced +
                    feedback.swampTilesPlaced +
                    feedback.crystalTilesPlaced +
                    feedback.lavaTilesPlaced +
                    feedback.waterTilesPlaced +
                    feedback.mountainTilesPlaced;
                let levelPowerUp: boolean = false;
                let debugDivider: number = 1;
                if (DataManager.instance.data.isDebugMode) {
                    debugDivider = 10;
                }
                if (this.#playerCurrentMagic.powerLevel === 1 && sum >= 50 / debugDivider) {
                    levelPowerUp = true;
                } else if (this.#playerCurrentMagic.powerLevel === 2 && sum >= 150 / debugDivider) {
                    levelPowerUp = true;
                } else if (this.#playerCurrentMagic.powerLevel === 3 && sum >= 300 / debugDivider) {
                    levelPowerUp = true;
                } else if (this.#playerCurrentMagic.powerLevel === 4 && sum >= 500 / debugDivider) {
                    levelPowerUp = true;
                } else if (this.#playerCurrentMagic.powerLevel === 5 && sum >= 750 / debugDivider) {
                    levelPowerUp = true;
                }
                if (levelPowerUp) {
                    this.#playerCurrentMagic.powerLevel++;
                    //ToDo: Update UI
                    if (this.#levelUpSound.isPlaying === false) {
                        this.#levelUpSound.play();
                    }
                }
            }
        }

        this.#previousStateName = player.stateMachine.currentStateName;
    }
}
