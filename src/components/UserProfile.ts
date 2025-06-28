import type { UserProfile as UserProfileType } from '@utils/user-data';

export class UserProfileComponent {
  /**
   * Creates a user profile element
   * @param userProfile - The user profile data
   * @returns The user profile element
   */
  static create(userProfile: UserProfileType): HTMLElement {
    const profileElement = document.createElement('div');
    profileElement.className = 'user-profile';

    const completedCount = userProfile.completedAchievements.length;
    const totalCount = userProfile.totalAchievements;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Create profile header
    const profileHeader = document.createElement('div');
    profileHeader.className = 'profile-header';

    const profileAvatar = document.createElement('div');
    profileAvatar.className = 'profile-avatar';

    const avatarImg = document.createElement('img');
    avatarImg.src = userProfile.avatarUrl || '/assets/steam-logo.svg';
    avatarImg.alt = userProfile.displayName;
    profileAvatar.appendChild(avatarImg);

    const profileInfo = document.createElement('div');
    profileInfo.className = 'profile-info';

    const profileName = document.createElement('h2');
    profileName.className = 'profile-name';
    profileName.textContent = userProfile.displayName;

    const profileUsername = document.createElement('p');
    profileUsername.className = 'profile-username';
    profileUsername.textContent = `@${userProfile.username}`;

    profileInfo.appendChild(profileName);
    profileInfo.appendChild(profileUsername);
    profileHeader.appendChild(profileAvatar);
    profileHeader.appendChild(profileInfo);

    // Create profile stats
    const profileStats = document.createElement('div');
    profileStats.className = 'profile-stats';

    const createStatItem = (number: string, label: string): HTMLElement => {
      const statItem = document.createElement('div');
      statItem.className = 'stat-item';

      const statNumber = document.createElement('span');
      statNumber.className = 'stat-number';
      statNumber.textContent = number;

      const statLabel = document.createElement('span');
      statLabel.className = 'stat-label';
      statLabel.textContent = label;

      statItem.appendChild(statNumber);
      statItem.appendChild(statLabel);
      return statItem;
    };

    profileStats.appendChild(createStatItem(completedCount.toString(), 'Completed'));
    profileStats.appendChild(createStatItem(totalCount.toString(), 'Total'));
    profileStats.appendChild(createStatItem(`${completionPercentage}%`, 'Progress'));

    // Create progress overview
    const progressOverview = document.createElement('div');
    progressOverview.className = 'progress-overview';

    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress-bar-container';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = `${completionPercentage}%`;

    progressBarContainer.appendChild(progressBar);
    progressOverview.appendChild(progressBarContainer);

    // Assemble the profile
    profileElement.appendChild(profileHeader);
    profileElement.appendChild(profileStats);
    profileElement.appendChild(progressOverview);

    return profileElement;
  }

  /**
   * Updates the user profile with new data
   * @param element - The profile element to update
   * @param userProfile - The updated user profile data
   */
  static update(element: HTMLElement, userProfile: UserProfileType): void {
    const completedCount = userProfile.completedAchievements.length;
    const totalCount = userProfile.totalAchievements;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Update stats
    const statNumbers = element.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
      statNumbers[0].textContent = completedCount.toString();
      statNumbers[1].textContent = totalCount.toString();
      statNumbers[2].textContent = `${completionPercentage}%`;
    }

    // Update progress bar
    const progressBar = element.querySelector('.progress-bar');
    if (progressBar instanceof HTMLElement) {
      progressBar.style.width = `${completionPercentage}%`;
    }
  }
}
