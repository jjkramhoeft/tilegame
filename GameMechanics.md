# Game Mechanics

## Tile Map

### Layers

- Floating Layer (treetops and mountaintops, and unique objects)
- Blocking Layer (trees and giant musrooms, large rocks and crystals, large cacti, mountain bases and tree bases, and unique objects)
- Decoration Layer (pebbles, small plants and crystals)
- Boarder Layer (four per biome - up,right,down,left)
- Base Layer (water,lava,crystal and void are animated - rock,desert,grass,forest,swamp,moutain are static)

### Funtions

- Start/Initialize empty, all tiles in all layers are empty (minus one)
- Create Tile for dynamicly adding tile to the map: CreateTime(base, boarder, decoration, blocking, floating)

## Characters

### Player

- Can move in eight direction
- Can Face in four direction
- Animated: Idle, Walking, Attack/Cast, Die/Fall
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