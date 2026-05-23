import * as Phaser from 'phaser';
import { Earth } from '../ground/earth';
import { Direction, GameObject2 } from '../common/types';
import { CharacterGameObject } from '../game-objects/common/character-game-object';

/**
 * Scene-level service that will own the spellcasting pipeline (tile placement,
 * mob spawning, VFX, sounds, progression).
 *
 * v1 is under development and is currently mostly logging. The old casting still runs through
 * `DebugSpellcasting`. 
 * 
 * This service is attached to the scene and will be called by `SpellCastingComponent`s on casters when they want to cast. 
 * The goal is to eventually migrate all spellcasting logic here and out of the debug class.
 */
export class SpellCastingService {
  protected scene: Phaser.Scene;
  protected earth: Earth;

  #castCount = 0;

  constructor(scene: Phaser.Scene, earth: Earth) {
    this.scene = scene;
    this.earth = earth;
  }

  /**
   * Entry point for "this caster casts a spell in this direction".
   * Under development; currently just logs the cast attempt and parameters for debugging
   */
  public cast(caster: GameObject2, direction: Direction): void {
    this.#castCount += 1;
    const casterTile = this.earth.getTileXYFromScreenCoordinates(caster.x, caster.y, true);
    const tile = this.earth.getTile(casterTile.x, casterTile.y);
    const directions = (caster as CharacterGameObject).getLastMoveDirections();
    console.log(
      `[SpellCastingService] cast #${this.#castCount}`,
      {
        caster: caster.name || (caster as Phaser.GameObjects.Sprite).texture?.key,
        direction,
        screenPos: { x: Math.round(caster.x), y: Math.round(caster.y) },
        tilePos: casterTile,
        biome: tile?.biome,
        lastMoveDirections: directions,
      },
    );
  }

  /** Future home for cooldowns / channel timers. No-op for now. */
  public update(): void {
    // intentionally empty
  }
}
