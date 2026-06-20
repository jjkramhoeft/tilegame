import { Position } from '../../common/types';

/**
 * Positions summoned creatures evenly around `center`, on a circle of `radius`
 * (first point at angle 0, the rest spaced 360/count degrees apart). Pure helper
 * so the spacing math can be unit-tested without a running scene.
 */
export function computeSummonPositions(center: Position, count: number, radius: number): Position[] {
  const positions: Position[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    positions.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  return positions;
}
