export const GAME_STATES = {
  START: 'startState',
  FIRST_TILE: 'firstTileState',
  ASSIGNMENT: 'assignmentState',
  BABY_STEPS: 'babyStepsState',
  GARDEN: 'gardenState',
  REGULAR: 'regularState',
  FIRST_TREE: 'firstTreeState',
  FIRST_ANIMAL: 'firstAnimalState',
  EVE: 'eveState',
  BOSS_FIGHT: 'bossFightState',
  GAME_OVER: 'gameOverState',
  VICTORY: 'victoryState',
} as const;

export type GameStateName = typeof GAME_STATES[keyof typeof GAME_STATES];
