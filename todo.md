# To-Do — The First Garden

> **Legend:** `[ ]` open · `[x]` done · `[~]` in progress · 🔒 blocked (needs asset) · ⚠️ needs acceptance criteria before it's actionable
> **Docs:** game design → `GameMechanics.md` · state machines → `STATE_MACHINES.md` · new creatures → `ADDING_A_CREATURE.md` · testing/debug → `TESTING.md`

## 🐞 Bugs

- [ ] Fix Skeleton movement, attack & hit
- [ ] Fix player ↔ mountain collision
- [ ] Fix enemy attack animation
- [ ] Fix spell tint: no forest-green before forest is unlocked (not even in the garden)

## 🎮 Boss arc — dependency chain, do in order

- [ ] Add **Lizardman** creature w/ dagger from the included sprite sheets — preload + animations (model on Player, not the critter pattern) → see `ADDING_A_CREATURE.md`
- [ ] **bossFightState** — Lizardman boss with timed snake-minion waves (start with sound) → `STATE_MACHINES.md`
- [ ] **victoryState** — triggered by boss end or animal progression maxed
- [ ] **eveState** — companion dialog → place companion → hand off to follow-move-state *(depends on "follow-move-state" under Enemy AI)*

## 🧍 Player & combat

- [ ] Armor rules: no swimming in armor (take damage if the player tries); take less damage while wearing armor
- [ ] Lunge toward the player on attack (add movement in the direction of the player)

## 🤖 Enemy / animal AI

- [ ] **follow-move-state** to replace bounce-movement — options: stay-on-biome, hunt/chase/follow; prioritize horizontal movement and move longer *(also unblocks eveState)*
- [ ] Enable animals to be pushed into the void and fall
- [ ] Animal interaction on the `x` key for Bull & Piglet (Muhh & Oink)

## 🗺️ Map

- [ ] Rework map to follow progression (avoid confusion) — ⚠️ define what the fixed map should look like
- [ ] Add counters to map: time played, tiles placed, decorations, blockings, animals living & killed
- [ ] Add red tint to map tied to animals killed and lizard state
- [ ] Use animated tiles to highlight latest unlocked, closest next unlock (Crystal animation for latest unlocked, Void animation for next)

## ✨ VFX / particles

- [ ] Rework spell particles: scale particle count with player power level; vary by target (decoration, blocking, chest, animal)
- [x] Add particles: place-garden, cloud-disperse, first-tile, player-placement
- [ ] Triple ambient dust particles in Intro, Settings, Credits & Reflection scenes 

## 🔊 Audio

- [ ] SFX for missing events: health-up, animal-progression-up, attack-without-hit, enemy-attack
- [ ] New chest to start/stop music — given by the narrator at the first-animal game state

## 🌍 Localization & balance

- [ ] Danish text is too long — trim — ⚠️ specify which strings / which scene
- [ ] easy/hard difficulty should change numbers — ⚠️ list target values (the `DIFFICULTY_HARD_*` constants in `common/config.ts`: speed, wait time, level-up divider)

## 🛠️ Tooling

- [ ] Debug mode: trigger game states by pressing keys `1`–`9` → `TESTING.md`

## 🔒 Blocked — needs new assets

- [ ] Record narrator voice-over — EN: Nathan; DA: Ulla, Taina, or me
- [ ] Break-a-tile animation when an animal is killed
