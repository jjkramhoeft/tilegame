# Adding a Creature (Animal or Enemy)

Animals and enemies are the same kind of object in code: a subclass of `CharacterGameObject` registered as a `CreatureType`. The spawn service splits them into two **groups** — `'critter'` (passive animals, counted as living-creature progression) and `'enemy'` (hostile). The difference is behavioral, set by which character states you register and the initial state.

> The player is **not** a creature — it's its own thing (`game-objects/player/player.ts`). The boss Lizardman in `todo.md` ("Add Lizard … as Player") should be modeled on the player (8-direction movement, weapon, full animation set), not the simple critter pattern below.

Use `Lamb` (simplest critter) or `Snake` (enemy with AI + contact attack) as your copy-paste template.

## The touch-points

A new creature `Foo` touches these files, roughly in order:

| # | File | What to add |
| --- | --- | --- |
| 1 | `public/assets/Foo.png` | The sprite sheet itself. |
| 2 | `src/game/common/assets.ts` → `ASSET_KEYS` | `FOO: 'Foo'` — the texture key. |
| 3 | `src/game/common/asset-loader.ts` | Load entry: `{ key: ASSET_KEYS.FOO, path: 'assets/Foo.png', frameConfig: { frameWidth: 32, frameHeight: 32 } }`. |
| 4 | `src/game/common/assets.ts` | `export const FOO_ANIMATION_KEYS = { WALK_DOWN, …, IDLE_DOWN, … }` (+ `ATTACK_*` if it attacks). |
| 5 | `src/game/common/animation-loader.ts` → `createMobAnimations()` | Build the animations (see below). |
| 6 | `src/game/game-objects/enemies/foo.ts` | The `Foo extends CharacterGameObject` class (see below). |
| 7 | `src/game/common/common.ts` → `CREATURE_TYPES` | Add `'foo'` to the array (this is the typed creature id). |
| 8 | `src/game/spawning/animal-spawn-service.ts` → `ANIMALS_BY_BIOME` | Register `{ type: 'foo', group: 'critter' \| 'enemy', create: (scene, position) => new Foo({ scene, position }) }` under the biome(s) it spawns in. |
| 9 | `src/game/common/config.ts` | Tuning constants: `ENEMY_FOO_SPEED`, `ENEMY_FOO_MAX_HEALTH`, `ENEMY_FOO_HURT_PUSH_BACK_SPEED`, plus attack params if hostile. |
| 10 | map (optional) | `MAP_FOO` asset key + load entry, then an entry in the creatures list in `scenes/map-scene.ts` with `imageKey`, position, and the `CASTING_UNLOCKS.*` flag for its biome. |
| 11 | `GameMechanics.md` | Add it to the "Biome and their animals" table. |

## Step 5 — animations (`createMobAnimations`)

Most animals use a 24-frame, 4-direction sheet (rows: down, up-side variants). Register all of them with the shared helper:

```ts
createFourDirectionAnimalAnimations(anims, FOO_ANIMATION_KEYS, ASSET_KEYS.FOO, /*walkFps*/ 6, /*idleFps*/ 4);
```

If the sheet's layout differs (extra attack rows, non-standard frame ranges), hand-roll `anims.create({ key, frames: anims.generateFrameNumbers(ASSET_KEYS.FOO, { start, end }), … })` per direction — see how `Snake` is built right after the helper calls in `createMobAnimations`.

`createMobAnimations` runs during `PreloadScene` (via `createAllAnimations`). Aseprite-based sprites (currently only the spider) use `anims.createFromAseprite(...)` instead.

## Step 6 — the entity class

```ts
export class Foo extends CharacterGameObject {
  constructor(config: { scene: Phaser.Scene; position: Position }) {
    // Map the engine's CHARACTER_ANIMATIONS slots to your animation keys.
    // No hurt/death frames? Fall back to IDLE_<dir>, like Lamb/Snake do.
    const animationConfig: AnimationConfig = {
      WALK_DOWN: { key: FOO_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true },
      /* …WALK/IDLE per direction; HURT_*/DIE_* fall back to IDLE if no frames… */
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.FOO,
      frame: 0,
      id: `foo-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_FOO_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: false,
      maxLife: ENEMY_FOO_MAX_HEALTH,
      contactDamage: 0, // hearts dealt to the player on contact; 0 for harmless critters
    });

    this.setScale(1.5);
    this.body?.setSize(20, 14, true); // tighten the hitbox to the visible body
    this.body?.setOffset(6, 14);

    // Register states + pick the initial one (this decides critter vs enemy behavior):
    // — Passive critter: Idle + BounceMove + BounceIdle, start in BOUNCE_MOVE_STATE.
    // — AI enemy:        Idle + Move (+ NaturalAttackState), start in IDLE_STATE.
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new BounceMoveState(this));
    this._stateMachine.addState(new BounceIdleState(this));
    this._stateMachine.addState(new HurtState(this, ENEMY_FOO_HURT_PUSH_BACK_SPEED));
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.setState(CHARACTER_STATES.BOUNCE_MOVE_STATE);
  }
}
```

**Critter vs enemy at a glance:**

- **Critter** (Lamb): states Idle / BounceMove / BounceIdle / Hurt / Death; initial `BOUNCE_MOVE_STATE`; `contactDamage: 0`; group `'critter'`. Bounce wandering only — no targeting.
- **Enemy** (Snake): states Idle / Move / Hurt / Death / `NaturalAttackState`; initial `IDLE_STATE`; group `'enemy'`. Add a simple AI loop — override `enableObject()` to start a random direction-change timer and override `update()` to detect the player in range and switch to `NATURAL_ATTACK_STATE` (copy Snake's `#changeDirection`/`#faceTarget`). The player is read off the scene as `(this.scene as { player?: CharacterGameObject }).player`.

See `STATE_MACHINES.md` for how character states drive behavior and how `addState`/`setState` work.

## Verify

`npm run dev`, then use the **enemy debug scene** (`scenes/debug/debug-enemies.ts`) to spawn the creature directly without playing through progression. In normal play it appears once its biome's animals are unlocked and a tile of that biome is cast.

## Gotcha checklist

- The spawn `type` string, the `CREATURE_TYPES` entry, and the map `type` must all match exactly — they're the same `CreatureType` literal.
- `GameDataManager.markCreatureEverCreated(type)` / `increaseLivingCreatureCount()` are called by the spawn service automatically; you don't call them in the entity.
- Forgetting to register the animations (step 5) or a missing animation key produces a blank/error sprite, not a crash — check the console.
- Adding to `CREATURE_TYPES` without a `MAP_FOO`/map entry is fine; the map list and the spawn list are independent.
