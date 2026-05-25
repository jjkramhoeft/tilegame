import * as Phaser from 'phaser';
import { Earth } from '../ground/earth';
import { Direction, GameObject2, SpellType, Position } from '../common/types';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { Tile } from '../ground/tile';
import { BIOME, CASTING_UNLOCKS, DECORATION_DEPTH, SPELL_TYPES } from '../common/common';
import { ENABLE_LOGGING, SPELL_STAGGER_MS } from '../common/config';
import { GameScene } from '../scenes/game-scene';
import { ASSET_KEYS } from '../common/assets';
import { findTargetTiles } from '../ground/creator';
import { DataManager } from '../common/data-manager';

type CastVector = {
  x: number;
  y: number;
};
const BIOME_COLOR_MAP: Record<number, number> = {
  [BIOME.VOID]: 0x8b7355,      // brown
  [BIOME.ROCK]: 0x6a6a6a,      // dark gray
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
  #powerLevel = 0;

  constructor(scene: Phaser.Scene, earth: Earth) {
    this.scene = scene;
    this.earth = earth;
    // Spell-cast sounds are played as one-shots via `SoundManager.play(key, marker)`
    // so each hop/cast produces an independent, concurrent playback that doesn't
    // restart any in-flight sound. Marker info is passed inline at play time.
  }

  /**
   * Entry point for "this caster casts a spell in this direction".
   * Under development; currently just logs the cast attempt and parameters for debugging
   */
  public cast(caster: GameObject2): void {

    this.#castCount += 1;
    const casterTilePosition = this.earth.getTileXYFromScreenCoordinates(caster.x, caster.y, true);
    const casterTile = this.earth.getTile(casterTilePosition.x, casterTilePosition.y);
    if (!casterTile) { console.warn('Caster is not on a valid tile'); return; }
    const directions = (caster as CharacterGameObject).getLastMoveDirections();
    this.#powerLevel = DataManager.instance.data.currentPower;

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
    const primeTargetPosition = this.findPrimeTargetPosition({ x: _casterTile.tileX, y: _casterTile.tileY }, _directions);
    const targets = findTargetTiles(primeTargetPosition, _directions, this.#powerLevel);
    const targetWithInfo = this.earth.targetWithInfo(targets);
    const voidTargets = targetWithInfo.filter(t => t.biome === BIOME.VOID);

    // 1) SPELL_TYPES.BASIC, Base tile spell is cast if any void tiles in target. 
    if (voidTargets.length > 0) { 
      const sortedVoidTargets = voidTargets.sort((a, b) => { return b.neighborCount - a.neighborCount; });// Prioritize void tiles with most neighbors.
      return { spellTiles: sortedVoidTargets.slice(0, Math.min(sortedVoidTargets.length, this.#powerLevel)).map(t => t.pos), spellType: SPELL_TYPES.BASIC };
    }

    // 2) SPELL_TYPES.DECORATION, Decoration spell if ant undecorated targets exist.
    if (this.decorationIsUnlocked(_casterTile.biome)) {
      const decorationTargets = targetWithInfo.filter(t => 0 < t.biome && !t.decorated);
      if (decorationTargets.length > 0) {
        return { spellTiles: decorationTargets.slice(0, Math.min(decorationTargets.length, this.#powerLevel)).map(t => t.pos), spellType: SPELL_TYPES.DECORATION };
      }
    }    
    const blockingTargets = targetWithInfo.filter(t => t.biome === _casterTile.biome && t.decorated && !t.blocking);  

    // 3) SPELL_TYPES.CHEST, Chest spawn spell (currently only 10% chance)
    if(this.chestIsUnlocked(_casterTile.biome) && (Phaser.Math.Between(1, 100) <= 10)){
      const sortedBlockingTargets = blockingTargets.sort((a, b) => { return -b.neighborCount + a.neighborCount; });// Prioritize blocking tiles with least neighbors.
      return { spellTiles: [sortedBlockingTargets[0].pos], spellType: SPELL_TYPES.CHEST };
    }

    // 4) SPELL_TYPES.ANIMAL, Animal spawn spell (currently only 10% chance)
    if(this.animalsIsUnlocked(_casterTile.biome) && (Phaser.Math.Between(1, 100) <= 10)){
      const sortedBlockingTargets = blockingTargets.sort((a, b) => { return b.neighborCount - a.neighborCount; });// Prioritize blocking tiles with most neighbors.
      return { spellTiles: [sortedBlockingTargets[0].pos], spellType: SPELL_TYPES.ANIMAL };
    }

    // 5) SPELL_TYPES.BLOCKING, Blocking spell if any decorated but not blocked tiles of same biome as caster is on in target and blocking this biome is unlocked.
    if(this.blockingIsUnlocked(_casterTile.biome)&& (Phaser.Math.Between(1, 100) <= 50)){//50% chance to cast blocking spell if criteria met.
      if (blockingTargets.length > 0) {
        // ToDo: also handle animals here.
        return { spellTiles: blockingTargets.slice(0, Math.min(blockingTargets.length, this.#powerLevel)).map(t => t.pos), spellType: SPELL_TYPES.BLOCKING };
      }
    }

    return { spellTiles: [], spellType: SPELL_TYPES.BASIC };
  }

  private decorationIsUnlocked(biome: number): boolean {
    switch (biome) {
      case BIOME.ROCK: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.ROCK_DECORATION);
      case BIOME.DESERT: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.DESERT_DECORATION);
      case BIOME.GRASS: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.GRASS_DECORATION);
      case BIOME.FOREST: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.FOREST_DECORATION);
      case BIOME.SWAMP: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.SWAMP_DECORATION);
      case BIOME.CRYSTAL: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CRYSTAL_DECORATION);
    }
    return false;;
  }

  private blockingIsUnlocked(biome: number): boolean {
    switch (biome) {
      case BIOME.ROCK: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.ROCK_BLOCKING);
      case BIOME.DESERT: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.DESERT_BLOCKING);
      case BIOME.GRASS: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.GRASS_BLOCKING);
      case BIOME.FOREST: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.FOREST_BLOCKING);
      case BIOME.SWAMP: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.SWAMP_BLOCKING);
      case BIOME.CRYSTAL: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CRYSTAL_BLOCKING);
    }
    return false;;
  }

  private animalsIsUnlocked(biome: number): boolean {
    switch (biome) {
      case BIOME.ROCK: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.ROCK_ANIMALS);
      case BIOME.DESERT: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.DESERT_ANIMALS);
      case BIOME.GRASS: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.GRASS_ANIMALS);
      case BIOME.FOREST: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.FOREST_ANIMALS);
      case BIOME.SWAMP: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.SWAMP_ANIMALS);
      case BIOME.CRYSTAL: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CRYSTAL_ANIMALS);
    }
    return false;;
  }  

  private chestIsUnlocked(biome: number): boolean {
    switch (biome) {
      case BIOME.ROCK: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CHEST1);
      case BIOME.DESERT: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CHEST2);
      case BIOME.GRASS: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CHEST3);
      case BIOME.FOREST: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CHEST4);
      case BIOME.SWAMP: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CHEST5);
      case BIOME.CRYSTAL: return DataManager.instance.data.unlockedSpellCasting.has(CASTING_UNLOCKS.CHEST6);
    }
    return false;;
  }

  private findPrimeTargetPosition(casterPosition: Position, directions: Direction[]): Position {
    const targetPosition = { x: casterPosition.x, y: casterPosition.y };
    for (const direction of directions) {
      switch (direction) {
        case 'UP': targetPosition.y -= 1; break;
        case 'DOWN': targetPosition.y += 1; break;
        case 'LEFT': targetPosition.x -= 1; break;
        case 'RIGHT': targetPosition.x += 1; break;
      }
    }
    return targetPosition;
  }

  /** execute one part of the staggeredspell effect (tile changes, mob spawns, VFX, sounds).  */
  executeSpellEffect(spellType: SpellType, biome: BIOME, startTile: Position, endTile: Position, isOrigon: boolean): void {
    if (ENABLE_LOGGING) {
      console.log('[SpellCastingService] executeSpellEffect (stub)', { spellType, biome, startTile, endTile, isOrigon });
    }
    const tile_size = 64;
    const half_tile = 32;
    const tintColor = BIOME_COLOR_MAP[biome] ?? BIOME_COLOR_MAP[BIOME.VOID];

    // play sound as a one-shot so concurrent hops/casts overlap instead of restarting
    // a shared sound instance. Re-roll once if we'd repeat the previous marker.
    let markerIndex = Phaser.Math.Between(1, 12);
    let badTag = spellType === SPELL_TYPES.BASIC ? '-bad' : '';
    let volume = spellType === SPELL_TYPES.BASIC ? 0.8 : 1.0;
    this.scene.sound.play(`magic-audio-sprite${badTag}`, {
      name: `spell-cast-${markerIndex}${badTag}`,
      start: (markerIndex - 1) * 2,
      duration: 1.5,
      volume: volume,
      config: {},
    });

    // spawn VFX at startTile if an origon.
    if (isOrigon) {
      // spawn origon VFX at startTile center (not player).
      const origonVFX = this.scene.add.sprite(startTile.x * tile_size + half_tile, startTile.y * tile_size + half_tile, 'magic-fx-holy-explosion');
      origonVFX.setDepth(DECORATION_DEPTH + 1);
      origonVFX.setTint(tintColor).setTintMode(Phaser.TintModes.MULTIPLY);
      origonVFX.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      origonVFX.playReverse(ASSET_KEYS.CAST_ORIGON);
      origonVFX.on('animationcomplete', () => {
        origonVFX.destroy();
      });
    }

    // spawn VFX traveling from startTile to endTile along travelVector.
    let travelVector: CastVector = { x: (endTile.x - startTile.x) * tile_size, y: (endTile.y - startTile.y) * tile_size };
    let startVector: CastVector = { x: startTile.x * tile_size + half_tile, y: startTile.y * tile_size + half_tile };
    if (isOrigon) {//if origon (first of staggered spell) start at player
      const player = (this.scene as GameScene).playerPosition;
      startVector = { x: player.x, y: player.y };
      travelVector = { x: (endTile.x * tile_size + half_tile - startVector.x), y: (endTile.y * tile_size + half_tile - startVector.y) }
    }
    const spell = this.scene.add
      .sprite(startVector.x + travelVector.x / 10, startVector.y + travelVector.y / 10, 'spell-music-11_grayscale')
      .setScale(0.5)
      .setOrigin(0.5, 0.5);
    spell.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    spell.setTint(tintColor).setTintMode(Phaser.TintModes.MULTIPLY);
    spell.play('spell-music-anim');
    this.scene.tweens.add({
      targets: spell,
      x: spell.x + travelVector.x,
      y: spell.y + travelVector.y,
      duration: 1500,
      ease: 'Sine.easeOut',
      onComplete: () => spell.destroy(),
    });
    spell.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => { spell.destroy(); });

    // spawn delayed VFX at endTile after travel time.
    this.scene.time.delayedCall(1000, () => {
      const impactVFX = this.scene.add.sprite(endTile.x * tile_size + half_tile, endTile.y * tile_size + half_tile, 'magic-fx-light-cast');
      impactVFX.setDepth(DECORATION_DEPTH + 1);
      impactVFX.setTint(tintColor).setTintMode(Phaser.TintModes.MULTIPLY);
      impactVFX.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      impactVFX.play(ASSET_KEYS.CAST_TARGET_A);
      impactVFX.on('animationcomplete', () => { impactVFX.destroy(); });
      // Add the tile, decoration, blocking, chest or animal here.
      switch (spellType) {
        case SPELL_TYPES.BASIC:
          this.earth.AddBaseTile(endTile, biome, true);
          break;
        case SPELL_TYPES.DECORATION:
          this.earth.AddDecorationToTile(endTile);
          break;
        case SPELL_TYPES.BLOCKING:
          this.earth.AddBlockingToTile(endTile);
          break;
        case SPELL_TYPES.CHEST:
          this.earth.AddChesToTile(endTile);
          break;
        case SPELL_TYPES.ANIMAL:
          (this.scene as GameScene).addMob(endTile);
          break;
      }
    });
  }

  /** Future home for cooldowns / channel timers. No-op for now. */
  public update(): void {
    // intentionally empty
  }
}


