# Game Mechanics

This game is a top-down RPG game. The player creates the map while playing

## Tile Map

### Layers

The tile map consist of six layers

- Floating Layer: (treetops and mountaintops, and unique objects). This layer is always show on top of the player
- Blocking Layer: (trees and giant mushrooms, large rocks and crystals, large cacti, mountain bases and tree bases, and unique objects). This layer contains tileData with collision objects. If the players y value is lager than the collision objects y value then this tile is show below the player, otherwise it is shown on top of the player
- Decoration Layer (pebbles, small plants and crystals). This layer is always below the player
- Border Layer (four per biome - up,right,down,left). This layer is always below the player. This layer is used to make the transition from one biome to another smoother.
- Animated Layer (water, lava, crystal and void have an associated animated layer). This layer is always below the player
- Base Layer (void, rock, desert, grass, forest, water, swamp, crystal, lava, and mountain are the ten base static layers for each biome). This layer is always below the player

### Funtions

- Start/Initialize empty, all tiles in all layers are empty (minus one)
- Create Tile for dynamicly adding tile to the map: CreateTile(x, y, base, border, decoration, blocking, floating)

## Characters

### Player

- Can move in eight direction
- Can Face in four direction
- Animated: Idle, Walking, Attack/Cast, Swim, Die/Fall
- Two starter options: Male or female
- Four Weapon progressions: None, Dagger, Staff, Sword
- Four Outfit progressions: None, Bare, Basic, Armor
- Cast blob shadow
- Blocked by blocking layer
- Falls from void or empty tiles

### Animals

- Can move in eight direction
- Can Face in four direction
- Animated: Idle, Walking, Die/Fall
- Options: Cow, Sheep, Pig
- Cast blob shadow
- Blocked by blocking layer
- Falls from void or empty tiles

### Enemies

- Can move in eight direction
- Can Face in four direction
- Animated: Idle, Walking, Attack/Cast, Die/Fall
- Options: Gosht, Lizard, Skeleton
- Cast blob shadow
- Blocked by blocking layer
- Falls from void or empty tiles
- Needs path finding