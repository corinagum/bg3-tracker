import '@styles/main.css';
import '@styles/auth.css';
import '@styles/achievements.css';
import '@styles/achievement-list.css';
import '@styles/floating-buttons.css';
import { AchievementListComponent } from '@components/AchievementList';
import { AuthComponent } from '@components/Auth';
import { UserProfileComponent } from '@/components/UserProfile';
import { FloatingButtonsComponent } from '@components/FloatingButtons';
import { UserDataManager } from '@utils/user-data';
import { TestUtils } from '@utils/test-utils';

export const app = {
  name: 'BG3 Tracker',
  initialize: async() => {
    return renderApp();
  },
};

async function renderApp() {
  const app = document.getElementById('app');
  if (!app) {
    throw new Error('App container not found');
  }

  // Create and add authentication component
  const authComponent = new AuthComponent();
  app.appendChild(authComponent.getElement());

  // Get user data manager
  const userDataManager = UserDataManager.getInstance();
  const userProfile = userDataManager.getUserProfile();

  // Create and add user profile component
  const profileElement = UserProfileComponent.create(userProfile);
  app.appendChild(profileElement);

  // Create achievement list container
  const achievementList = AchievementListComponent.create();

  // Create floating buttons component
  const floatingButtons = new FloatingButtonsComponent();

  try {
    // Try to load achievement data
    const response = await fetch('/src/data/bg3_achievements.json');
    if (!response.ok) {
      throw new Error('Failed to load achievements');
    }

    const achievementsData = await response.json();

    // Render achievements using the component with profile integration
    AchievementListComponent.renderAchievements(
      achievementList,
      achievementsData,
      profileElement,
      () => floatingButtons.updateVisibility(),
    );
  } catch {
    // console.error('Error loading achievements:', error);
    AchievementListComponent.renderError(
      achievementList,
      'Error loading achievements',
      'Failed to load achievement data. Please run the fetch-achievements script first.',
    );
  }

  app.appendChild(achievementList);
  app.appendChild(floatingButtons.getElement());

  // Expose test utilities in development
  if (process.env.NODE_ENV === 'development') {
    TestUtils.exposeToGlobal();
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  app.initialize();
});
