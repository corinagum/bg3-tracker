import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AchievementListComponent } from './AchievementList';
import { AchievementComponent } from './Achievement';
import { ErrorComponent } from './Error';

// Mock the components
vi.mock('./Achievement', () => ({
  AchievementComponent: {
    create: vi.fn().mockReturnValue(document.createElement('div')),
  },
}));

vi.mock('./Error', () => ({
  ErrorComponent: {
    create: vi.fn().mockReturnValue(document.createElement('div')),
  },
}));

describe('AchievementListComponent', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create an achievement list container', () => {
      const element = AchievementListComponent.create();
      expect(element).toBeInstanceOf(HTMLDivElement);
      expect(element.className).toBe('achievement-list');
    });
  });

  describe('renderAchievements', () => {
    it('should render achievements into the container', () => {
      const achievements = [
        { title: 'Test Achievement', description: 'Test Description', icon: 'test.png', percentage: '50%' },
      ];

      AchievementListComponent.renderAchievements(container, achievements);

      expect(AchievementComponent.create).toHaveBeenCalledWith(achievements[0]);
      expect(container.children.length).toBe(1);
    });

    it('should handle null achievements array', () => {
      AchievementListComponent.renderAchievements(container, null as any);

      expect(ErrorComponent.create).toHaveBeenCalledWith(
        'No achievements loaded',
        'Run the fetch-achievements script to load achievement data.',
      );
      expect(AchievementComponent.create).not.toHaveBeenCalled();
      expect(container.children.length).toBe(1);
    });

    it('should handle undefined achievements array', () => {
      AchievementListComponent.renderAchievements(container, undefined as any);

      expect(ErrorComponent.create).toHaveBeenCalledWith(
        'No achievements loaded',
        'Run the fetch-achievements script to load achievement data.',
      );
      expect(AchievementComponent.create).not.toHaveBeenCalled();
      expect(container.children.length).toBe(1);
    });

    it('should handle empty achievements array', () => {
      AchievementListComponent.renderAchievements(container, []);

      expect(ErrorComponent.create).toHaveBeenCalledWith(
        'No achievements loaded',
        'Run the fetch-achievements script to load achievement data.',
      );
      expect(AchievementComponent.create).not.toHaveBeenCalled();
      expect(container.children.length).toBe(1);
    });

    it('should clear container before rendering', () => {
      container.innerHTML = '<div>existing content</div>';
      const achievements = [
        { title: 'Test Achievement', description: 'Test Description', icon: 'test.png', percentage: '50%' },
      ];

      AchievementListComponent.renderAchievements(container, achievements);

      expect(container.children.length).toBe(1);
      expect(AchievementComponent.create).toHaveBeenCalledWith(achievements[0]);
    });
  });

  describe('renderError', () => {
    it('should render error state into the container', () => {
      const title = 'Error Title';
      const message = 'Error Message';

      AchievementListComponent.renderError(container, title, message);

      expect(ErrorComponent.create).toHaveBeenCalledWith(title, message);
      expect(container.children.length).toBe(1);
    });

    it('should clear container before rendering error', () => {
      container.innerHTML = '<div>existing content</div>';
      AchievementListComponent.renderError(container, 'Error', 'Message');

      expect(container.children.length).toBe(1);
      expect(ErrorComponent.create).toHaveBeenCalledWith('Error', 'Message');
    });
  });
});
