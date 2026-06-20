import { describe, expect, it, vi } from 'vitest';
import { State, StateMachine } from '../../src/game/components/state-machine/state-machine';

function recordingState(name: string, log: string[], onEnterExtra?: () => void): State {
  return {
    stateMachine: undefined as unknown as StateMachine,
    name,
    onEnter: () => {
      log.push(`enter:${name}`);
      onEnterExtra?.();
    },
    onUpdate: () => log.push(`update:${name}`),
    onExit: () => log.push(`exit:${name}`),
  };
}

describe('StateMachine', () => {
  it('enters a state and reports currentStateName', () => {
    const sm = new StateMachine('t');
    const log: string[] = [];
    sm.addState(recordingState('A', log));

    sm.setState('A');

    expect(sm.currentStateName).toBe('A');
    expect(log).toEqual(['enter:A']);
  });

  it('runs onExit of the old state then onEnter of the new one', () => {
    const sm = new StateMachine('t');
    const log: string[] = [];
    sm.addState(recordingState('A', log));
    sm.addState(recordingState('B', log));

    sm.setState('A');
    sm.setState('B');

    expect(log).toEqual(['enter:A', 'exit:A', 'enter:B']);
    expect(sm.currentStateName).toBe('B');
  });

  it('ignores a transition to the state that is already current', () => {
    const sm = new StateMachine('t');
    const log: string[] = [];
    sm.addState(recordingState('A', log));

    sm.setState('A');
    sm.setState('A');

    expect(log).toEqual(['enter:A']);
  });

  it('warns and stays put when asked to switch to an unknown state', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const sm = new StateMachine('t');

    sm.setState('does-not-exist');

    expect(sm.currentStateName).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('queues a transition requested during onEnter and applies it on the next update()', () => {
    const sm = new StateMachine('t');
    const log: string[] = [];
    // A re-entrantly requests B while it is still entering.
    sm.addState(recordingState('A', log, () => sm.setState('B')));
    sm.addState(recordingState('B', log));

    sm.setState('A');
    // The re-entrant setState was queued, not applied immediately.
    expect(sm.currentStateName).toBe('A');

    sm.update(); // drains one queued transition
    expect(sm.currentStateName).toBe('B');
  });

  it('runs onUpdate of the current state each update() tick', () => {
    const sm = new StateMachine('t');
    const log: string[] = [];
    sm.addState(recordingState('A', log));
    sm.setState('A');

    sm.update();

    expect(log).toContain('update:A');
  });
});
