import type { Achievement } from './types';

export class AchievementComponent {
  /**
   * Creates an achievement element
   * @param achievement - The achievement data
   * @returns The achievement element
   */
  static create(achievement: Achievement): HTMLElement {
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement';

    achievementElement.innerHTML = `
      <div class="achievement-icon"></div>
      <div class="achievement-details">
        <div class="achievement-title">${achievement.title || 'Unknown Achievement'}</div>
        <div class="achievement-description">${achievement.description || 'No description available'}</div>
        <div class="progress-container">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${achievement.percentage ? achievement.percentage.replace('%', '') : '0'}%;"></div>
          </div>
          <div class="progress-label">${achievement.percentage || '0%'}</div>
        </div>
      </div>
    `;

    // Set the background image
    const iconElement = achievementElement.querySelector('.achievement-icon') as HTMLElement;
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

    return achievementElement;
  }
}
