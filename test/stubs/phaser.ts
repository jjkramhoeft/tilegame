// Minimal Phaser stub used ONLY by unit tests (wired up via the `phaser` alias
// in vitest.config.ts). The pure-logic modules under test do a value-import of
// Phaser but, at module-eval time, the only thing that actually runs is
// `new Phaser.Events.EventEmitter()` in event-bus.ts. A few members are also
// referenced inside function bodies; we stub just enough to keep them callable.
// This keeps unit tests fast and free of the real (browser-coupled) engine.

class EventEmitter {
  #listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  #add(event: string, fn: (...args: unknown[]) => void): void {
    const list = this.#listeners.get(event) ?? [];
    list.push(fn);
    this.#listeners.set(event, list);
  }

  on(event: string, fn: (...args: unknown[]) => void): this {
    this.#add(event, fn);
    return this;
  }

  once(event: string, fn: (...args: unknown[]) => void): this {
    const wrapper = (...args: unknown[]): void => {
      this.off(event, wrapper);
      fn(...args);
    };
    this.#add(event, wrapper);
    return this;
  }

  off(event: string, fn: (...args: unknown[]) => void): this {
    const list = this.#listeners.get(event);
    if (list) {
      this.#listeners.set(event, list.filter((f) => f !== fn));
    }
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    const list = this.#listeners.get(event) ?? [];
    list.slice().forEach((fn) => fn(...args));
    return true;
  }

  removeAllListeners(): this {
    this.#listeners.clear();
    return this;
  }
}

let uuidCounter = 0;

export const Events = { EventEmitter };

export const Math = {
  RND: { uuid: (): string => `stub-uuid-${++uuidCounter}` },
  // Deterministic: always returns the low bound so tests stay reproducible.
  Between: (min: number): number => min,
};

export const Scenes = { Events: { SHUTDOWN: 'shutdown' } };

export const Input = {
  Keyboard: { KeyCodes: {}, JustDown: (): boolean => false },
};

export default { Events, Math, Scenes, Input };
