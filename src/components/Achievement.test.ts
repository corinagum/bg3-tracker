import { describe, it, expect } from 'vitest';
import { AchievementComponent } from './Achievement';
import { Achievement } from './types';

describe('AchievementComponent', () => {
  it('creates an achievement element with all properties', () => {
    const achievement: Achievement = {
      title: 'Test Achievement',
      description: 'Test Description',
      icon: 'test-icon.png',
      percentage: '75%',
    };

    const element = AchievementComponent.create(achievement);

    expect(element).toBeDefined();
    expect(element.className).toBe('achievement');
    expect(element.querySelector('.achievement-title')?.textContent).toBe('Test Achievement');
    expect(element.querySelector('.achievement-description')?.textContent).toBe('Test Description');

    const progressBar = element.querySelector('.progress-bar') as HTMLElement;
    expect(progressBar).toBeDefined();
    expect(progressBar.style.width).toBe('75%');

    expect(element.querySelector('.progress-label')?.textContent).toBe('75%');

    const iconElement = element.querySelector('.achievement-icon') as HTMLElement;
    expect(iconElement).toBeDefined();
    expect(iconElement.style.backgroundImage).toBe('url("test-icon.png")');
  });

  it('handles missing values with defaults', () => {
    const achievement: Achievement = {};

    const element = AchievementComponent.create(achievement);

    expect(element).toBeDefined();
    expect(element.querySelector('.achievement-title')?.textContent).toBe('Unknown Achievement');
    expect(element.querySelector('.achievement-description')?.textContent).toBe('No description available');

    const progressBar = element.querySelector('.progress-bar') as HTMLElement;
    expect(progressBar.style.width).toBe('0%');

    expect(element.querySelector('.progress-label')?.textContent).toBe('0%');

    const iconElement = element.querySelector('.achievement-icon') as HTMLElement;
    expect(iconElement).toBeDefined();
    expect(iconElement.style.backgroundImage).toBe('');
  });

  it('prefers iconPublic over icon when both are provided', () => {
    const achievement: Achievement = {
      title: 'Test Achievement',
      icon: 'regular-icon.png',
      iconPublic: 'public-icon.png',
    };

    const element = AchievementComponent.create(achievement);

    const iconElement = element.querySelector('.achievement-icon') as HTMLElement;
    expect(iconElement.style.backgroundImage).toBe('url("public-icon.png")');
  });
});
