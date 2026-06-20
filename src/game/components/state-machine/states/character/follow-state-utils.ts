import { BIOME } from '../../../../common/common';
import type { Earth } from '../../../../ground/earth';

/**
 * Pure decision helpers for the companion's follow states, split out so the
 * move <-> idle logic can be unit-tested without a running scene.
 */

/** True when the companion is close enough to the target to stop and rest. */
export function shouldStopFollowing(distance: number, stopRadius: number): boolean {
  return distance <= stopRadius;
}

/**
 * True when a resting companion should start following again: either its dwell
 * timer elapsed, or the target has moved beyond resumeRadius.
 */
export function shouldResumeFollowing(distance: number, resumeRadius: number, dwellElapsed: boolean): boolean {
  return dwellElapsed || distance > resumeRadius;
}

/**
 * True when the world position (screenX, screenY) sits on a WATER tile. Mirrors
 * the check in the player's swimming-system so the companion swims on the same
 * tiles the player does.
 */
export function isOnWater(earth: Earth, screenX: number, screenY: number): boolean {
  const tilePosition = earth.getTileXYFromScreenCoordinates(screenX, screenY, true);
  const tile = earth.getTile(tilePosition.x, tilePosition.y);
  return tile !== undefined && tile.biome === BIOME.WATER;
}
