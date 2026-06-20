# Testing

Two complementary layers replace slow manual playthroughs:

| Layer | Tool | Runs | Covers | Command |
| --- | --- | --- | --- | --- |
| **Unit** | Vitest | Node, ~0.6s | Pure logic — unlock cascade, state machine, input | `npm test` |
| **Smoke / E2E** | Playwright | Real browser via dev server, ~5s | Boot, render, input, integration, console errors | `npm run test:e2e` |

```bash
npm test            # unit tests, single run
npm run test:watch  # unit tests, watch mode
npm run test:e2e    # browser smoke test (first run: npx playwright install chromium)
```

## Unit tests (`test/unit/`)

Fast, deterministic, no browser. The pure-logic modules value-import Phaser, but the only thing that executes at import time is `new Phaser.Events.EventEmitter()`, so unit tests alias `phaser` to a tiny stub (`test/stubs/phaser.ts`, wired in `vitest.config.ts`). That keeps the engine out of the test process entirely.

Good candidates for new unit tests are anything that doesn't need a live `Scene`:

- `GameDataManager` — progression/unlock cascade, tile counts, power level (`#unlockCriteriaMap`). It's a singleton; call `resetForNewGame()` in `beforeEach`.
- `StateMachine` — transitions, the same-state no-op, unknown-state warning, and the re-entrancy queue (see `STATE_MACHINES.md`).
- `InputComponent` — the programmatic input seam (`controls.isUpDown = true`, …).
- Pure helpers in `common/` and `utils.ts`.

`GameProgression`, scenes, and `SpellCastingService.cast()` are Phaser-coupled — exercise those through the E2E layer instead (or extract pure helpers first).

## E2E smoke test (`test/e2e/`)

Playwright boots the actual game through the Vite dev server and drives it like a player. Two **dev-only hooks** make this fast and assertable:

- **`?debug=1` deep-link** — `PreloadScene` skips the menu and boots straight into a seeded `GameScene` in debug mode (all chests/creatures spawned, map unlocked, no narration). See `GameScene.#startDebugGameplay()`.
- **`window.__game` / `window.__gameData`** — exposed in dev builds only (gated on `import.meta.env.DEV` in `src/game/main.ts`). Read game state from a test via `__game.scene.getScene('game-scene').player`, etc.

The current smoke test (`smoke.spec.ts`) navigates to `/?debug=1`, waits for the GameScene + player, walks right, and asserts the player moved **and** that no console/page errors fired. It also writes before/after screenshots to `test-results/` (gitignored) for visual inspection.

**Input in E2E:** Phaser listens for keys on the window, so `page.keyboard.down('ArrowRight')` works. Bindings: arrows/WASD move, `Z`/`R` attack, `X`/`Enter` action, `C`/`T` cast, `M` map.

**Extending it:** add cases that cast a tile (`C`) and assert `__gameData.data.tilesPlaced` / `unlockedSpellCasting` grew, open a chest, or screenshot a specific biome. Because debug mode seeds everything, you can reach states that would take minutes to reach by hand.

## Browser preview — only on request

Do **not** auto-launch a dev-server browser preview (the editor/agent `preview_*` tools) to verify changes. The headless preview throttles `requestAnimationFrame`, which stalls Phaser's asset loader part-way through boot and freezes all time-based logic (garden tile placement, narrator pauses), so the game frequently never reaches the state you wanted to check.

Default verification is a clean build (`npm run build-nolog`) plus the unit and e2e suites above. Reserve the live browser preview for when the user explicitly asks for a visual check — otherwise leave the in-app visual confirmation to them.

## Not yet set up

No CI workflow runs these automatically.
