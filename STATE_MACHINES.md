# State Machines

The game runs on one small, generic state-machine class used in two distinct ways:

1. **Character FSM** — one instance per `CharacterGameObject` (player and every enemy/animal). Drives movement and actions.
2. **Game-progression FSM** — a single instance owned by `GameProgression`. Drives the scripted game flow (narrator beats, unlocks, game over, …).

Both share the same engine; only the states differ.

## The engine

`src/game/components/state-machine/state-machine.ts`

```ts
interface State {
  stateMachine: StateMachine;
  name: string;
  onEnter?(args: unknown[]): void;
  onUpdate?(): void;
  onExit?(): void;
}
```

A `StateMachine` is a `Map<name, State>` plus a `currentState`. Key methods:

- `addState(state)` — register a state (also back-links `state.stateMachine = this`). Re-adding the same name replaces it.
- `setState(name, ...args)` — request a transition.
- `update()` — call once per frame: drains one queued transition, then runs `currentState.onUpdate()`.

### Transition flow (`setState`)

```
setState(name)
  ├─ unknown name?        → console.warn, no-op
  ├─ already current?     → no-op
  ├─ mid-transition?      → push to queue, return   ← re-entrancy guard
  └─ otherwise:
       isChangingState = true
       currentState.onExit()
       currentState = states[name]
       currentState.onEnter(args)
       isChangingState = false
```

**Why the queue matters:** if `onExit`/`onEnter` (or anything they call synchronously) calls `setState` again, that call is *queued*, not applied immediately — it runs on the next `update()` tick (one per tick). So a state that fires several `setState` calls in `onEnter` does **not** transition instantly; the machine advances one queued step per frame. Design transitions around this.

## Character FSM

| Concern | Location |
| --- | --- |
| State keys | `states/character/character-states.ts` (`CHARACTER_STATES`) |
| Base class | `states/character/base-character-state.ts` (holds `_gameObject`, `_resetObjectVelocity()`) |
| Concrete states | `states/character/*-state.ts` (idle, move, attack, casting, swim-move, hurt, death, falling, bounce-idle/move, open-chest, natural-attack, …) |
| Owner / lifecycle | `game-objects/common/character-game-object.ts` |

**Lifecycle:** `CharacterGameObject` creates `new StateMachine(id)` in its constructor. Each subclass registers the states it supports and sets an initial state — e.g. `player.ts` registers Idle/Move/Attack/Casting/SwimMove/Falling/Death/OpenChest and calls `setState(IDLE_STATE)`. `CharacterGameObject.update()` calls `stateMachine.update()` every frame, so **a character whose `update()` isn't ticked has a frozen FSM.**

**Transitions are pull-based:** a state polls input/conditions in `onUpdate` and calls `setState`. Example from `idle-state.ts`:

```ts
public onUpdate(): void {
  const controls = this._gameObject.controls;
  if (controls.isMovementLocked) return;
  if (controls.isAttackKeyJustDown) { this._stateMachine.setState(CHARACTER_STATES.ATTACK_STATE); return; }
  if (controls.isCastKeyJustDown && casterCanCast) { this._stateMachine.setState(CHARACTER_STATES.CASTING_STATE); return; }
  // …else move or idle
}
```

States can also be driven **externally**: `CharacterGameObject.hit()` forces `HURT_STATE` or `DEATH_STATE`, and physics callbacks push `FALLING_STATE`/`SWIM_STATE`.

## Game-progression FSM

| Concern | Location |
| --- | --- |
| State keys | `states/game/game-state-keys.ts` (`GAME_STATES`, 13 states) |
| Base class | `states/game/base-game-state.ts` |
| Concrete states | `states/game/*-state.ts` (start, first-tile, assignment, baby-steps, garden, regular, first-tree, first-animal, help-with-tilecasting, eve, boss-fight, game-over, victory) |
| Owner / lifecycle | `progression/game-progression.ts`, ticked by `GameScene` |

**Lifecycle:** `GameProgression` builds `new StateMachine('game-progression')`, registers all 13 states in its constructor, and is ticked from `GameScene.update()`. `GameProgression.start(initial = START)` kicks it off. See `GameMechanics.md` for each state's narrative role and the full transition map.

**Transitions are mostly scripted, not per-frame polling.** `BaseGameState` provides the toolkit:

- `_pause(ms, cb)` — delayed callback registered as a tracked timer.
- `_showNarrator(textKey, onClosed?)` — emits the narrator dialog over the event bus and (optionally) waits for it to be dismissed before continuing.
- `_transitionTo(name, ...args)` — wraps `setState` **and** mirrors the state name into `GameDataManager` (for save/load).
- `onExit()` — cancels pending timers and removes the narrator listener.

A typical state chains pause → narrator → pause → `_transitionTo(...)` inside `onEnter` (see `help-with-tilecasting-state.ts`). `defaultWaitTime` (500 ms) is multiplied by a difficulty factor on HARD.

**External transition:** a `PLAYER_DEFEATED` event makes `GameProgression` force `GAME_OVER` (unless progression isn't running, e.g. debug scenes).

### Critical invariant

If a game state overrides `onExit()`, it **must call `super.onExit()`**, otherwise its pending timers survive the transition and can fire a stale `setState` from a state that's no longer current. The base `_pause`/`onExit` plumbing exists precisely to prevent that class of bug.

## Adding a state

**Character state:**
1. Add a key to `CHARACTER_STATES` (`character-states.ts`).
2. Create `states/character/<name>-state.ts` extending `BaseCharacterState`; implement `onEnter`/`onUpdate`/`onExit` as needed.
3. `addState(new YourState(this))` in the entity that should support it (e.g. `player.ts`, or a specific enemy).
4. Transition into it via `setState(CHARACTER_STATES.YOUR_STATE)` from another state's `onUpdate`.

**Game state:**
1. Add a key to `GAME_STATES` (`game-state-keys.ts`).
2. Create `states/game/<name>-state.ts` extending `BaseGameState` (call `super.onExit()` if you override `onExit`).
3. `addState(new YourState(scene))` in the `GameProgression` constructor.
4. Transition into it with `_transitionTo(GAME_STATES.YOUR_STATE)` from another state, and document the trigger in `GameMechanics.md`.

## Persistence

Both the game FSM (`GameProgression.start` / `setState` / `_transitionTo`) write the current state name into `GameDataManager`, so progress is part of the saved game. The character FSM is **not** persisted — characters re-enter their initial state on load.
