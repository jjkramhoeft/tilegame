The game need a narrator to guide the player and introduce the game mechanics, and some scripted cut scene to make the progression memorable.
The narrators text should be shown via the narratorDialog in the UI-scene.

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
