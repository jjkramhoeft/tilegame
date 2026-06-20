import { beforeEach, describe, expect, it } from 'vitest';
import { GameDataManager } from '../../src/game/common/game-data-manager';
import { CASTING_UNLOCKS } from '../../src/game/common/common';

// GameDataManager is a singleton; resetForNewGame() restores a clean slate.
const gdm = (): GameDataManager => GameDataManager.instance;
const place = (unlock: string, times: number): void => {
  for (let i = 0; i < times; i++) {
    gdm().increaseTilesPlaced(unlock as never);
  }
};

beforeEach(() => {
  gdm().resetForNewGame();
});

describe('GameDataManager — unlock cascade', () => {
  it('starts a new game with only ROCK_BASIC unlocked', () => {
    const unlocked = gdm().data.unlockedSpellCasting;
    expect(unlocked.has(CASTING_UNLOCKS.ROCK_BASIC)).toBe(true);
    expect(unlocked.has(CASTING_UNLOCKS.ROCK_DECORATION)).toBe(false);
  });

  it('does NOT unlock ROCK_DECORATION before the threshold (10 ROCK_BASIC tiles)', () => {
    place(CASTING_UNLOCKS.ROCK_BASIC, 9);
    expect(gdm().data.unlockedSpellCasting.has(CASTING_UNLOCKS.ROCK_DECORATION)).toBe(false);
  });

  it('unlocks ROCK_DECORATION once 10 ROCK_BASIC tiles are placed', () => {
    place(CASTING_UNLOCKS.ROCK_BASIC, 10);
    expect(gdm().data.unlockedSpellCasting.has(CASTING_UNLOCKS.ROCK_DECORATION)).toBe(true);
  });

  it('unlocks ROCK_BLOCKING and CHEST1 together after enough ROCK_DECORATION tiles', () => {
    place(CASTING_UNLOCKS.ROCK_DECORATION, 10);
    const unlocked = gdm().data.unlockedSpellCasting;
    expect(unlocked.has(CASTING_UNLOCKS.ROCK_BLOCKING)).toBe(true);
    expect(unlocked.has(CASTING_UNLOCKS.CHEST1)).toBe(true);
  });

  it('tracks tiles placed per casting unlock', () => {
    place(CASTING_UNLOCKS.ROCK_BASIC, 3);
    expect(gdm().getTilesPlaced(CASTING_UNLOCKS.ROCK_BASIC)).toBe(3);
    expect(gdm().getTilesPlaced(CASTING_UNLOCKS.DESERT_BASIC)).toBe(0);
  });

  it('ignores an undefined casting unlock', () => {
    expect(() => gdm().increaseTilesPlaced(undefined)).not.toThrow();
  });
});
