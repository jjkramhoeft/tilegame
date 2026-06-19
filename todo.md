# Implementations ToDo

- Player extra rules
  - no swimming when wearing armor (take damage if player is trying to swim in armor)
  - take less damage when wearing armor

- Alternative to bounce-movement
  - Could be stay on biome, Could be hunt/chase/follow
  - Bounce-move-state -> follow-move-state (intaeract w. animal)
  - Prioriteze hirizontal movement, and move longer 

- Implement deferred gameStates
  - bossFightState
  - victoryState
  - eveState
    - Present Companion dialog, Place, Make followMoveState

- Fix Skeleton movement and attack & hit

- Fix colliding with mountain and player

- Add Lizard w. dagger from included sprite sheets
  - Preload
  - Animations (as Player)

- Implement boss; Lizard character with snake minions
  
- Sound efffect on all missig events  
  - heath up
  - animal progression up
  - attack without hit
  - enemy attack

- Fix enemy attack anim
- Add movement to attack (in direction of player)

- Triple ambient dust particles in Intro, Settings, Credits & Reflections scenes

- Rework map to follow progression (avoid confusion)
- Add counters to map: Time played, Tiles placed, decorations, blockings & Animals living, killed
- Add red tint to map related til animals killed and lizard state

- Add animal interaction on x-key on Bull and piglet (Muhh & Oink)

- Enable animal to be pushed into the void and fall

- New chest to start/stop music
  Given by narrator at first animal game state

- easy/hard should change numbers

- dansk tekst er for lang

- rework spell particles to scale number of particles with player power level
- rework spell particles to change on decoration, blocking, chest & animals
- fix spell tint, no forest green before unlocked, not even in garden

- Add particels to place garden
- Add particles to cloud disperse
- Add particles to first tile
- Add perticles to player placement

- In debug mode, trigger Game States by pressing 1-9 key

## Implementations that require new asserts

- record voice-over for narrator. Nathan for english, Ulla, Taina or me for danish
- Break a tile when an animal is killed
