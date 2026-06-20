# To-Do — The First Garden

> **Legend:** `[ ]` open · `[x]` done · `[~]` in progress · 🔒 blocked (needs asset) · ⚠️ needs acceptance criteria before it's actionable
> **Docs:** game design → `GameMechanics.md` · state machines → `STATE_MACHINES.md` · new creatures → `ADDING_A_CREATURE.md` · testing/debug → `TESTING.md`

## 🐞 Bugs

- [ ] Fix player ↔ mountain collision
- [ ] Fix spell tint: no forest-green before forest is unlocked (not even in the garden)

## 🧍 Player & combat

- [ ] Armor rules: no swimming in armor (take damage if the player tries); take less damage while wearing armor

## 🤖 Enemy / animal AI

- [ ] **follow-move-state** to replace bounce-movement — options: stay-on-biome, hunt/chase/follow; prioritize horizontal movement and move longer *(also unblocks eveState)*
- [ ] Enable animals to be pushed into the void and fall
- [ ] Animal interaction on the `x` key for Bull & Piglet (Muhh & Oink)— ⚠️ needs new sounds to work

## 🗺️ Map

- [ ] Rework map to follow progression (avoid confusion) — ⚠️ define what the fixed map should look like
- [ ] Add red tint to map tied to animals killed and lizard state
- [ ] Use animated tiles to highlight latest unlocked, closest next unlock (Crystal animation for latest unlocked, Void animation for next)

## ✨ VFX / particles

- [ ] Rework spell particles: scale particle count with player power level; vary by target (decoration, blocking, chest, animal)

## 🔊 Audio

- [ ] SFX for missing events: health-up, animal-progression-up, attack-without-hit, enemy-attack
- [ ] New chest to start/stop music — given by the narrator at the first-animal game state

## 🌍 Localization & balance

- [ ] easy/hard difficulty should change numbers — ⚠️ list target values (the `DIFFICULTY_HARD_*` constants in `common/config.ts`: speed, wait time, level-up divider)

## 🛠️ Tooling

- [ ] Debug mode: trigger game states by pressing keys `1`–`9` → `TESTING.md`

## 🔒 Blocked — needs new assets

- [ ] Record narrator voice-over — EN: Nathan; DA: Ulla, Taina, or me
- [ ] Break-a-tile animation when an animal is killed
