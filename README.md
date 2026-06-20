# The First Garden — *The Gardener's Apprentice*

A top-down RPG built with **Phaser 4** and **TypeScript**, where the player *creates the map while playing*. Cast magic to place tiles, unlock biomes, grow a world, and fill it with life — inspired by Genesis and C.S. Lewis' *The Magician's Nephew*.

## Documentation

| Doc | What's in it |
| --- | --- |
| [`GameMechanics.md`](GameMechanics.md) | Full game design: biomes, progression, the 13 game states, characters, UI, audio. |
| [`CLAUDE.md`](CLAUDE.md) | Architecture overview + module map (also loaded by Claude Code each session). |
| [`STATE_MACHINES.md`](STATE_MACHINES.md) | How the FSM engine works and how the character / game-progression machines are wired. |
| [`ADDING_A_CREATURE.md`](ADDING_A_CREATURE.md) | Step-by-step recipe for adding a new animal or enemy. |
| [`TESTING.md`](TESTING.md) | Unit (Vitest) and smoke (Playwright) tests, and the debug-boot hooks. |
| [`todo.md`](todo.md) | Working backlog. |

## Getting Started

[Node.js](https://nodejs.org) is required.

```bash
npm install     # install dependencies
npm run dev     # launch the dev server at http://localhost:8080
```

### Available Commands

| Command | Description |
| --------- | ------------- |
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | `dev` without sending anonymous template data (see "About log.js") |
| `npm run build-nolog` | `build` without sending anonymous template data (see "About log.js") |

## Tech Stack

- **Phaser 4.1** — game engine (Arcade physics, zero gravity)
- **TypeScript 5.7**
- **Vite 6** — dev server and bundler (config in `vite/config.*.mjs`)

## Project Structure

```
index.html              HTML host page
src/main.ts             Bootstrap → calls StartGame
src/game/main.ts        Phaser config + scene list (entry point)
src/game/
  scenes/               8 scenes (preload, intro, game, ui, map, …) + debug scenes
  ground/               Dynamic tilemap world (earth, creator, tile, blocking-boxes)
  game-objects/         player/, enemies/ (animals + enemies), weapons/, objects/
  components/           Entity behaviors (game-object/) + state machines (state-machine/)
  spellcasting/         Tile placement + cast VFX
  spawning/             Animal & chest spawn services
  progression/          Game-progression tracking
  systems/              Per-frame world systems (falling, lava, swimming)
  common/               Assets, event bus, save/load, config, texts, types
public/assets           Sprites, audio, etc. — served directly at runtime
public/style.css        Global layout styles
```

See [`CLAUDE.md`](CLAUDE.md) for a per-module breakdown and how the game boots.

## Development & Debugging

**Debug mode.** In the **Settings** scene, set Difficulty to **Debug**. This flips one switch that:

- **Seeds the world immediately** — `GameScene` skips the narrated progression (`GameProgression.start()` is never called) and runs `#startDebugGameplay()`, which places the starting tile and uses the helpers in [`src/game/scenes/debug/`](src/game/scenes/debug) (`debug-chests`, `debug-blocking`, `debug-enemies`) to spawn all chests, sample blocking tiles, every enemy/critter, and void markers, then unlocks the map.
- **Enables verbose logging** — turns on `ENABLE_LOGGING` (`src/game/common/config.ts`), which surfaces state-machine transitions in the console.

This is the fastest way to exercise creatures, chests, and the map without playing through the full progression.

> Planned (see [`todo.md`](todo.md)): jumping directly to a game state with the `1`–`9` keys in debug mode. Not yet implemented.

**Tests.** `npm test` runs the Vitest unit suite (fast, no browser); `npm run test:e2e` runs a Playwright smoke test that boots the game via `?debug=1` and checks it renders, moves, and is error-free. See [`TESTING.md`](TESTING.md). Prefer a unit test for logic changes over a manual playthrough. You can also just hit `?debug=1` in the dev server to deep-link into a seeded world.

> **Note for AI agents:** don't auto-launch the editor/agent browser preview to verify changes — the headless preview throttles `requestAnimationFrame` and stalls Phaser's loader/timers, so the game often never finishes booting there. Attempt a live preview only when explicitly asked; otherwise verify with a build plus the unit/e2e tests. See [`TESTING.md`](TESTING.md).

## Deploying to Production

Run `npm run build`; the bundle and assets are written to `dist`. Deploy the **entire** contents of `dist` to any static web server.

## About log.js

`log.js` makes a single silent API call to `gryzor.co` (owned by Phaser Studio Inc.) reporting only the template name, dev/prod, and Phaser version — no personal or project data. Use the `*-nolog` commands to skip it, or delete `log.js` and remove its call from the `scripts` section of `package.json`.
