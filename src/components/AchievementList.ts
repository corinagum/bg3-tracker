import type { Achievement } from './types';
import { AchievementComponent } from './Achievement';
import { ErrorComponent } from './Error';

export class AchievementListComponent {
  /**
   * Creates an achievement list container
   * @returns The achievement list element
   */
  static create(): HTMLElement {
    const achievementList = document.createElement('div');
    achievementList.className = 'achievement-list';
    return achievementList;
  }

  /**
   * Renders achievements into the list
   * @param container - The container to render into
   * @param achievements - Array of achievement data
   */
  static renderAchievements(container: HTMLElement, achievements: Achievement[]): void {
    container.innerHTML = '';

    if (!achievements || achievements.length === 0) {
      const errorElement = ErrorComponent.create(
        'No achievements loaded',
        'Run the fetch-achievements script to load achievement data.',
      );
      container.appendChild(errorElement);
      return;
    }

    achievements.forEach((achievement: Achievement) => {
      const achievementElement = AchievementComponent.create(achievement);
      container.appendChild(achievementElement);
    });
  }

  /**
   * Renders an error state into the list
   * @param container - The container to render into
   * @param title - The error title
   * @param message - The error message
   */
  static renderError(container: HTMLElement, title: string, message: string): void {
    container.innerHTML = '';
    const errorElement = ErrorComponent.create(title, message);
    container.appendChild(errorElement);
  }
}
