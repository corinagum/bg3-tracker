import type { Achievement } from './types';
import { AchievementComponent } from './Achievement';
import { ErrorComponent } from './Error';
import { UserDataManager } from '@utils/user-data';
import { UserProfileComponent } from './UserProfile';

export class AchievementListComponent {
  private userDataManager: UserDataManager;
  private profileElement?: HTMLElement;

  constructor() {
    this.userDataManager = UserDataManager.getInstance();
  }

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
   * Renders achievements into the list with user data integration
   * @param container - The container to render into
   * @param achievements - Array of achievement data
   * @param profileElement - Optional profile element to update
   * @param onAchievementToggle - Optional callback when achievements are toggled
   */
  static renderAchievements(
    container: HTMLElement,
    achievements: Achievement[],
    profileElement?: HTMLElement,
    onAchievementToggle?: () => void,
  ): void {
    const userDataManager = UserDataManager.getInstance();

    container.innerHTML = '';

    if (!achievements || achievements.length === 0) {
      const errorElement = ErrorComponent.create(
        'No achievements loaded',
        'Run the fetch-achievements script to load achievement data.',
      );
      container.appendChild(errorElement);
      return;
    }

    // Set total achievements count
    userDataManager.setTotalAchievements(achievements.length);

    // Update profile if provided
    if (profileElement) {
      const userProfile = userDataManager.getUserProfile();
      UserProfileComponent.update(profileElement, userProfile);
    }

    // Separate completed and uncompleted achievements
    const completedAchievements: Achievement[] = [];
    const uncompletedAchievements: Achievement[] = [];

    achievements.forEach((achievement: Achievement) => {
      if (achievement.title) {
        const isCompleted = userDataManager.isAchievementCompleted(achievement.title);
        if (isCompleted) {
          completedAchievements.push(achievement);
        } else {
          uncompletedAchievements.push(achievement);
        }
      }
    });

    // Render uncompleted achievements first
    uncompletedAchievements.forEach((achievement: Achievement) => {
      if (achievement.title) {
        const isCompleted = userDataManager.isAchievementCompleted(achievement.title);

        const achievementElement = AchievementComponent.create(
          achievement,
          isCompleted,
          (achievementTitle: string, completed: boolean) => {
            // Handle achievement toggle
            userDataManager.toggleAchievement(achievementTitle);

            // Update the visual state
            AchievementComponent.updateCompletion(achievementElement, completed);

            // Update profile if provided
            if (profileElement) {
              const userProfile = userDataManager.getUserProfile();
              UserProfileComponent.update(profileElement, userProfile);
            }

            // Call the toggle callback if provided
            if (onAchievementToggle) {
              onAchievementToggle();
            }

            // Re-render the list to maintain order
            this.renderAchievements(container, achievements, profileElement, onAchievementToggle);
          },
        );

        container.appendChild(achievementElement);
      }
    });

    // Render completed achievements at the bottom
    completedAchievements.forEach((achievement: Achievement) => {
      if (achievement.title) {
        const isCompleted = userDataManager.isAchievementCompleted(achievement.title);

        const achievementElement = AchievementComponent.create(
          achievement,
          isCompleted,
          (achievementTitle: string, completed: boolean) => {
            // Handle achievement toggle
            userDataManager.toggleAchievement(achievementTitle);

            // Update the visual state
            AchievementComponent.updateCompletion(achievementElement, completed);

            // Update profile if provided
            if (profileElement) {
              const userProfile = userDataManager.getUserProfile();
              UserProfileComponent.update(profileElement, userProfile);
            }

            // Call the toggle callback if provided
            if (onAchievementToggle) {
              onAchievementToggle();
            }

            // Re-render the list to maintain order
            this.renderAchievements(container, achievements, profileElement, onAchievementToggle);
          },
        );

        container.appendChild(achievementElement);
      }
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
