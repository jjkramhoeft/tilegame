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
