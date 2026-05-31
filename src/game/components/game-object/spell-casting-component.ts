import { BIOME } from '../../common/common';
import { PLAYER_SPELL_CAST_COOLDOWN } from '../../common/config';
import { GameDataManager } from '../../common/data-manager';
import { CastingUnlocks, GameObject2 } from '../../common/types';
import { GameScene } from '../../scenes/game-scene';
import { SpellCastingService } from '../../spellcasting/spell-casting-service';
import { BaseGameObjectComponent } from './base-game-object-component';

/**
 * Per-caster facade for spellcasting. Owns "can this character cast right now?"
 * and forwards cast requests to the scene-level `SpellCastingService`.
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
    // Check cooldown
    if (this.isOnCooldown) {
      return false;
    }
    // Check tile under caster
    const earth = (this.scene as GameScene).earth;
    if (earth === undefined) {
      return false;
    }
    const tilePos = earth.getTileXYFromScreenCoordinates(this.gameObject2.x, this.gameObject2.y, true);
    const tile = earth.getTile(tilePos.x, tilePos.y);
    if (tile === undefined || tile.biome === BIOME.WATER || tile.biome <= BIOME.VOID) {
      return false;
    }
    // OK to cast
    return true;
  }

  /** Current power level. v1 reads the player's value; enemies will override later. */
  get powerLevel(): number {
    return GameDataManager.instance.data.currentPower;
  }

  /** Unlocked spell variants. v1 reads from `GameDataManager`; enemy casters will own their own set. */
  get unlocks(): ReadonlySet<CastingUnlocks> {
    return GameDataManager.instance.data.unlockedSpellCasting;
  }

  /** Delegate to the scene service. Stamps the cooldown when the cast actually fires. */
  cast(): void {
    const service: SpellCastingService | undefined = (this.scene as GameScene).spellCasting;
    if (service === undefined) {
      console.warn('[SpellCastingComponent] cast aborted: no SpellCastingService on scene. This is an error!');
      return;
    }
    if (!this.canCast) {
      return;
    }
    this.#nextCastReadyAt = this.scene.time.now + PLAYER_SPELL_CAST_COOLDOWN;
    service.cast(this.gameObject2);
  }
}