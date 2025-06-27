import './styles/main.css';

interface Achievement {
  title?: string;
  description?: string;
  icon?: string;
  iconPublic?: string;
  percentage?: string;
}

export const app = {
  name: 'BG3 Tracker',
  initialize: () => {
    renderAchievements();
  }
};

async function renderAchievements() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }

  // Create achievement list container
  const achievementList = document.createElement('div');
  achievementList.className = 'achievement-list';

  try {
    // Try to load achievement data
    const response = await fetch('/src/data/bg3_achievements.json');
    if (!response.ok) {
      throw new Error('Failed to load achievements');
    }
    
    const achievementsData = await response.json() as Achievement[];

    // Check if we have achievement data
    if (!achievementsData || achievementsData.length === 0) {
      achievementList.innerHTML = `
        <div class="error-container">
          <h2>No achievements loaded</h2>
          <p>Run the fetch-achievements script to load achievement data.</p>
          <button class="refresh-button" onclick="location.reload()">Refresh</button>
        </div>
      `;
    } else {
      // Render achievements
      achievementsData.forEach((achievement: Achievement) => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement';
        
        achievementElement.innerHTML = `
          <div class="achievement-icon"></div>
          <div class="achievement-details">
            <div class="achievement-title">${achievement.title || 'Unknown Achievement'}</div>
            <div class="achievement-description">${achievement.description || 'No description available'}</div>
          </div>
        `;
        
        // Set the background image using setAttribute to avoid inline styles
        const iconElement = achievementElement.querySelector('.achievement-icon') as HTMLElement;
        if (iconElement && (achievement.iconPublic || achievement.icon)) {
          iconElement.style.backgroundImage = `url('${achievement.iconPublic || achievement.icon}')`;
        }
        
        achievementList.appendChild(achievementElement);
      });
    }
  } catch (error) {
    console.error('Error loading achievements:', error);
    achievementList.innerHTML = `
      <div class="error-container">
        <h2>Error loading achievements</h2>
        <p>Failed to load achievement data. Please run the fetch-achievements script first.</p>
        <button class="refresh-button" onclick="location.reload()">Refresh</button>
      </div>
    `;
  }

  app.appendChild(achievementList);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  app.initialize();
});