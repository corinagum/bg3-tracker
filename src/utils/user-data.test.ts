import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserDataManager, type AchievementChange } from './user-data';
import { TEST_USER_DATA } from '@data/test-user-data';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('UserDataManager', () => {
  let userDataManager: UserDataManager;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});

    // Clear the singleton instance
    (UserDataManager as any).instance = undefined;

    // Get a fresh instance
    userDataManager = UserDataManager.getInstance();
  });

  afterEach(() => {
    // Clean up
    userDataManager.clearStorage();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = UserDataManager.getInstance();
      const instance2 = UserDataManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize with test data when no localStorage data exists', () => {
      const profile = userDataManager.getUserProfile();

      expect(profile.username).toBe(TEST_USER_DATA.username);
      expect(profile.displayName).toBe(TEST_USER_DATA.displayName);
      expect(profile.avatarUrl).toBe(TEST_USER_DATA.avatarUrl);
      expect(profile.completedAchievements).toEqual(TEST_USER_DATA.completedAchievements);
      expect(profile.totalAchievements).toBe(0);
    });

    it('should load data from localStorage when available', () => {
      const savedData = {
        originalData: { ...TEST_USER_DATA, totalAchievements: 50 },
        currentData: { ...TEST_USER_DATA, totalAchievements: 50, completedAchievements: ['Test Achievement'] },
        changes: [{ achievementTitle: 'Test Achievement', action: 'completed', timestamp: Date.now() }],
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData));

      // Clear instance and get new one
      (UserDataManager as any).instance = undefined;
      const newManager = UserDataManager.getInstance();

      const profile = newManager.getUserProfile();
      expect(profile.completedAchievements).toContain('Test Achievement');
      expect(profile.totalAchievements).toBe(50);
    });

    it('should fall back to test data when localStorage data is corrupted', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      // Mock console.warn
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Clear instance and get new one
      (UserDataManager as any).instance = undefined;
      const newManager = UserDataManager.getInstance();

      const profile = newManager.getUserProfile();
      expect(profile.username).toBe(TEST_USER_DATA.username);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse saved user data, using default');

      consoleSpy.mockRestore();
    });
  });

  describe('Data Access', () => {
    it('should return a copy of current user profile', () => {
      const profile1 = userDataManager.getUserProfile();
      const profile2 = userDataManager.getUserProfile();

      expect(profile1).toEqual(profile2);
      expect(profile1).not.toBe(profile2); // Should be different objects
    });

    it('should return a copy of original data', () => {
      const original1 = userDataManager.getOriginalData();
      const original2 = userDataManager.getOriginalData();

      expect(original1).toEqual(original2);
      expect(original1).not.toBe(original2); // Should be different objects
    });

    it('should return a copy of changes array', () => {
      const changes1 = userDataManager.getChanges();
      const changes2 = userDataManager.getChanges();

      expect(changes1).toEqual(changes2);
      expect(changes1).not.toBe(changes2); // Should be different arrays
    });
  });

  describe('Achievement Management', () => {
    it('should correctly identify completed achievements', () => {
      const firstAchievement = TEST_USER_DATA.completedAchievements[0];

      expect(userDataManager.isAchievementCompleted(firstAchievement)).toBe(true);
      expect(userDataManager.isAchievementCompleted('Non-existent Achievement')).toBe(false);
    });

    it('should toggle achievement from uncompleted to completed', () => {
      const newAchievement = 'New Achievement';

      expect(userDataManager.isAchievementCompleted(newAchievement)).toBe(false);

      userDataManager.toggleAchievement(newAchievement);

      expect(userDataManager.isAchievementCompleted(newAchievement)).toBe(true);

      const changes = userDataManager.getChanges();
      expect(changes).toHaveLength(1);
      expect(changes[0].achievementTitle).toBe(newAchievement);
      expect(changes[0].action).toBe('completed');
      expect(changes[0].timestamp).toBeTypeOf('number');
    });

    it('should toggle achievement from completed to uncompleted', () => {
      const existingAchievement = TEST_USER_DATA.completedAchievements[0];

      expect(userDataManager.isAchievementCompleted(existingAchievement)).toBe(true);

      userDataManager.toggleAchievement(existingAchievement);

      expect(userDataManager.isAchievementCompleted(existingAchievement)).toBe(false);

      const changes = userDataManager.getChanges();
      expect(changes).toHaveLength(1);
      expect(changes[0].achievementTitle).toBe(existingAchievement);
      expect(changes[0].action).toBe('uncompleted');
    });

    it('should save to localStorage when toggling achievements', () => {
      userDataManager.toggleAchievement('Test Achievement');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'bg3-tracker-user-data',
        expect.any(String),
      );
    });

    it('should handle localStorage save errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => {
        userDataManager.toggleAchievement('Test Achievement');
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save user data to localStorage:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Total Achievements', () => {
    it('should set total achievements for both current and original data', () => {
      userDataManager.setTotalAchievements(100);

      const currentProfile = userDataManager.getUserProfile();
      const originalData = userDataManager.getOriginalData();

      expect(currentProfile.totalAchievements).toBe(100);
      expect(originalData.totalAchievements).toBe(100);
    });

    it('should save to localStorage when setting total achievements', () => {
      userDataManager.setTotalAchievements(50);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'bg3-tracker-user-data',
        expect.any(String),
      );
    });
  });

  describe('Data Reversion', () => {
    it('should revert current data to original state', () => {
      // Make some changes
      userDataManager.toggleAchievement('Test Achievement');
      // Don't call setTotalAchievements here

      // Verify changes were made
      expect(userDataManager.getChanges()).toHaveLength(1);

      // Revert
      userDataManager.revertToOriginal();

      // Verify reversion
      expect(userDataManager.getChanges()).toHaveLength(0);
      expect(userDataManager.getUserProfile().totalAchievements).toBe(TEST_USER_DATA.totalAchievements);
      expect(userDataManager.getUserProfile().completedAchievements).toEqual(TEST_USER_DATA.completedAchievements);
    });

    it('should save to localStorage when reverting', () => {
      userDataManager.revertToOriginal();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'bg3-tracker-user-data',
        expect.any(String),
      );
    });
  });

  describe('Change Application', () => {
    it('should apply changes in chronological order', () => {
      const changes: AchievementChange[] = [
        { achievementTitle: 'Achievement 1', action: 'completed', timestamp: 1000 },
        { achievementTitle: 'Achievement 2', action: 'completed', timestamp: 2000 },
        { achievementTitle: 'Achievement 1', action: 'uncompleted', timestamp: 3000 },
      ];

      userDataManager.applyChanges(changes);

      const profile = userDataManager.getUserProfile();
      expect(profile.completedAchievements).toContain('Achievement 2');
      expect(profile.completedAchievements).not.toContain('Achievement 1');

      const appliedChanges = userDataManager.getChanges();
      expect(appliedChanges).toHaveLength(3);
    });

    it('should handle duplicate completed achievements gracefully', () => {
      const changes: AchievementChange[] = [
        { achievementTitle: 'Achievement 1', action: 'completed', timestamp: 1000 },
        { achievementTitle: 'Achievement 1', action: 'completed', timestamp: 2000 }, // Duplicate
      ];

      userDataManager.applyChanges(changes);

      const profile = userDataManager.getUserProfile();
      const achievementCount = profile.completedAchievements.filter(a => a === 'Achievement 1').length;
      expect(achievementCount).toBe(1); // Should only appear once
    });

    it('should save to localStorage when applying changes', () => {
      const changes: AchievementChange[] = [
        { achievementTitle: 'Test Achievement', action: 'completed', timestamp: Date.now() },
      ];

      userDataManager.applyChanges(changes);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'bg3-tracker-user-data',
        expect.any(String),
      );
    });
  });

  describe('Storage Management', () => {
    it('should clear localStorage data', () => {
      userDataManager.clearStorage();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('bg3-tracker-user-data');
    });
  });
});
