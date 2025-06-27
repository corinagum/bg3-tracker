import './styles/main.css';
import './styles/auth.css';
import { AchievementListComponent } from '@components/AchievementList';
import { AuthComponent } from '@components/Auth';

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

  // Create achievement list container
  const achievementList = AchievementListComponent.create();

  try {
    // Try to load achievement data
    const response = await fetch('/src/data/bg3_achievements.json');
    if (!response.ok) {
      throw new Error('Failed to load achievements');
    }

    const achievementsData = await response.json();

    // Render achievements using the component
    AchievementListComponent.renderAchievements(achievementList, achievementsData);
  } catch {
    // console.error('Error loading achievements:', error);
    AchievementListComponent.renderError(
      achievementList,
      'Error loading achievements',
      'Failed to load achievement data. Please run the fetch-achievements script first.',
    );
  }

  app.appendChild(achievementList);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  app.initialize();
});
