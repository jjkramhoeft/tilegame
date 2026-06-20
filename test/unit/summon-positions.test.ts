import { describe, expect, it } from 'vitest';
import { computeSummonPositions } from '../../src/game/game-objects/enemies/summon-positions';

describe('computeSummonPositions', () => {
  it('returns one position per requested count', () => {
    expect(computeSummonPositions({ x: 0, y: 0 }, 3, 28)).toHaveLength(3);
    expect(computeSummonPositions({ x: 0, y: 0 }, 5, 28)).toHaveLength(5);
  });

  it('places the first point at angle 0 (radius to the right of center)', () => {
    const [first] = computeSummonPositions({ x: 100, y: 200 }, 3, 28);
    expect(first.x).toBeCloseTo(128);
    expect(first.y).toBeCloseTo(200);
  });

  it('keeps every point on the circle of the given radius', () => {
    const center = { x: 100, y: 200 };
    const radius = 28;
    for (const p of computeSummonPositions(center, 3, radius)) {
      const distance = Math.hypot(p.x - center.x, p.y - center.y);
      expect(distance).toBeCloseTo(radius);
    }
  });

  it('spaces points evenly (120 degrees apart for 3)', () => {
    const center = { x: 0, y: 0 };
    const points = computeSummonPositions(center, 3, 10);
    const angles = points.map((p) => Math.atan2(p.y - center.y, p.x - center.x));
    expect(angles[1] - angles[0]).toBeCloseTo((Math.PI * 2) / 3);
  });

  it('returns no positions when count is zero', () => {
    expect(computeSummonPositions({ x: 0, y: 0 }, 0, 28)).toEqual([]);
  });
});
