import { describe, it, expect, vi } from 'vitest';
import { AchievementListComponent } from './AchievementList';
import { Achievement } from './types';

describe('AchievementListComponent', () => {
  it('creates an achievement list container', () => {
    const container = AchievementListComponent.create();

    expect(container).toBeDefined();
    expect(container.className).toBe('achievement-list');
  });

  it('renders achievements in the container', () => {
    const container = document.createElement('div');
    container.className = 'achievement-list';

    const achievementsData: Achievement[] = [
      {
        title: 'Achievement 1',
        description: 'Description 1',
        percentage: '25%'
      },
      {
        title: 'Achievement 2',
        description: 'Description 2',
        percentage: '50%'
      }
    ];

    AchievementListComponent.renderAchievements(container, achievementsData);

    const achievementElements = container.querySelectorAll('.achievement');
    expect(achievementElements.length).toBe(2);

    expect(achievementElements[0].querySelector('.achievement-title')?.textContent).toBe('Achievement 1');
    expect(achievementElements[1].querySelector('.achievement-title')?.textContent).toBe('Achievement 2');
  });

  it('renders an error in the container', () => {
    const container = document.createElement('div');
    container.className = 'achievement-list';

    AchievementListComponent.renderError(container, 'Error Title', 'Error Message');

    const errorContainer = container.querySelector('.error-container');
    expect(errorContainer).toBeDefined();
    expect(container.querySelector('h2')?.textContent).toBe('Error Title');
    expect(container.querySelector('p')?.textContent).toBe('Error Message');
    expect(container.querySelector('.refresh-button')).toBeDefined();
  });

  it('handles refresh button click', () => {
    // Create a mock function for reload
    const mockReload = vi.fn();
    
    // Mock window.location.reload using Object.defineProperty
    Object.defineProperty(window, 'location', {
      value: {
        reload: mockReload
      },
      writable: true
    });
    
    const container = document.createElement('div');
    container.className = 'achievement-list';

    AchievementListComponent.renderError(container, 'Error Title', 'Error Message');

    const refreshButton = container.querySelector('.refresh-button') as HTMLButtonElement;
    expect(refreshButton).toBeDefined();

    // Simulate click
    refreshButton.click();

    // Check if reload was called
    expect(mockReload).toHaveBeenCalledTimes(1);
  });
});
