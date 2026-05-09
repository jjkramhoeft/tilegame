# Game Mechanics

This game is a top-down RPG game. The player creates the map while playing

## Tile Map

### Layers

The tile map consist of six layers

- Floating Layer: (treetops and mountaintops, and unique objects). This layer is always show on top of the player
- Blocking Layer: (trees and giant mushrooms, large rocks and crystals, large cacti, mountain bases and tree bases, and unique objects). This layer contains tileData with collision objects. If the players y value is lager than the collision objects y value then this tile is show below the player, otherwise it is shown on top of the player
- Decoration Layer (pebbles, small plants and crystals). This layer is always below the player
- Border Layer (four per biome - up,right,down,left). This layer is always below the player. This layer is used to make the transition from one biome to another smoother.
- Base Layer (void, rock, desert, grass, forest, water, swamp, crystal, lava, and mountain are the ten base static layers for each biome). This layer is always below the player

  Animated biom bases (water, lava, crystal and void have an associated animated sprite).
- Void layer

### Funtions

- Start/Initialize empty, all tiles in all layers are empty (minus one)
- Create Tile for dynamicly adding tile to the map: CreateTile(x, y, base, border, decoration, blocking, floating)

## Characters

### Player

- Can move in eight direction
- Can Face in four direction
- Animated: Idle, Walking, Attack/Cast, Swim, Die/Fall
- Two starter options: Male or female (Adam or Eve)
- Four Weapon progressions: None, Dagger, Staff, Sword
- Four Outfit progressions: None, Bare, Basic, Armor
- Cast blob shadow (in cluede in sprite)
- Blocked by blocking layer and Mountain layer
- Falls from void or empty tiles
- Swims in water layer

### Animals

- Can move in four or eight direction
- Can Face in four direction
- Animated: Idle, Walking, Die/Fall
- Options: Cow, Sheep/Lamb, Chicken, Pig
- Cast blob shadow (in cluede in sprite)
- Blocked by blocking layer, void layer, water layer and mountain layer

### Enemies

- Can move in four or eight direction
- Can Face in four direction
- Animated: Idle, Walking, Attack/Cast, Die/Fall
- Options: Spider, Snake, Gosht, Lizard, Skeleton, Wisp, Drow
- Cast blob shadow (in cluede in sprite)
- Blocked by blocking layer, void layer, water layer and mountain layer
- Needs path finding and some simple chase mechanics 

## Biomes

- Void / ´none´
- Rock. Start biome
- Desert
- grass
- forest
- water
- swamp
- crystal
- lava
- mountain

### Depth of layers in map in game-scene

From lowest to highest

- -50 Void Layer (VOID_SOLID_DEPTH)

  -40 The depth the payer are at when falling (PLAYER_FALLING_STATE_DEPTH)
- -30 Void Layers animation (VOID_ANIM_DEPTH)
- -20 Biom Layer (BASE_DEPTH)
- -18 Border Layer (BORDER_DEPTH)
  
  -16 Lava animation depth (LAVA_DEPTH)  
  -14 Water animation depth (WATER_DEPTH)  
  -12 Crystal twinkling animation depth (CRYSTAL_GLIMTS_DEPTH)
- -10 Decoration Layer (DECORATION_DEPTH)
- 0 Blocking Layer (BLOCKING_TILE_DEPTH)

  worldY + 64 BlockingSprite
- 9999999 Floating layer (FLOATING_DEPTH)

## Game UI Dialog

consist of the fowwing ellements

- Health/Life Indicator (Hearts, like Zelda games a full heath is equal to two health, A halft hjearth is one health)
- Magic Level Indicator (starts at one, indicates how many tile the player can place when using magic)
- Progression Level Indicator (Animals, shows how many live animals there current is on the earth)
- Chest Dialog
- Save/Exit Dialog
- Story Dialog (used for story driven text)

### Chest Dialog

- Heading: A chest with a dagger and some basic cloth
- Options
  1) Take weapon from chest (and leave current weapon in chest)
  2) Take gear from chest (and leave current gear in chest)
  3) Do nothing

- Heading: A chest with a dagger
- Options
  1) Take weapon from chest
  2) Do nothing

- Heading: An empty chest
- Options
  1) Leave weapon in chest
  2) Leave gear in chest
  3) Do nothing

## Game Progression

The game starts with the play standing on a lone single tile. With magic level one, and no weapon and no cloth

The number and type of tile that the play has created are tracked

For each of the six biomes (Rock, Desert, Grass, Forest, Swamp and Crystal) the progression follows this pattern:
First only plain basetiles (with borderlayer) can be added, then after 10 of those are placed, Decorations are unlocked for that biome, Then after 10 tiles with decoration have been placed blocking is unlocked together with a chest, Then after 10 tiles with blocking Animals are unlocked.

Void, Water, Mountains and Lava have no progression but all hinders movement in some way.

Power level progress with the total count of tiles placed: 0-49 = level 1, 50-149 = level 2, 150-299 = level 3, 300-499 = level 4, 500-749 = level 5, 750- = level 6

### Biome Unlock Order

0) Void
1) Rock. Chest 1 (Bare outfit)
2) Desert. Chest 4 (Dagger weapon)
3) Water. Swimming, No player attack, No player magic
4) Grass. Chest 2 (Normal outfit)
5) Forest. Chest 5 (Staff weapon)
6) Mountain. Impassable
7) Swamp. Chest 6 (Sword weapon)
8) Crystal. Chest 3 (Armor outfit)
9) Lava. Burning - will dammage player

First when a biome is unlocked only plain basetiles with borderlayer can be added as new tiles. After 10 tiles are placed, new placed tiles can also include decorations.
