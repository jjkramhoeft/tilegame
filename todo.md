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

A nariator state, Player is passive.
No payer (visible) yet.
First introduction to the gameplay
- text: "...In the beginning the earth was formless and empty..."
- 3 sec pause
Place 1st tile
- 3 sec pause
- text: "...God create the earth and heavens and you, Move carefully..."
- 3 sec pause
- Place player
- Transition to First Tile Assignment State

#### First Tile State

Player is active, No nariator
Fist very simple play state.
player movement (can fall and die), player attack, and player cast with off sound and no effect
After move, cast and attack transition to Assignment State

#### Assignment State

A nariator state, Player is passive
No player movement
- 3 sec pause
- Text: "...And you shall help in the creating, make the land, fill it with green forest and then animals"
- 1 sec pause
- Place target void
- Transition to next state

#### Baby Steps State

Player is active, No nariator
Second simple play state
No/Week tile creation outside target, and only rock and perhaps desert
when target are filled and 2 blocking are placed and player is below center transition to Garden State

#### Garden State

A nariator state, The Player is passive.
No player movement
- Text: "...Not just baren rock and wasteland, no green fields, flowing rivers and trees..."
- Change tiles one by one to a more fertiel and green, add water like an river, add bushes and small trees, and then add the big tree.
- Text: "...Your assignmment is create a lush forest with many animals, if you pick an evil path you will have to face the demon"  
- Add box (a chest) of fuit, where the player can interact to eat an apple and get full life
- Tramsition to regularPlayState

#### Regular Play State

The player is active, No nariator
The main gameplay state.
Progres by unlocking tile biomes, trees and animals. Flee or fight enemies.
Can transistion to many game states: 

#### First Tree State

A nariator state, Player is passive.
No player movement.
Triggered by first blocking forest tree, desert palm/cacti, swamp tree, from regular state
- Text "You added you first tree, fine here can animal trive..."
- Transition to regular game state

#### First Animal State

A narator state, No player movement.
Triggered by first Chichken, Lamb ect.
- Text "You are not alone! let life multiply..."
- Transistion to regular Game State

#### Eve State

To be implemented later. Needs futher refinement.
A nariator state, The Player i passive.
No player movement
Trigger by ???
Adam or Eve depnding on what play play as.
Same gear and weapon as player, but can not be changed
Following player.
Auto attacks
Multiply aimals
Adds to max health to player
- Text: "It is not good to be alone..."
- Place Eve
- Text: ", Here is a companion fitting for you..."
- Transition to Regular Play State

#### Boss Fight State

To be implemented later. Needs futher refinement.
The player is active, No nariator.
Triggered by ???
Lizardman boss, do timed minions attack starting with sound

#### Game Over State

A Nariator State, The player is passive.
Triggered by player death
Simple Game Over
- Text: "Game Over..."
- on exit then exit to main menu (intro-scene)

#### Victory State

A Nariator State, The player is passive.
Trigger by boss fight end or aminal progressin maxed
- Text: "You have won!.."
- on exit then exit to main menu (intro-scene)