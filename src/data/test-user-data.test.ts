import { describe, it, expect } from 'vitest';
import { TEST_USER_DATA } from './test-user-data';

describe('TEST_USER_DATA', () => {
  it('should have correct user information', () => {
    expect(TEST_USER_DATA.username).toBe('ys-ys');
    expect(TEST_USER_DATA.displayName).toBe('Yuri');
    expect(TEST_USER_DATA.avatarUrl).toBe('/assets/ys.jpg');
  });

  it('should have 35 completed achievements', () => {
    expect(TEST_USER_DATA.completedAchievements).toHaveLength(35);
  });

  it('should have totalAchievements set to 0 initially', () => {
    expect(TEST_USER_DATA.totalAchievements).toBe(0);
  });

  it('should contain specific known achievements', () => {
    const expectedAchievements = [
      'Leave No One Behind',
      'Descent From Avernus',
      'The Plot Thickens',
      'Action Surge',
      'Bookworm',
      'A Grym Fate',
    ];

    expectedAchievements.forEach(achievement => {
      expect(TEST_USER_DATA.completedAchievements).toContain(achievement);
    });
  });

  it('should not contain duplicate achievements', () => {
    const uniqueAchievements = new Set(TEST_USER_DATA.completedAchievements);
    expect(uniqueAchievements.size).toBe(TEST_USER_DATA.completedAchievements.length);
  });

  it('should have all achievement titles as non-empty strings', () => {
    TEST_USER_DATA.completedAchievements.forEach(achievement => {
      expect(typeof achievement).toBe('string');
      expect(achievement.length).toBeGreaterThan(0);
    });
  });
});
