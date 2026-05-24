import * as Phaser from 'phaser';
import { Earth } from '../ground/earth';
import { Direction, GameObject2, SpellType, Position } from '../common/types';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { Tile } from '../ground/tile';
import { BIOME, DECORATION_DEPTH, SPELL_TYPES } from '../common/common';
import { ENABLE_LOGGING, SPELL_STAGGER_MS } from '../common/config';
import { GameScene } from '../scenes/game-scene';
import { ASSET_KEYS } from '../common/assets';

type CastVector = {
  x: number;
  y: number;
};
const BIOME_COLOR_MAP: Record<number, number> = {
  [BIOME.VOID]: 0x1a1a1a,      // dark gray
  [BIOME.ROCK]: 0x8b7355,      // brown
  [BIOME.DESERT]: 0xf4a460,    // sandy
  [BIOME.GRASS]: 0x6ba547,     // green
  [BIOME.FOREST]: 0x2d5016,    // dark green
  [BIOME.WATER]: 0x1e90ff,     // blue
  [BIOME.SWAMP]: 0x556b2f,     // olive
  [BIOME.CRYSTAL]: 0x00d9ff,   // cyan
  [BIOME.LAVA]: 0xff4500,      // red-orange
  [BIOME.MOUNTAIN]: 0x808080,  // gray
};

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
  #pendingHops: Phaser.Time.TimerEvent[] = [];

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
    const casterTilePosition = this.earth.getTileXYFromScreenCoordinates(caster.x, caster.y, true);
    const casterTile = this.earth.getTile(casterTilePosition.x, casterTilePosition.y);
    if (!casterTile) { console.warn('Caster is not on a valid tile'); return; }
    const directions = (caster as CharacterGameObject).getLastMoveDirections();

    console.log(
      `[SpellCastingService] cast #${this.#castCount}`,
      {
        caster: caster.name || (caster as Phaser.GameObjects.Sprite).texture?.key,
        direction,
        screenPos: { x: Math.round(caster.x), y: Math.round(caster.y) },
        tilePos: casterTilePosition,
        biome: casterTile?.biome,
        lastMoveDirections: directions,
      },
    );

    // First get a list of target tiles and spell type
    const { spellTiles, spellType } = this.determineSpellTilesAndType(casterTile, directions);

    // Now excute the spell cast. 
    // if more than one target tile, execute spell staggered on all tiles with small delay.
    // first spell: this.executeSpellEffect(spellType, casterTile.biome, casterTilePosition, spellTiles[0]);
    // second spell:this.executeSpellEffect(spellType, casterTile.biome, spellTiles[0], spellTiles[1]);

    if (spellTiles.length === 0) {
      console.log('No valid targets found.');
      return;
    }

    this.#scheduleHops(spellType, casterTile.biome, casterTilePosition, spellTiles);
  }

  /**
   * Schedule one `executeSpellEffect` per hop, staggered by `SPELL_STAGGER_MS`.
   * First hop fires immediately (delay 0) so the caster gets instant feedback;
   * subsequent hops fire at i * SPELL_STAGGER_MS. Each chain hop runs:
   *   hop 0: caster -> spellTiles[0]
   *   hop i: spellTiles[i-1] -> spellTiles[i]
   */
  #scheduleHops(spellType: SpellType, biome: BIOME, casterTile: Position, spellTiles: Position[]): void {
    for (let i = 0; i < spellTiles.length; i += 1) {
      const from = i === 0 ? casterTile : spellTiles[i - 1];
      const to = spellTiles[i];
      const event = this.scene.time.delayedCall(i * SPELL_STAGGER_MS, () => {
        this.executeSpellEffect(spellType, biome, from, to, i === 0);
        const idx = this.#pendingHops.indexOf(event);
        if (idx !== -1) {
          this.#pendingHops.splice(idx, 1);
        }
      });
      this.#pendingHops.push(event);
    }
  }

  // Placeholder for the method that determines which tiles are affected by the spell and which type of spell is being cast, based on the caster's tile, direction, power level, unlocks and game state. Currently just a stub that returns the first tile in the cast direction as the target and BASIC as the spell type.
  determineSpellTilesAndType(_casterTile: Tile, _directions: ("UP" | "DOWN" | "LEFT" | "RIGHT")[]): { spellTiles: Position[]; spellType: SpellType; } {
    // First find out which type of spell should be cast.
    // Based on casters tile, powerlevel, unlocks, gameState and available target tiles in the cast directions.
    // 1) Base tile spell 
    //     gameState in (firstTileState,babyStepsState,regularState) and 
    //     if any void tiles in target
    // 2) Decoration spell 
    //     if not 1 and 
    //     gameState in (babyStepsState,regularState) and
    //     any tiles without decoration of same biome as caster is on in target
    // 3) Chest spawn spell 
    //     if not 1 & 2 and 
    //     gameState in (regularState) and
    //     any decorated but not blocked tiles of same biome as caster is on in target and
    //     chest this biome is unlocked and
    //     % chance is met
    // 4) Animal spawn spell
    //     if not 1,2 & 3 and 
    //     gameState in (regularState) and
    //     any decorated but not blocked tiles of same biome as caster is on in target and
    //     animals this biome is unlocked and
    //     pr. biome criteria for neighboring tiles is met and
    //     % chance is met
    // 5) Blocking spell
    //     if not 1,2,3 & 4 and 
    //     ...

    // Temporary placeholder logic until we have the above implemented. Just returns the first tile in the cast direction as the target and BASIC as the spell type.
    const position1 = { x: _casterTile.tileX, y: _casterTile.tileY - 1 };
    const position2 = { x: _casterTile.tileX, y: _casterTile.tileY - 2 };
    return { spellTiles: [position1, position2], spellType: SPELL_TYPES.BASIC };
  }

  /** execute one part of the spell effect (tile changes, mob spawns, VFX, sounds).  */ 
  executeSpellEffect(spellType: SpellType, biome: BIOME, startTile: Position, endTile: Position, isOrigon: boolean): void {
    if (ENABLE_LOGGING) {
      console.log('[SpellCastingService] executeSpellEffect (stub)', { spellType, biome, startTile, endTile, isOrigon });
    }
    const tile_size = 64;
    const half_tile = 32;
    const tintColor = BIOME_COLOR_MAP[biome] ?? BIOME_COLOR_MAP[BIOME.VOID];
    // ToDo: swirtch on spellType.

    // play sound.

    // spawn VFX at startTile if an origon.
    if (isOrigon) {
      // spawn origon VFX at startTile center (not player).
      const origonVFX = this.scene.add.sprite(startTile.x * tile_size + half_tile, startTile.y * tile_size + half_tile, 'magic-fx-holy-explosion');
      origonVFX.setDepth(DECORATION_DEPTH + 1);
      origonVFX.setTint(tintColor).setTintMode(Phaser.TintModes.MULTIPLY);
      origonVFX.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      origonVFX.play(ASSET_KEYS.CAST_ORIGON);
      origonVFX.on('animationcomplete', () => {
        origonVFX.destroy();
      });
    }

    // spawn VFX traveling from startTile to endTile along travelVector. (if origon start at player)
    let travelVector: CastVector = { x: (endTile.x - startTile.x) * tile_size, y: (endTile.y - startTile.y) * tile_size };
    let startVector: CastVector = { x: startTile.x * tile_size + half_tile, y: startTile.y * tile_size + half_tile };
    if (isOrigon) {
      const player = (this.scene as GameScene).playerPosition;
      startVector = { x: player.x, y: player.y };
      travelVector = { x: (endTile.x * tile_size + half_tile - startVector.x), y: (endTile.y * tile_size + half_tile - startVector.y) }
    }
    const spell = this.scene.add
      .sprite(startVector.x + travelVector.x / 10, startVector.y + travelVector.y / 10, 'spell-music-11_grayscale')
      .setScale(0.5)
      .setOrigin(0.5, 0.5);
    spell.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    spell.play('spell-music-anim');
    this.scene.tweens.add({
      targets: spell,
      x: spell.x + travelVector.x,
      y: spell.y + travelVector.y,
      duration: 1500,
      ease: 'Sine.easeOut',
      onComplete: () => spell.destroy(),
    });
    spell.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      spell.destroy();
    });

    // spawn delayed VFX at endTile after travel time.
     this.scene.time.delayedCall(1000, () => {
      const impactVFX = this.scene.add.sprite(endTile.x * tile_size + half_tile, endTile.y * tile_size + half_tile, 'magic-fx-light-cast');
      impactVFX.setDepth(DECORATION_DEPTH + 1);
      impactVFX.setTint(tintColor).setTintMode(Phaser.TintModes.MULTIPLY);
      impactVFX.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      impactVFX.play(ASSET_KEYS.CAST_TARGET_A);
      impactVFX.on('animationcomplete', () => {
        impactVFX.destroy();
      });
    });

  }


  /** Future home for cooldowns / channel timers. No-op for now. */
  public update(): void {
    // intentionally empty
  }
}
