IMPORTANT: Try to preserve the original code and the logic of the original code as much as possible.

## Project Overview

This is a Phaser TypeScript top-down RPG where the player dynamically builds the map while playing. Full game design is documented in `GameMechanics.md`.

### Tile Map

The map has six layers (bottom to top): Void, Base (biome), Border, Decoration, Blocking, Floating.

Depth constants used in code:

| Category | Constants |
| --- | --- |
| Void and falling | `VOID_SOLID_DEPTH` = -50, `PLAYER_FALLING_STATE_DEPTH` = -40, `VOID_ANIM_DEPTH` = -30 |
| Terrain and animated biome details | `BASE_DEPTH` = -20, `BORDER_DEPTH` = -18, `LAVA_DEPTH` = -16, `WATER_DEPTH` = -14, `CRYSTAL_GLINTS_DEPTH` = -12 |
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

Aseprite is only used for the spider and some few HUD elements. Animations are createded by `PreloadScene` using these five functions

- `createUiAnimations` ( for the HUD and other animation for non game scenes)
- `createAdamAndEveAnimations` (the male and female player characters)
- `createMobAnimations` (for all animals and enemies)
- `createTileAnimations` (for the animated tiles)
- `createOtherAnimations` (for all animation that do not fall into the other categories. E.g. Magic fx, Narrator's Big tree)
