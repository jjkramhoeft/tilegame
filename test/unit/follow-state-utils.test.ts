import { describe, expect, it } from 'vitest';
import {
  isOnWater,
  shouldResumeFollowing,
  shouldStopFollowing,
} from '../../src/game/components/state-machine/states/character/follow-state-utils';
import { BIOME } from '../../src/game/common/common';
import type { Earth } from '../../src/game/ground/earth';

// Minimal Earth stand-in: returns a fixed tile lookup so isOnWater can be
// exercised without a running scene/tilemap.
function fakeEarth(biome: number | undefined): Earth {
  return {
    getTileXYFromScreenCoordinates: () => ({ x: 0, y: 0, atBorder: false }),
    getTile: () => (biome === undefined ? undefined : { biome }),
  } as unknown as Earth;
}

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

describe('isOnWater', () => {
  it('is true on a water tile', () => {
    expect(isOnWater(fakeEarth(BIOME.WATER), 100, 100)).toBe(true);
  });

  it('is false on a non-water tile', () => {
    expect(isOnWater(fakeEarth(BIOME.GRASS), 100, 100)).toBe(false);
  });

  it('is false where there is no tile', () => {
    expect(isOnWater(fakeEarth(undefined), 100, 100)).toBe(false);
  });
});
