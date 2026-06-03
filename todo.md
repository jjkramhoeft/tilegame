# Implementations ToDo

## Implementations that do not require new asserts  

### Most importend

- add control section, show in settings and in first gamestate

- Player extra rules
  - no swimming when wearing armor (take damage if player is trying to swim in armor)
  - take less damage when wearing armor

- Alternative to bounce-movement
  - Could be stay on biome, Could be hunt/chase/follow
  - Bounce-move-state -> follow-move-state (intaeract w. animal)

- Implement deferred gameStates
  - bossFightState
  - victoryState
  - eveState
    - Present Companion dialog, Place, Make followMoveState

- Add animal and enemies from included sprite sheets
  - Preload
  - Animations
  - Lizard w. dagger  (as Player)
  
- Sound efffect on all missig events  
  - levelup2.mp3 (heath or animal progression??)
  - Implement boss; Lizard character with snake minions

- Repeat fruit chest, put healt on max

- New chest to start/stop music
  Given by narrator at first animal game state

- easy/hard should change numbers

- dansk tekst er for lang

- HUD rewrite - Simpler one pr. icon system
  - Health: Full heart, Spinning heart
  - Power
  - Progression

## Implementations that require new asserts

- Find Mountain sprite sheet
- Add water ponds to swamp as decorations
- record voice-over for narrator. Nathan for english, Ulla, Taina or me for danish
- Break a tile when an animal is killed

## Experiment

- Cast Spell Visual Effect with Particles
- Particel on into scene