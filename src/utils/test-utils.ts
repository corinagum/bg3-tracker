import { UserDataManager } from './user-data';

/**
 * Test utilities for managing user data during development
 *
 * These utilities are exposed to the global scope (window.testUtils) in development mode
 * to allow easy testing and debugging of the user data system from the browser console.
 *
 * @example
 * // In browser console during development:
 * window.testUtils.revertToOriginal()  // Reset to original test data
 * window.testUtils.getChanges()        // View current changes
 * window.testUtils.clearData()         // Clear all stored data
 * window.testUtils.getCurrentProfile() // View current user profile
 *
 * @see {@link UserDataManager} for the underlying data management system
 */
export class TestUtils {
  /**
   * Reverts user data to the original hardcoded state
   *
   * This is useful for testing scenarios where you want to reset all changes
   * and return to the initial test data state.
   *
   * @example
   * // Reset all changes and return to original placeholder data
   * window.testUtils.revertToOriginal()
   */
  static revertToOriginal(): void {
    const userDataManager = UserDataManager.getInstance();
    userDataManager.revertToOriginal();
    console.log('User data reverted to original state');
  }

  /**
   * Gets the current changes made to user data
   *
   * Returns an array of all changes (completed/uncompleted achievements)
   * that have been made since the original data was loaded.
   *
   * @example
   * // View all changes made during the session
   * window.testUtils.getChanges()
   */
  static getChanges(): void {
    const userDataManager = UserDataManager.getInstance();
    const changes = userDataManager.getChanges();
    console.log('Current changes:', changes);
  }

  /**
   * Clears all stored user data from localStorage
   *
   * This removes all saved data and will cause the app to reload
   * the original test data on the next page refresh.
   *
   * @example
   * // Clear all stored data and reset on next page load
   * window.testUtils.clearData()
   */
  static clearData(): void {
    const userDataManager = UserDataManager.getInstance();
    userDataManager.clearStorage();
    console.log('User data cleared');
  }

  /**
   * Gets current user profile data
   *
   * Displays the current user profile including username, display name,
   * avatar URL, and achievement completion status.
   *
   * @example
   * // View current user profile information
   * window.testUtils.getCurrentProfile()
   */
  static getCurrentProfile(): void {
    const userDataManager = UserDataManager.getInstance();
    const profile = userDataManager.getUserProfile();
    console.log('Current profile:', profile);
  }

  /**
   * Exposes test utilities to global scope for console access
   *
   * This method is called automatically in development mode to make
   * the test utilities available at `window.testUtils` for easy
   * debugging and testing from the browser console.
   *
   * @example
   * // Available in browser console during development:
   * window.testUtils.revertToOriginal()
   * window.testUtils.getChanges()
   * window.testUtils.clearData()
   * window.testUtils.getCurrentProfile()
   */
  static exposeToGlobal(): void {
    (window as unknown as { testUtils: Record<string, () => void> }).testUtils = {
      revertToOriginal: this.revertToOriginal,
      getChanges: this.getChanges,
      clearData: this.clearData,
      getCurrentProfile: this.getCurrentProfile,
    };
    console.log('Test utilities available at window.testUtils');
  }
}
