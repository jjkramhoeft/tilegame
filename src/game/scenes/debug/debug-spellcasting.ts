import * as Phaser from 'phaser';
import { Player } from '../../game-objects/player/player';
import { Earth, EarthCastingConfig } from '../../ground/earth';
import { PLAYER_SPEED } from '../../common/config';

export class DebugSpellcasting {
    #playerCurrentMagic: EarthCastingConfig = {
        isDesertUnlocked: false,
        isGrassUnlocked: false,
        isForestUnlocked: false,
        isSwampUnlocked: false,
        isCrystalUnlocked: false,
        isWaterUnlocked: true,
        isLavaUnlocked: false,
        isMountainUnlocked: false,
        powerLevel: 5,
    };
    #spellSound: Phaser.Sound.BaseSound;
    #previousStateName: string | undefined;

    constructor(scene: Phaser.Scene) {
        this.#spellSound = scene.sound.add('spellnotes1', { volume: 0.9 });
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
            console.log(directions);
            directions.forEach(dir => {
                switch (dir) {
                    case 'UP': tilePosition.y -= 1; break;
                    case 'DOWN': tilePosition.y += 1; break;
                    case 'LEFT': tilePosition.x -= 1; break;
                    case 'RIGHT': tilePosition.x += 1; break;
                }
            });

            const feedback = earth.AddTiles(this.#playerCurrentMagic, casterPosition, tilePosition, directions);
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
                }
                const sum = feedback.rockTilesPlaced + feedback.desertTilesPlaced + feedback.grassTilesPlaced + feedback.forestTilesPlaced;
                const x = Math.floor(sum / 20);
                if (x > this.#playerCurrentMagic.powerLevel) {
                    this.#playerCurrentMagic.powerLevel++;
                }
            }
        }

        this.#previousStateName = player.stateMachine.currentStateName;
    }
}
