import * as Phaser from 'phaser';

const DUST_TEXTURE_KEY = 'intro-dust-particle';
const FIREFLY_TEXTURE_KEY = 'intro-firefly-particle';

const INTRO_DUST_DEPTH = 999;
const INTRO_FIREFLY_DEPTH = 999;

export type AmbientParticles = {
  emitters: Phaser.GameObjects.Particles.ParticleEmitter[];
  destroy: () => void;
};

export type AmbientParticleOptions = {
  dustDepth?: number;
  fireflyDepth?: number;
};

function ensureAmbientParticleTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists(DUST_TEXTURE_KEY)) {
    const dustGraphics = scene.add.graphics();
    dustGraphics.fillStyle(0xfff7df, 0.9);
    dustGraphics.fillCircle(3, 3, 2);
    dustGraphics.fillStyle(0xffffff, 0.35);
    dustGraphics.fillCircle(3, 3, 1);
    dustGraphics.generateTexture(DUST_TEXTURE_KEY, 6, 6);
    dustGraphics.destroy();
  }

  if (!scene.textures.exists(FIREFLY_TEXTURE_KEY)) {
    const fireflyGraphics = scene.add.graphics();
    fireflyGraphics.fillStyle(0xffc85a, 0.12);
    fireflyGraphics.fillCircle(6, 6, 6);
    fireflyGraphics.fillStyle(0xffdf75, 0.35);
    fireflyGraphics.fillCircle(6, 6, 4);
    fireflyGraphics.fillStyle(0xffffc8, 0.9);
    fireflyGraphics.fillCircle(6, 6, 2);
    fireflyGraphics.generateTexture(FIREFLY_TEXTURE_KEY, 12, 12);
    fireflyGraphics.destroy();
  }
}

function createViewportZone(
  scene: Phaser.Scene,
  topFraction = 0,
  bottomFraction = 1,
): Phaser.Types.GameObjects.Particles.RandomZoneSource {
  const bounds = new Phaser.Geom.Rectangle(
    0,
    scene.scale.height * topFraction,
    scene.scale.width,
    scene.scale.height * (bottomFraction - topFraction),
  );
  return {
    getRandomPoint: (point) => {
      point.x = Phaser.Math.FloatBetween(bounds.left, bounds.right);
      point.y = Phaser.Math.FloatBetween(bounds.top, bounds.bottom);
    },
  };
}

function createDustEmitter(scene: Phaser.Scene, depth: number): Phaser.GameObjects.Particles.ParticleEmitter {
  const emitter = scene.add.particles(0, 0, DUST_TEXTURE_KEY, {
    emitZone: {
      type: 'random',
      // Keep dust in the lower two-thirds of the screen (no dust up in the clouds).
      source: createViewportZone(scene, 1 / 3),
    },
    frequency: 420,
    quantity: 6,
    advance: 8000,
    lifespan: { min: 7000, max: 14000 },
    speedX: { min: -4, max: 8 },
    speedY: { min: -18, max: -4 },
    accelerationY: -1,
    scale: { start: 0.8, end: 0.18, random: true },
    alpha: { start: 0.28, end: 0 },
    rotate: { min: -15, max: 15 },
    reserve: 300,
    maxAliveParticles: 360,
  });
  emitter.setDepth(depth);
  emitter.setScrollFactor(0);
  return emitter;
}

function createFireflyEmitter(scene: Phaser.Scene, depth: number): Phaser.GameObjects.Particles.ParticleEmitter {
  const emitter = scene.add.particles(0, 0, FIREFLY_TEXTURE_KEY, {
    emitZone: {
      type: 'random',
      // Keep fireflies in the bottom four-fifths of the screen.
      source: createViewportZone(scene, 1 / 5, 1),
    },
    frequency: 1300,
    quantity: 2,
    advance: 4000,
    lifespan: { min: 3000, max: 6500 },
    speedX: { min: -10, max: 10 },
    speedY: { min: -8, max: 6 },
    scale: { start: 0.6, end: 0 },
    alpha: { start: 0.75, end: 0 },
    tint: 0xffe88a,
    reserve: 24,
    maxAliveParticles: 28,
  });
  emitter.setDepth(depth);
  emitter.setParticleTint(0xffe88a);
  emitter.tintMode = Phaser.TintModes.ADD;
  emitter.setScrollFactor(0);
  return emitter;
}

export function createAmbientParticles(scene: Phaser.Scene, options: AmbientParticleOptions = {}): AmbientParticles {
  ensureAmbientParticleTextures(scene);

  const emitters = [
    createDustEmitter(scene, options.dustDepth ?? INTRO_DUST_DEPTH),
    createFireflyEmitter(scene, options.fireflyDepth ?? INTRO_FIREFLY_DEPTH),
  ];

  return {
    emitters,
    destroy: () => {
      for (const emitter of emitters) {
        emitter.stop(true);
        emitter.destroy();
      }
    },
  };
}

export function createIntroAmbientParticles(scene: Phaser.Scene): AmbientParticles {
  return createAmbientParticles(scene);
}