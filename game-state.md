The game need a narrator to guide the player and introduce the game mechanichs, and som scripted cut seence to make the progression memorable.
The narrators text should be shown via an text dialog in the UI-scene.

Implement the game play progression by using StateMachine (from state-machine.ts) to make (implement) a BaseGameState (new file base-game-state.ts), the base-game-state are extended into 12 different game states - see below

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

An active player game state, No narrator
Fist very simple play state.
player movement (can fall and die), player attack, and player cast with off sound and no effect
After move, cast and attack transition to Assignment State

#### Assignment State

A narrator game state, Player is passive.
No player movement
- 3 sec pause
- Text: "...And you shall help in the creating, make the land, fill it with green forest and then animals"
- 1 sec pause
- Place target void
- Transition to next state

#### Baby Steps State

An active player game state, No narrator
Second simple play state
No/Week tile creation outside target, and only rock and perhaps desert
when target are filled and 2 blocking are placed and player is below center transition to Garden State

#### Garden State

A narrator game state, Player is passive.
No player movement
- Text: "...Not just baren rock and wasteland, no green fields, flowing rivers and trees..."
- Change tiles one by one to a more fertiel and green, add water like an river, add bushes and small trees, and then add the big tree.
- Text: "...Your assignmment is create a lush forest with many animals, if you pick an evil path you will have to face the demon"  
- Add box (a chest) of fuit, where the player can interact to eat an apple and get full life
- Tramsition to regularPlayState

#### Regular Play State

An active player game state, No narrator
The main gameplay state.
Progres by unlocking tile biomes, trees and animals. Flee or fight enemies.
Can transistion to many game states: 

#### First Tree State

A narrator game state, Player is passive.
No player movement.
Triggered by first blocking forest tree, desert palm/cacti, swamp tree, from regular state
- Text "You added you first tree, fine here can animal trive..."
- Transition to regular game state

#### First Animal State

A narrator game state, Player is passive.
Triggered by first Chichken, Lamb ect.
- Text "You are not alone! let life multiply..."
- Transistion to regular Game State

#### Eve State

To be implemented later. Needs futher refinement.
A narrator game state, Player is passive.
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
An active player game state, No narrator
Triggered by ???
Lizardman boss, do timed minions attack starting with sound

#### Game Over State

A narrator game state, Player is passive.
Triggered by player death
Simple Game Over
- Text: "Game Over..."
- on exit then exit to main menu (intro-scene)

#### Victory State

A narrator game state, Player is passive.
Trigger by boss fight end or aminal progressin maxed
- Text: "You have won!.."
- on exit then exit to main menu (intro-scene)
