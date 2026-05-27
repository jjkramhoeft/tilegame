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
- Options: Sheep, Lamb, Chicken, Piglet, Rooster, Turkey, Bull, Calf
- Cast blob shadow (in cluede in sprite)
- Blocked by blocking layer, void layer, water layer and mountain layer

#### Lamb

Can be used as a template for implementing the other animals.

Main class is lamb.ts in src/game/game-objets/enemies
SpriteSheet: 'Lamb.png' with the same key but without the file extension ('Lamb'), this is registered in public/asserts/data/assets.json

The animations for the Lamb is set up in PreloadScene and the key for the animations are defined in src/game/common/assets.ts

### Enemies

- Can move in four or eight direction
- Can Face in four direction
- Animated: Idle, Walking, Attack/Cast, Die/Fall
- Options: Spider, Snake, Lizardman, Skeleton
- Cast blob shadow (is included in sprite)
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

## Game Map

The player can choose to look at it instead of the normal view (the map fills the entire screen, i.e. it is NOT just a small part of the HUD). The player can switch back and forth between the map and gameplay.

Pressing the map key (the 'm' key) during gameplay pauses the game and only shows the map scene. When the player then presses the action key (the 'x' key), the map scene is hidden and the regular play area with HUD is shown, and the game resumes.

Initially, the map should only consist of a background image and text with a prompt to click the right key to return ('Press 'x' to return').

The music should continue playing when the map is shown.

The map should only be accessible from the FirstTreeState game state onwards.

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
First only plain basetiles (with borderlayer) can be added, then after X of those are placed, Decorations are unlocked for that biome, Then after Y tiles with decoration have been placed blocking is unlocked together with a chest, Then after Z tiles with blocking Animals are unlocked.

Void, Water, Mountains and Lava have no progression but all hinders movement in some way.

Power level progress with the total count of tiles placed.

The game narrator guides the player and introduce the game mechanics, The narrators text are shown via the narratorDialog in the UI-scene.

The game play progression is implemented using StateMachine, a BaseGameState and 12 different game states

### Game States

- startState
- firstTileState
- assignmentState
- babyStepsState
- gardenState
- regularState
- firstTreeState
- firstAnimalState
- eveState
- bossFightState
- gameOverState
- victoryState

#### Start State

A narrator game state, Player is passive.
The events in this gameState is as following:

1) empty screen (no player and no tiles)
2) text: "...In the beginning the earth was formless and empty..."
3) 1 sec pause
4) Place 1st tile
5) 1 sec pause
6) Place player (movement disabled)
7) 1 sec pause
8) text: "...God create the earth and heavens and you, Move carefully..."
9) enable player movement
10) Transition to First Tile Assignment State

#### First Tile State

An active player game state, No narrator
First very simple play state.
player can move (and can fall and die), player can attack but cast is limited to an off sound and no effect.
ToDo: implement limited cast. (where isLimmited = true)
After player movement and an attack/cast transition to Assignment State

#### Assignment State

A narrator game state, Player is passive.
No player movement

1) 1 sec pause
2) Text: "...And you shall help in the creating, make the land, fill it with green forest and then animals"
3) 1 sec pause
4) Place target void (use placeTargetVoidTiles in earth)
5) 1 sec pause
6) Transition to Baby Steps State

#### Baby Steps State

An active player game state, No narrator
Second simple play state, the goal is to have the play place tile in the targeted area and continue casting in the targeted area until there have been placed at least two blocking rock tiles.
ToDo, find a clean and easy way to keep track of when the goal has been reached. (The test/check should preferably only run while the game is in Baby Steps mode)
when target are filled and 2 blocking rocks are placed in tiles, and player is below center position, transition to Garden State

#### Garden State

A narrator game state, Player is passive.
No player movement

1) 1 sec pause
2) Text: "...Not just barren rock and wasteland, no green fields, flowing rivers and trees..."
3) Change tiles one by one to a more fertile and green, add water like a river, add bushes and small trees, and then add the big tree. (use placeGardenTiles() in earth)
4) Text: "...Your assignment is create a lush forest with many animals, if you pick an evil path you will have to face the demon"  
5) Add box (a chest) of fruit next to the bigTree, where the player can interact to eat an apple and get a boost to max health and full health (use chest number 7)
6) Transition to regularPlayState

#### Regular Play State

An active player game state, No narrator
The main gameplay state.
Progress by unlocking tile biomes, trees and animals. Flee or fight enemies.
Can transition to many game states (firstTree, firstAnimal, eve, bossFight, gameOver, victory), the transitions will be defined later.

#### First Tree State

A narrator game state, Player is passive.
No player movement.
Triggered by first blocking forest tree, desert palm/cacti, swamp tree, from regular state. This transition will be implemented later.

1) 1 sec pause
2) Text "You added you first tree, fine here can animal thrive..."
3) Transition to regular game state

#### First Animal State

A narrator game state, Player is passive.
Triggered by first Chicken, Lamb etc. This transition will be implemented later.

1) 1 sec pause
2) Text "You are not alone! let life multiply..."
3) Transition to regular Game State

#### Eve State

To be implemented later. Needs further refinement and development of a companion character type
A narrator game state, Player is passive.
No player movement
Trigger by ??? (to be defined)
Adam or Eve depending on what play play as. (will pick the opposite sex as the player)
Same gear and weapon as player, but can not be changed.
The main features of the companion character type should be:

- Following player.
- Auto attacks
- Multiply animals
- Adds to max health to player, when introduced
The narrator game state should have these elements:

1) Text: "It is not good to be alone..."
2) Place Eve(or Adam) companion
3) Text: ", Here is a companion fitting for you..."
4) Transition to Regular Play State

#### Boss Fight State

To be implemented later. Needs further refinement, and development of a boss enemy type
An active player game state, No narrator
Triggered by ??? (to be defined)
Lizardman boss, do timed minions (small snakes) attack starting with sound.

#### Game Over State

A narrator game state, Player is passive.
Triggered by player death
Simple Game Over

1) Text: "Game Over..."
2) on exit then exit to main menu (intro-scene)

#### Victory State

To be implemented later. Needs further refinement.
A narrator game state, Player is passive.
Trigger by boss fight end or animal progression maxed

- Text: "You have won!.."
- on exit then exit to main menu (intro-scene)

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

First when a biome is unlocked only plain basetiles with borderlayer can be added as new tiles. After X tiles are placed, new placed tiles can also include decorations.

### Biome and their animals

||Rock|Desert|Grass|Forest|Swamp|Crystal|Water|
|-|-|-|-|-|-|-|-|
|Spider|x|||x|x|x||
|Chicken|||x|||||
|Lamb|||x|||||
|Sheep|||x|||||
|Rooster|||x|||||
|Turkey||||x||||
|Piglet||||x||||
|Bull|||x|||||
|Calf|||x|||||
|Snake||x||x|x|||
|Skeleton||||||x||
|Lizardman||||||||
|Shark|||||||x|
|Plants|||||x|||

## Talking Points (Danish: "Reflektionsspørgsmål")

The game has a page/scene with points to talk about to encourage thinking about lift and Genesis and creation.

- Order and Chaos

  The sequence of creation, understanding and science

- Thinking and Preconsesions

  An walking talking snake, Skeletons - where did the other humans come from

- Purpose

  What are the goal of life, how to live a good life, how to win

- Provision

  Pairs, A helper - It is not good to for us to be alone, Healing, Abundance

- A Second Chance

  Starting over, Save game? Game Over, Trial and error, How do we learn?, How do we stay good friends?

## Music

  Title Scene, Credits & Talking Points got background music
  
## Sound

### UI

- Up [menu_006.wav]*+
- Down [menu_024.wav]*+
- Select [Blip_Select7.wav]*
- Narrator (game state dialog shown) [sucess1.mp3]*
- Left (Settings only) [menu_018.wav]*
- Right (Settings only) [menu_023.wav]*

### Game

- footsteps [shortfootsteps.wav]+
- watersplash [water-splash.mp3]+
  
  --------

- sword hit [attack-sword.mp3]+
- staff hit [attack-staff.mp3]+
- dagger hit [attack-dagger.mp3]+
- hands hit [attack-punch.mp3]+
- attack no hit [no-hit.wav]
- female player hurt [female-ow.mp3]+
- male player hurt [male-ow.mp3]+
- player bounced/bumped [bump.wav]

  --------

- open chest [chest.mp3]+
- close chest [chest2.mp3]+

  --------

- good magic x 12 [magic-audio-sprite.mp3]
- bad magic x 12 [magic-audio-sprite-bad.mp3]
- failed magic (no target) [magic-down.mp3]*
- [magic-down-2.mp3] irretating to listens to+
- [shortspell1.wav] old deprecated spell sound+

  --------

- magic powerlevel up [levelup.mp3]+
- (max) health up [levelup2.mp3]*+
- progression up (animal spawn) [powerup.mp3]*
- progression down (animal died) [duii-laser.mp3]*
- new unlock -> game state dialog shown [sucess1.mp3]*
  
  --------

- game over by falling [game-over.mp3]*
- game over killed [game-over2.mp3]*
- game won [win.mp3]*
