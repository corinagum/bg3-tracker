import type { Achievement } from './types';
import checkmarkUrl from '@assets/checkmark.svg';

export class AchievementComponent {
  /**
   * Creates an achievement element
   * @param achievement - The achievement data
   * @param isCompleted - Whether the achievement is completed
   * @param onToggle - Callback function when checkbox is toggled
   * @returns The achievement element
   */
  static create(
    achievement: Achievement,
    isCompleted: boolean = false,
    onToggle?: (achievementTitle: string, completed: boolean) => void,
  ): HTMLElement {
    const achievementElement = document.createElement('div');
    achievementElement.className = `achievement${isCompleted ? ' completed' : ''}`;

    const description = `${achievement.h5Description || achievement.description || 'No description available'}`;
    const progressBarWidth = achievement.percentage ? achievement.percentage.replace('%', '') : '0';

    // Create checkbox container
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'achievement-checkbox-container';

    const checkbox = document.createElement('div');
    checkbox.className = `achievement-checkbox ${isCompleted ? 'completed' : ''}`;
    checkbox.setAttribute('data-achievement', achievement.title || '');

    const checkmark = document.createElement('img');
    checkmark.src = checkmarkUrl;
    checkmark.alt = 'Checkmark';
    checkmark.className = 'checkmark';
    checkbox.appendChild(checkmark);
    checkboxContainer.appendChild(checkbox);

    // Create achievement icon
    const iconElement = document.createElement('div');
    iconElement.className = 'achievement-icon';

    // Create achievement details
    const detailsElement = document.createElement('div');
    detailsElement.className = 'achievement-details';

    const titleElement = document.createElement('div');
    titleElement.className = 'achievement-title';
    titleElement.textContent = achievement.title || 'Unknown Achievement';

    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'achievement-description';
    descriptionElement.textContent = description;

    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';

    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress-bar-container';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = `${progressBarWidth}%`;

    const progressLabel = document.createElement('div');
    progressLabel.className = 'progress-label';
    progressLabel.textContent = achievement.percentage || '0%';

    // Assemble progress elements
    progressBarContainer.appendChild(progressBar);
    progressContainer.appendChild(progressBarContainer);
    progressContainer.appendChild(progressLabel);

    // Assemble details
    detailsElement.appendChild(titleElement);
    detailsElement.appendChild(descriptionElement);
    detailsElement.appendChild(progressContainer);

    // Assemble achievement
    achievementElement.appendChild(checkboxContainer);
    achievementElement.appendChild(iconElement);
    achievementElement.appendChild(detailsElement);

    // Set the background image
    if (iconElement) {
      const imageUrl = achievement.iconPublic || achievement.icon;
      if (imageUrl) {
        iconElement.style.backgroundImage = `url('${imageUrl}')`;

        // Add error handling for image loading
        const img = new Image();
        img.src = imageUrl;
      } else {
        console.warn(`No icon URL found for achievement: ${achievement.title}`);
      }
    }

    // Add checkbox click handler
    if (checkboxContainer && onToggle && achievement.title) {
      checkboxContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        const newCompletedState = !isCompleted;
        onToggle(achievement.title!, newCompletedState);
      });
    }

    return achievementElement;
  }

  /**
   * Updates the completion state of an achievement element
   * @param element - The achievement element to update
   * @param isCompleted - Whether the achievement is completed
   */
  static updateCompletion(element: HTMLElement, isCompleted: boolean): void {
    const checkbox = element.querySelector('.achievement-checkbox');
    if (checkbox instanceof HTMLElement) {
      if (isCompleted) {
        checkbox.classList.add('completed');
        element.classList.add('completed');
      } else {
        checkbox.classList.remove('completed');
        element.classList.remove('completed');
      }
    }
  }
}
