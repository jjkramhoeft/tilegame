import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../common/assets';
import { DECORATION_DEPTH } from '../common/common';

// notes.png is a 4x4 sheet of static note glyphs (16 frames). Each particle picks
// one at random so the burst reads as scattered, varied musical notes.
const NOTE_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

/** Warm gold used for celebratory (non-spell) note bursts. */
export const MAGIC_NOTE_GOLD = 0xffd24a;

export type NoteBurstOptions = {
  /** Number of notes to emit. */
  count?: number;
  /** Particle tint (multiplied onto the white glyphs). Defaults to gold. */
  tint?: number;
  /** Minimum outward speed in px/s. */
  speedMin?: number;
  /** Maximum outward speed in px/s. */
  speedMax?: number;
  /** Render depth. Defaults to just above decorations, like the spell VFX. */
  depth?: number;
  /** Minimum particle lifespan in ms. */
  lifespanMin?: number;
  /** Maximum particle lifespan in ms. */
  lifespanMax?: number;
};

/**
 * Emit a one-shot radial burst of tinted note glyphs from (x, y), flying
 * outward in random directions. Used for celebratory beats (cloud disperse,
 * first tile, player placement, garden/big-tree growth) — the spell-hop trail
 * lives separately in `spell-hop-vfx.ts`.
 *
 * Glyphs stay crisp: constant native scale, fade via alpha only, NEAREST filter.
 * The emitter self-destructs once all particles have died.
 */
export function playNoteBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: NoteBurstOptions = {}
): Phaser.GameObjects.Particles.ParticleEmitter {
  const {
    count = 24,
    tint = MAGIC_NOTE_GOLD,
    speedMin = 40,
    speedMax = 180,
    depth = DECORATION_DEPTH + 1,
    lifespanMin = 600,
    lifespanMax = 1100,
  } = options;

  const emitter = scene.add.particles(x, y, ASSET_KEYS.MAGIC_FX_PARTICLE_NOTES, {
    frame: { frames: NOTE_FRAMES, cycle: false },
    emitting: false,
    frequency: -1,
    lifespan: { min: lifespanMin, max: lifespanMax },
    angle: { min: 0, max: 360 },
    speed: { min: speedMin, max: speedMax },
    // Keep pixel-art glyphs crisp: constant native scale, fade via alpha only.
    scale: 1.0,
    alpha: { start: 0.95, end: 0 },
    rotate: { min: -45, max: 45 },
    particleBringToTop: true,
    reserve: count,
    maxAliveParticles: count,
  });
  emitter.setDepth(depth);
  emitter.setParticleTint(tint);
  emitter.tintMode = Phaser.TintModes.MULTIPLY;
  emitter.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  emitter.once(Phaser.GameObjects.Particles.Events.COMPLETE, () => emitter.destroy());
  emitter.explode(count);
  emitter.stop();
  return emitter;
}
