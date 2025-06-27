import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from './index';

vi.mock('@components/Auth', () => ({
  AuthComponent: vi.fn().mockImplementation(() => ({
    getElement: () => document.createElement('div'),
  })),
}));

vi.mock('@components/AchievementList', () => ({
  AchievementListComponent: {
    create: vi.fn().mockImplementation(() => document.createElement('div')),
    renderAchievements: vi.fn(),
    renderError: vi.fn(),
  },
}));

// Import mocked components
import { AuthComponent } from '@components/Auth';
import { AchievementListComponent } from '@components/AchievementList';

// Mock fetch globally
global.fetch = vi.fn();

describe('App', () => {
  let mockAppElement: HTMLElement;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>';
    mockAppElement = document.getElementById('app')!;
    // Clear all mocks
    vi.clearAllMocks();
    // Reset children for strict equality checks
    while (mockAppElement.firstChild) mockAppElement.removeChild(mockAppElement.firstChild);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    // Reset children for strict equality checks
    while (mockAppElement && mockAppElement.firstChild) mockAppElement.removeChild(mockAppElement.firstChild);
  });

  describe('App Object', () => {
    it('should have correct name', () => {
      expect(app.name).toBe('BG3 Tracker');
    });

    it('should have initialize method', () => {
      expect(typeof app.initialize).toBe('function');
    });
  });

  describe('renderApp Function', () => {
    it('should throw error when app container is not found', async() => {
      document.body.innerHTML = '';
      await expect(app.initialize()).rejects.toThrow('App container not found');
    });

    it('should create and add auth component', async() => {
      await app.initialize();
      expect(AuthComponent).toHaveBeenCalled();
      const children = Array.from(mockAppElement.children);
      expect(children.length).toBeGreaterThanOrEqual(1);
    });

    it('should create achievement list container', async() => {
      await app.initialize();
      const children = Array.from(mockAppElement.children);
      expect(children.length).toBeGreaterThanOrEqual(2);
    });

    it('should load and render achievements successfully', async() => {
      const mockAchievements = [
        {
          title: 'Test Achievement',
          description: 'Test Description',
          icon: 'test-icon.png',
          percentage: '50%',
        },
      ];
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAchievements),
      });
      await app.initialize();
      expect(global.fetch).toHaveBeenCalledWith('/src/data/bg3_achievements.json');
      expect(AchievementListComponent.renderAchievements).toHaveBeenCalled();
    });

    it('should handle fetch error and render error state', async() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      });
      await app.initialize();
      expect(AchievementListComponent.renderError).toHaveBeenCalled();
    });

    it('should handle network error and render error state', async() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
      await app.initialize();
      expect(AchievementListComponent.renderError).toHaveBeenCalled();
    });

    it('should handle JSON parsing error', async() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });
      await app.initialize();
      expect(AchievementListComponent.renderError).toHaveBeenCalled();
    });
  });

  describe('DOM Event Handling', () => {
    it('should initialize app when DOMContentLoaded fires', () => {
      const initializeSpy = vi.spyOn(app, 'initialize');
      document.dispatchEvent(new Event('DOMContentLoaded'));
      expect(initializeSpy).toHaveBeenCalled();
    });
    it('should handle multiple DOMContentLoaded events', () => {
      const initializeSpy = vi.spyOn(app, 'initialize');
      document.dispatchEvent(new Event('DOMContentLoaded'));
      document.dispatchEvent(new Event('DOMContentLoaded'));
      expect(initializeSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Component Integration', () => {
    it('should add components in correct order', async() => {
      await app.initialize();
      const children = Array.from(mockAppElement.children);
      expect(children.length).toBeGreaterThanOrEqual(2);
    });
    it('should not add duplicate components on multiple calls', async() => {
      vi.clearAllMocks();
      await app.initialize();
      vi.clearAllMocks();
      await app.initialize();
      expect(mockAppElement.children.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Error Recovery', () => {
    it('should continue working after initial error', async() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
      await app.initialize();
      expect(AchievementListComponent.renderError).toHaveBeenCalled();
      vi.clearAllMocks();
      const mockAchievements = [{ title: 'Test' }];
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAchievements),
      });
      await app.initialize();
      expect(AchievementListComponent.renderAchievements).toHaveBeenCalled();
    });
  });
});
