IMPORTANT: Try to preserve the original code and the logic of the original code as much as possible.

## Project Overview

This is a Phaser TypeScript top-down RPG where the player dynamically builds the map while playing. Full game design is documented in `GameMechanics.md`.

## Architecture

Phaser 4 + TypeScript, built with Vite. ~107 `.ts` files under `src/`. No test framework.

**Boot:** `index.html` → `src/main.ts` → `src/game/main.ts` (`StartGame` builds the Phaser config). Scene order: `PreloadScene` → `Intro` → `GameScene` + `UiScene` (run concurrently) → `MapScene`, `Credits`, `Reflection`, `Settings`. Physics: Arcade, zero gravity.

**Module map** (`src/game/`):

| Folder | Responsibility |
| --- | --- |
| `scenes/` | The 8 scenes above + `debug/` scenes (blocking, chests, enemies). `scene-keys.ts` holds scene identifiers. |
| `ground/` | Dynamic tilemap world. `earth.ts` (the map + tile placement), `creator.ts`, `tile.ts`, `blocking-boxes.ts`. |
| `game-objects/` | Entities: `player/`, `enemies/` (12 animals/enemies), `weapons/`, `objects/` (chest). Share `common/character-game-object.ts`. See `ADDING_A_CREATURE.md` to add a new animal/enemy. |
| `components/game-object/` | Composable entity behaviors (life, weapon, animation, direction, speed, spell-casting, collision, …). |
| `components/state-machine/` | Generic `state-machine.ts` + two FSMs under `states/` (see below). |
| `spellcasting/` | `spell-casting-service.ts` — tile placement with biome-based unlock rules + cast VFX. |
| `spawning/` | `animal-spawn-service.ts`, `chest-spawn-service.ts` — factory services. |
| `progression/` | `game-progression.ts` — tile counts, power level, unlock tracking. |
| `systems/` | Per-frame world systems: `falling-system`, `lava-damage-system`, `swimming-system`. |
| `common/` | Shared infra: `assets.ts` (asset/animation keys), `event-bus.ts`, `game-data-manager.ts` (save/load), `config.ts`, `texts.ts`, dialogs, utils, `types.ts`. |

**Two state machines** (`components/state-machine/states/`):
- `character/` — per-entity movement/action states (idle, move, attack, swim-move, casting, hurt, death, falling, bounce, open-chest, …).
- `game/` — 13 game-progression states (start → first-tile → assignment → baby-steps → garden → regular → first-tree → first-animal → help-with-tilecasting → eve → boss-fight → game-over → victory). `eve`, `boss-fight`, and `victory` are stubbed. See `GameMechanics.md` for the per-state narrative.

See `STATE_MACHINES.md` for how the FSM engine works, how the two machines are wired, and how to add a state.

**Testing:** `npm test` (Vitest unit tests for pure logic) and `npm run test:e2e` (Playwright smoke test that boots the game via `?debug=1`). See `TESTING.md` — prefer adding a unit test for logic changes over manual playthrough.

`Lizardman` and `Shark` are designed (`GameMechanics.md`) but not yet implemented.

### Tile Map

The map has six layers (bottom to top): Void, Base (biome), Border, Decoration, Blocking, Floating.

Depth constants used in code:

| Category | Constants |
| --- | --- |
| Void and falling | `VOID_SOLID_DEPTH` = -50, `PLAYER_FALLING_STATE_DEPTH` = -40, `VOID_ANIM_DEPTH` = -30 |
| Terrain and animated biome details | `BASE_DEPTH` = -20, `BORDER_DEPTH` = -18, `LAVA_DEPTH` = -16, `WATER_DEPTH` = -14, `CRYSTAL_GLIMTS_DEPTH` = -12 |
| Decorations and blocking | `DECORATION_DEPTH` = -10, `BLOCKING_TILE_DEPTH` = 0 |
| Floating overlays | `FLOATING_DEPTH` = 9999999 |

Blocking sprites are placed at `worldY +64`, and the player's depth changes dynamically based on `worldY` to create the illusion of depth.

### Game Progression

- Player starts on a single tile with magic level 1, no weapon, no outfit.
- Biomes unlock as the player places tiles. Chests unlock weapons (Dagger, Staff, Sword) and outfits (Bare, Basic, Armor).
- Water biome: player can swim but cannot attack or use magic.
- Lava biome: damages the player.
- Mountain biome: impassable.

### Biomes (unlock order)

Void → Rock → Desert → Water → Grass → Forest → Mountain → Swamp → Crystal → Lava

### Characters

- **Player**: 8-direction movement, 4-direction facing. Animations: Idle, Walk, Attack/Cast, Swim, Die/Fall. Weapons: None → Dagger → Staff → Sword. Outfits: None → Bare → Basic → Armor.
- **Enemies**: Spider, Lamb, Chicken and Snake. Idle/Walk/Attack/Die animations. Require pathfinding.
- All characters have  blob shadows, are blocked by the Blocking layer, and fall from void/empty tiles.

### UI

- Hearts (health), Magic Level indicator, Animal progression indicator.
- Chest dialog, Save/Exit dialog, Story dialog.

## Assets

All assets are preloaded in `PreloadScene`. 

Aseprite is only used for the spider and some few HUD elements. Animations are created by `PreloadScene` using these five functions

- `createUiAnimations` ( for the HUD and other animation for non game scenes)
- `createAdamAndEveAnimations` (the male and female player characters)
- `createMobAnimations` (for all animals and enemies)
- `createTileAnimations` (for the animated tiles)
- `createOtherAnimations` (for all animation that do not fall into the other categories. E.g. Magic fx, Narrator's Big tree)
