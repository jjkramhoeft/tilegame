import { describe, expect, it } from 'vitest';
import {
  shouldResumeFollowing,
  shouldStopFollowing,
} from '../../src/game/components/state-machine/states/character/follow-state-utils';

describe('shouldStopFollowing', () => {
  it('stops when inside the stop radius', () => {
    expect(shouldStopFollowing(40, 60)).toBe(true);
  });

  it('stops exactly on the boundary', () => {
    expect(shouldStopFollowing(60, 60)).toBe(true);
  });

  it('keeps following when outside the stop radius', () => {
    expect(shouldStopFollowing(61, 60)).toBe(false);
  });
});

describe('shouldResumeFollowing', () => {
  it('resumes once the dwell timer has elapsed, even if still close', () => {
    expect(shouldResumeFollowing(10, 150, true)).toBe(true);
  });

  it('resumes early when the target drifts beyond the resume radius', () => {
    expect(shouldResumeFollowing(151, 150, false)).toBe(true);
  });

  it('keeps resting while close and the dwell has not elapsed', () => {
    expect(shouldResumeFollowing(150, 150, false)).toBe(false);
  });
});
