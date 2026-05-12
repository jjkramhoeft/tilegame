# Implementations ToDo

## Implementations that do not require new asserts  

- Fix multiple of the same chest in the same cast at higer powerlevels
- Fix spawning blocking on top of chests
- Finalize aminal placment (pick a better placement tile and pick animal fitting the unlocked biome)
- Rotate void animation, for more variation
- Add 'water-splash' sound when swimming (in sted of footsteps)
- walk slower when waering armor
- take less damage when waering armor
- Alternative to bounce-movement
- Consistent keybord-only input for intro-scene, credits-scene & settings-scene
- Implemet progression framework (use state-machine to make (implement) a base-game-state, the base-game-state are extended into 9 different game states - see below)

## Implementations that require new asserts

- Find snake enemy sprite and animation
- Implement boss; Lizard character with snake minions
- Find player hit sounds; player takes hit, Enemy takes hit
- Find Mountain sprite sheet
- Add chest placement/open sound effect
- More diverser spell sounds and animation
- Add distinct frame for nariator
- Add water ponds to swamp as decorations
- add monster (Zombie)

----------------------------------------------------------------------

### Game States

#### Start State

introduction, no payer, fixed time and event in this state
text: "...In the beginning the earth was formless and empty..."
3 sec pause
Place 1st tile
3 sec pause
text: "...God create the earth and heavens and you, Move carefully..."
3 sec pause
Place player
Transition to First Tile Assignment State

#### First Tile State

player movement (can fall and die), player attack, and player cast with off sound and no effect
after move, cast and attack transition to Assignment State

#### Assignment State

No player movement
3 sec pause
text: "...And you shall help in the creating, make the land, fill it with green forest and then animals"
1 sec pause
Place target void
transition to next state

#### Baby Steps State

No/Week tile creation outside target, and only rock and perhaps desert
when target are filled and 2 blocking are placed and player is below center transition to Garden State

#### Garden State

No player movement
Text: "...Not just baren rock and wasteland, no green fields, flowing rivers and trees..."
Change tiles one by one to a more fertiel and green, add water like an river, add bushes and small trees, and then add the big tree.
Text: "...Your assignmment is create a lush forest with many animals, if you pick an evil path you will have to face the demon"  
Add box (a chest) of fuit, where the player can interact to eat an apple and get full life

#### Regular State

Progres by unlocking tile biomes, trees and animals

#### First Tree State

Triggered by first blocking forest tree, desert palm/cacti, swamp tree, from regular state
Text "You added you first tree, fine here can animal trive..."

#### First Animal State

Triggered by first Chichken, Lamb ect.
Text "You are not alone"

#### Eve State

Trigger by ???
Adam or Eve depnding on what play play as.
Same gear and weapon as player, but can not be changed
Following player.
Auto attacks
Multiply aimals
Adds to max health to player

#### Boss Fight State

Triggered by ???
Lizardman boss, do timed minions attack starting with sound

#### Game Over State

Triggered by player death
Simple Game Over
Text: "Game Over..."

#### Victory State

Trigger by boss fight end or aminal progressin maxed
Text: "You have won!.."