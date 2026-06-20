import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../common/assets';
import { DECORATION_DEPTH } from '../common/common';
import { Position } from '../common/types';

const TILE_SIZE = 64;
const HALF_TILE = TILE_SIZE / 2;
const SPELL_VFX_DEPTH = DECORATION_DEPTH + 1;
// notes.png is a 4x4 sheet of static note glyphs (16 frames). Each particle picks
// one at random so the stream reads as scattered, varied musical notes.
const NOTE_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

type Point = {
  x: number;
  y: number;
};

function tileCenter(tile: Position): Point {
  return {
    x: tile.x * TILE_SIZE + HALF_TILE,
    y: tile.y * TILE_SIZE + HALF_TILE,
  };
}

function setEmitterStyle(
  emitter: Phaser.GameObjects.Particles.ParticleEmitter,
  tintColor: number,
  tintMode: Phaser.TintModes = Phaser.TintModes.MULTIPLY
): Phaser.GameObjects.Particles.ParticleEmitter {
  emitter.setDepth(SPELL_VFX_DEPTH);
  emitter.setParticleTint(tintColor);
  emitter.tintMode = tintMode;
  emitter.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  emitter.once(Phaser.GameObjects.Particles.Events.COMPLETE, () => emitter.destroy());
  return emitter;
}

function createHopLine(start: Point, end: Point): Phaser.Geom.Line {
  return new Phaser.Geom.Line(0, 0, end.x - start.x, end.y - start.y);
}

function createNoteTrailEmitter(
  scene: Phaser.Scene,
  start: Point,
  end: Point,
  tintColor: number
): Phaser.GameObjects.Particles.ParticleEmitter {
  const emitter = scene.add.particles(start.x, start.y, ASSET_KEYS.MAGIC_FX_PARTICLE_NOTES, {
    frame: { frames: NOTE_FRAMES, cycle: false },
    emitting: false,
    frequency: -1,
    emitZone: {
      type: 'edge',
      source: createHopLine(start, end),
      quantity: 16,
      seamless: true,
    },
    lifespan: { min: 700, max: 1100 },
    speed: { min: 0, max: 25 },
    // Keep pixel-art glyphs crisp: constant native scale, fade via alpha only.
    scale: 1.0,
    alpha: { start: 0.95, end: 0 },
    rotate: { min: -25, max: 25 },
    particleBringToTop: true,
    reserve: 20,
    maxAliveParticles: 24,
  });
  setEmitterStyle(emitter, tintColor);
  emitter.explode(16);
  emitter.stop();
  return emitter;
}

function createLightTrailEmitter(
  scene: Phaser.Scene,
  start: Point,
  end: Point,
  tintColor: number
): Phaser.GameObjects.Particles.ParticleEmitter {
  const emitter = scene.add.particles(start.x, start.y, ASSET_KEYS.MAGIC_FX_LIGHT_CAST, {
    emitting: false,
    frequency: -1,
    emitZone: {
      type: 'edge',
      source: createHopLine(start, end),
      quantity: 8,
      seamless: true,
    },
    lifespan: { min: 450, max: 800 },
    speed: { min: 0, max: 15 },
    scale: { start: 0.08, end: 0 },
    alpha: { start: 0.5, end: 0 },
    rotate: { min: -180, max: 180 },
    particleBringToTop: true,
    reserve: 12,
    maxAliveParticles: 16,
  });
  setEmitterStyle(emitter, tintColor, Phaser.TintModes.ADD);
  emitter.explode(8);
  emitter.stop();
  return emitter;
}

function createOriginBurstEmitter(
  scene: Phaser.Scene,
  origin: Point,
  tintColor: number
): Phaser.GameObjects.Particles.ParticleEmitter {
  const emitter = scene.add.particles(origin.x, origin.y, ASSET_KEYS.MAGIC_FX_PARTICLE_NOTES, {
    frame: { frames: NOTE_FRAMES, cycle: false },
    emitting: false,
    frequency: -1,
    lifespan: { min: 500, max: 900 },
    angle: { min: 0, max: 360 },
    speed: { min: 25, max: 120 },
    // Keep pixel-art glyphs crisp: constant native scale, fade via alpha only.
    scale: 1.0,
    alpha: { start: 0.9, end: 0 },
    rotate: { min: -45, max: 45 },
    particleBringToTop: true,
    reserve: 16,
    maxAliveParticles: 18,
  });
  setEmitterStyle(emitter, tintColor);
  emitter.explode(14);
  emitter.stop();
  return emitter;
}

function createImpactBurstEmitter(
  scene: Phaser.Scene,
  impact: Point,
  tintColor: number,
  isFinalImpact: boolean
): Phaser.GameObjects.Particles.ParticleEmitter {
  const particleCount = isFinalImpact ? 24 : 8;
  const emitter = scene.add.particles(impact.x, impact.y, ASSET_KEYS.MAGIC_FX_BLUE_CIRCLE_EXPLOSION, {
    emitting: false,
    frequency: -1,
    lifespan: { min: 650, max: 1200 },
    angle: { min: 0, max: 360 },
    speed: { min: 40, max: isFinalImpact ? 180 : 100 },
    scale: { start: isFinalImpact ? 0.18 : 0.12, end: 0 },
    alpha: { start: isFinalImpact ? 0.8 : 0.55, end: 0 },
    rotate: { min: -180, max: 180 },
    particleBringToTop: true,
    reserve: particleCount,
    maxAliveParticles: particleCount,
  });
  setEmitterStyle(emitter, tintColor, Phaser.TintModes.ADD);
  emitter.explode(particleCount);
  emitter.stop();
  return emitter;
}

export function playSpellHopVfx(
  scene: Phaser.Scene,
  startTile: Position,
  endTile: Position,
  tintColor: number,
  isOrigin: boolean,
  isFinalImpact: boolean
): Phaser.GameObjects.Particles.ParticleEmitter[] {
  const start = tileCenter(startTile);
  const end = tileCenter(endTile);
  const emitters = [
    createNoteTrailEmitter(scene, start, end, tintColor),
    createLightTrailEmitter(scene, start, end, tintColor),
    createImpactBurstEmitter(scene, end, tintColor, isFinalImpact),
  ];

  if (isOrigin) {
    emitters.push(createOriginBurstEmitter(scene, start, tintColor));
  }

  return emitters;
}