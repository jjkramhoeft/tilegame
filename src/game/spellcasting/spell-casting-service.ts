import * as Phaser from 'phaser';
import { Earth } from '../ground/earth';
import { Direction, GameObject2 } from '../common/types';

/**
 * Scene-level service that will own the spellcasting pipeline (tile placement,
 * mob spawning, VFX, sounds, progression).
 *
 * v1 is intentionally a no-op stub. The real casting still runs through
 * `DebugSpellcasting`. Logic will be migrated here in later passes; until then
 * this class only defines the future entry point and logs what it would do.
 */
export class SpellCastingService {
  protected scene: Phaser.Scene;
  protected earth: Earth;

  /** Future home for the limited-cast flag currently on `DebugSpellcasting`. */
  public isLimitedCastEnabled = false;

  #castCount = 0;

  constructor(scene: Phaser.Scene, earth: Earth) {
    this.scene = scene;
    this.earth = earth;
  }

  /**
   * The future entry point for "this caster casts a spell in this direction".
   * v1: logs only. `DebugSpellcasting` still drives the real cast pipeline.
   */
  public cast(caster: GameObject2, direction: Direction): void {
    this.#castCount += 1;
    const casterTile = this.earth.getTileXYFromScreenCoordinates(caster.x, caster.y, true);
    const tile = this.earth.getTile(casterTile.x, casterTile.y);
    console.log(
      `[SpellCastingService] cast #${this.#castCount}`,
      {
        caster: caster.name || (caster as Phaser.GameObjects.Sprite).texture?.key,
        direction,
        screenPos: { x: Math.round(caster.x), y: Math.round(caster.y) },
        tilePos: casterTile,
        biome: tile?.biome,
        isLimitedCastEnabled: this.isLimitedCastEnabled,
      },
    );
  }

  /** Future home for cooldowns / channel timers. No-op for now. */
  public update(): void {
    // intentionally empty
  }
}
