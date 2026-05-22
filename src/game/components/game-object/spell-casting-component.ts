import { BIOME } from '../../common/common';
import { PLAYER_SPELL_CAST_COOLDOWN } from '../../common/config';
import { DataManager } from '../../common/data-manager';
import { CastingUnlocks, Direction, GameObject2 } from '../../common/types';
import { GameScene } from '../../scenes/game-scene';
import { SpellCastingService } from '../../spellcasting/spell-casting-service';
import { BaseGameObjectComponent } from './base-game-object-component';
import { WeaponComponent } from './weapon-component';

/**
 * Per-caster facade for spellcasting. Owns "can this character cast right now?"
 * and forwards cast requests to the scene-level `SpellCastingService`.
 *
 * v1: the service is a no-op; the real cast pipeline still runs through
 * `DebugSpellcasting`. This component is attached but not yet driving casts
 * from the game loop.
 */
export class SpellCastingComponent extends BaseGameObjectComponent {

  /** Scene-time (ms) at which the next cast is allowed. 0 = ready now. */
  #nextCastReadyAt = 0;

  constructor(gameObject2: GameObject2) {
    super(gameObject2);
  }

  /** True while the caster is still inside its post-cast cooldown window. */
  get isOnCooldown(): boolean {
    return this.scene.time.now < this.#nextCastReadyAt;
  }

  /** Milliseconds remaining on the cooldown (0 when ready). */
  get cooldownRemainingMs(): number {
    return Math.max(0, this.#nextCastReadyAt - this.scene.time.now);
  }

  /**
   * True when the caster has a weapon, is on a castable tile, and is not
   * currently on cooldown.
   */
  get canCast(): boolean {
    if (this.isOnCooldown) {
      return false;
    }
    const weaponComponent = WeaponComponent.getComponent<WeaponComponent>(this.gameObject2);
    if (weaponComponent === undefined || weaponComponent.weapon === undefined) {
      return false;
    }
    const earth = (this.scene as GameScene).earth;
    if (earth === undefined) {
      return false;
    }
    const tilePos = earth.getTileXYFromScreenCoordinates(this.gameObject2.x, this.gameObject2.y, true);
    const tile = earth.getTile(tilePos.x, tilePos.y);
    if (tile === undefined || tile.biome === BIOME.WATER || tile.biome <= BIOME.VOID) {
      return false;
    }
    return true;
  }

  /** Current power level. v1 reads the player's value; enemies will override later. */
  get powerLevel(): number {
    return DataManager.instance.data.currentPower;
  }

  /** Unlocked spell variants. v1 reads from `DataManager`; enemy casters will own their own set. */
  get unlocks(): ReadonlySet<CastingUnlocks> {
    return DataManager.instance.data.unlockedSpellCasting;
  }

  /** Delegate to the scene service. Stamps the cooldown when the cast actually fires. */
  cast(direction: Direction): void {
    const service: SpellCastingService | undefined = (this.scene as GameScene).spellCasting;
    if (service === undefined) {
      console.warn('[SpellCastingComponent] cast aborted: no SpellCastingService on scene');
      return;
    }
    if (!this.canCast) {
      console.log('[SpellCastingComponent] cast blocked by canCast', {
        direction,
        isOnCooldown: this.isOnCooldown,
        cooldownRemainingMs: this.cooldownRemainingMs,
      });
      return;
    }
    this.#nextCastReadyAt = this.scene.time.now + PLAYER_SPELL_CAST_COOLDOWN;
    console.log('[SpellCastingComponent] cast', {
      direction,
      powerLevel: this.powerLevel,
      unlocks: this.unlocks.size,
      cooldownMs: PLAYER_SPELL_CAST_COOLDOWN,
    });
    service.cast(this.gameObject2, direction);
  }

  /** Future cooldowns / channel timers. No-op for now. */
  update(): void {
    // intentionally empty
  }
}