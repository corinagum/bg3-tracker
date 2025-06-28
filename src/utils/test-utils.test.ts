import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestUtils } from './test-utils';
import { UserDataManager } from './user-data';

// Mock UserDataManager
vi.mock('./user-data', () => ({
  UserDataManager: {
    getInstance: vi.fn(),
  },
}));

describe('TestUtils', () => {
  let mockUserDataManager: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock UserDataManager instance
    mockUserDataManager = {
      revertToOriginal: vi.fn(),
      getChanges: vi.fn().mockReturnValue([]),
      clearStorage: vi.fn(),
      getUserProfile: vi.fn().mockReturnValue({}),
    };

    (UserDataManager.getInstance as any).mockReturnValue(mockUserDataManager);

    // Mock console.log
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('revertToOriginal', () => {
    it('should call UserDataManager.revertToOriginal', () => {
      TestUtils.revertToOriginal();

      expect(mockUserDataManager.revertToOriginal).toHaveBeenCalledOnce();
      expect(console.log).toHaveBeenCalledWith('User data reverted to original state');
    });
  });

  describe('getChanges', () => {
    it('should call UserDataManager.getChanges and log the result', () => {
      const mockChanges = [
        { achievementTitle: 'Test Achievement', action: 'completed', timestamp: Date.now() },
      ];
      mockUserDataManager.getChanges.mockReturnValue(mockChanges);

      TestUtils.getChanges();

      expect(mockUserDataManager.getChanges).toHaveBeenCalledOnce();
      expect(console.log).toHaveBeenCalledWith('Current changes:', mockChanges);
    });
  });

  describe('clearData', () => {
    it('should call UserDataManager.clearStorage', () => {
      TestUtils.clearData();

      expect(mockUserDataManager.clearStorage).toHaveBeenCalledOnce();
      expect(console.log).toHaveBeenCalledWith('User data cleared');
    });
  });

  describe('getCurrentProfile', () => {
    it('should call UserDataManager.getUserProfile and log the result', () => {
      const mockProfile = {
        username: 'test-user',
        displayName: 'Test User',
        completedAchievements: [],
        totalAchievements: 0,
      };
      mockUserDataManager.getUserProfile.mockReturnValue(mockProfile);

      TestUtils.getCurrentProfile();

      expect(mockUserDataManager.getUserProfile).toHaveBeenCalledOnce();
      expect(console.log).toHaveBeenCalledWith('Current profile:', mockProfile);
    });
  });

  describe('exposeToGlobal', () => {
    it('should expose test utilities to window.testUtils', () => {
      // Mock window object
      const mockWindow = {} as any;
      global.window = mockWindow;

      TestUtils.exposeToGlobal();

      expect(mockWindow.testUtils).toBeDefined();
      expect(typeof mockWindow.testUtils.revertToOriginal).toBe('function');
      expect(typeof mockWindow.testUtils.getChanges).toBe('function');
      expect(typeof mockWindow.testUtils.clearData).toBe('function');
      expect(typeof mockWindow.testUtils.getCurrentProfile).toBe('function');
      expect(console.log).toHaveBeenCalledWith('Test utilities available at window.testUtils');
    });

    it('should provide working function references', () => {
      const mockWindow = {} as any;
      global.window = mockWindow;

      TestUtils.exposeToGlobal();

      // Test that the exposed functions actually work
      expect(() => mockWindow.testUtils.revertToOriginal()).not.toThrow();
      expect(mockUserDataManager.revertToOriginal).toHaveBeenCalled();
    });
  });
});
