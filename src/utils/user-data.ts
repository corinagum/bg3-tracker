import { TEST_USER_DATA } from '@data/test-user-data';

export interface UserProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  completedAchievements: string[]; // Array of achievement titles
  totalAchievements: number;
}

export interface UserDataState {
  originalData: UserProfile;
  currentData: UserProfile;
  changes: AchievementChange[];
}

export interface AchievementChange {
  achievementTitle: string;
  action: 'completed' | 'uncompleted';
  timestamp: number;
}

/**
 * User data management system for handling test data and changes
 */
export class UserDataManager {
  private static instance: UserDataManager;
  private data: UserDataState;
  private readonly STORAGE_KEY = 'bg3-tracker-user-data';

  private constructor() {
    this.data = this.initializeData();
  }

  static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  private initializeData(): UserDataState {
    // Try to load from localStorage first
    const savedData = localStorage.getItem(this.STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch {
        console.warn('Failed to parse saved user data, using default');
      }
    }

    // Use imported test data
    const originalData: UserProfile = { ...TEST_USER_DATA };

    return {
      originalData: { ...originalData },
      currentData: { ...originalData },
      changes: [],
    };
  }

  getUserProfile(): UserProfile {
    return { ...this.data.currentData };
  }

  getOriginalData(): UserProfile {
    return { ...this.data.originalData };
  }

  getChanges(): AchievementChange[] {
    return [...this.data.changes];
  }

  isAchievementCompleted(achievementTitle: string): boolean {
    return this.data.currentData.completedAchievements.includes(achievementTitle);
  }

  toggleAchievement(achievementTitle: string): void {
    const isCurrentlyCompleted = this.isAchievementCompleted(achievementTitle);

    if (isCurrentlyCompleted) {
      // Remove from completed list
      this.data.currentData.completedAchievements = this.data.currentData.completedAchievements
        .filter(title => title !== achievementTitle);

      this.data.changes.push({
        achievementTitle,
        action: 'uncompleted',
        timestamp: Date.now(),
      });
    } else {
      // Add to completed list
      this.data.currentData.completedAchievements.push(achievementTitle);

      this.data.changes.push({
        achievementTitle,
        action: 'completed',
        timestamp: Date.now(),
      });
    }

    this.saveToStorage();
  }

  setTotalAchievements(total: number): void {
    this.data.currentData.totalAchievements = total;
    this.data.originalData.totalAchievements = total;
    this.saveToStorage();
  }

  revertToOriginal(): void {
    this.data.currentData = { ...this.data.originalData };
    this.data.changes = [];
    this.saveToStorage();
  }

  applyChanges(changes: AchievementChange[]): void {
    // Reset to original state
    this.data.currentData = { ...this.data.originalData };
    this.data.changes = [];

    // Apply each change in chronological order
    changes.forEach(change => {
      if (change.action === 'completed') {
        if (!this.data.currentData.completedAchievements.includes(change.achievementTitle)) {
          this.data.currentData.completedAchievements.push(change.achievementTitle);
        }
      } else {
        this.data.currentData.completedAchievements = this.data.currentData.completedAchievements
          .filter(title => title !== change.achievementTitle);
      }
      this.data.changes.push(change);
    });

    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.warn('Failed to save user data to localStorage:', error);
    }
  }

  clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
