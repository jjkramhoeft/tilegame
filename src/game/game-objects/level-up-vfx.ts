import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../common/assets';
import { FLOATING_DEPTH } from '../common/common';

// hud-icons.png frames are 16x16; scale up so the spin reads clearly in world space.
const LEVEL_UP_VFX_SCALE = 1.5;
// How far above the player's origin the icon floats (player feet sit near the origin).
const LEVEL_UP_VFX_Y_OFFSET = 42;
// Subtle upward drift while the spin plays, for extra "pop".
const LEVEL_UP_VFX_RISE = 12;
const LEVEL_UP_VFX_RISE_DURATION = 600;

/**
 * Plays one of the HUD spin animations (spin_hearth / spin_power / spin_progress)
 * as a one-shot sprite floating above the player, then destroys itself.
 * Mirrors the HUD level-up feedback so the player can't miss the event.
 */
export function playLevelUpVfx(scene: Phaser.Scene, x: number, y: number, animationKey: string): void {
  const sprite = scene.add.sprite(x, y - LEVEL_UP_VFX_Y_OFFSET, ASSET_KEYS.HUD_ICONS);
  sprite.setDepth(FLOATING_DEPTH);
  sprite.setScale(LEVEL_UP_VFX_SCALE);
  sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

  scene.tweens.add({
    targets: sprite,
    y: sprite.y - LEVEL_UP_VFX_RISE,
    duration: LEVEL_UP_VFX_RISE_DURATION,
    ease: 'Sine.easeOut',
  });

  sprite.play(animationKey);
  sprite.once('animationcomplete', () => sprite.destroy());
}
