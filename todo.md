# Implementations ToDo

## Implementations that do not require new asserts  

### Most importend

- add control section to settings
- fix animals walking on water (lava? mountains?)

- Finalize aminal placement (pick a better placement tile and pick animal fitting the unlocked biome)
  - Need four naborhg of same biome, target one not blocked.
- no swimming when wearing  armor (take damage if player is trying to swim in armor)
- take less damage when wearing  armor
- Alternative to bounce-movement
- Implement deferred gameStates
  - bossFightState
  - victoryState
  - eveState
- More uniform tile creation, to get larger area of the same biome
  - only new (not fitting) biome i only one nabo
- Add animal and enemies from included sprite sheets
  - Lizard w. dagger  (as Player)
  
  levelup2.mp3 (heath or animal progression??)
- repeat fruit chest sound put healt on max
- Bounce-move-state -> follow-move-state (intaeract w. animal)
- Implement boss; Lizard character with snake minions
- Fix escape dialog
- Remove exces debug info

## Implementations that require new asserts

### Most importend

- Find Mountain sprite sheet
- Add water ponds to swamp as decorations
- Bump sound when pushed by animals
- find sound for spell cast has no target

- record voice-over for narrator. Nathan for english, Ulla, Taina or me for danish
- Pair of animals
- Break a tile when an animal is killed
- easy/hard should change numbers
- dansk tekst er for lang
- find better 8-bit UI sound effects
- HUD rewrite - Simpler one pr. icon system
  - Health: Full heart, Spinning heart
  - Power
  - Progression

## Experiment

- Cast Spell Visual Effect with Particles
- Migrate to a full Phaser DataManager