import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthManager, authManager, type SteamUser } from './auth';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('AuthManager', () => {
  let authManagerInstance: AuthManager;

  beforeEach(() => {
    // Reset the singleton instance before each test
    (AuthManager as any).instance = undefined;
    authManagerInstance = AuthManager.getInstance();

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = AuthManager.getInstance();
      const instance2 = AuthManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('State Management', () => {
    it('should have initial state', () => {
      // Mock fetch to not trigger checkAuthStatus
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      });

      // Reset the singleton instance to get a fresh one
      (AuthManager as any).instance = undefined;
      const freshInstance = AuthManager.getInstance();

      const state = freshInstance.getState();
      expect(state).toEqual({
        isAuthenticated: false,
        user: null,
        loading: true,
        error: null,
      });
    });

    it('should return a copy of the state', () => {
      const state1 = authManagerInstance.getState();
      const state2 = authManagerInstance.getState();
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Should be different objects
    });
  });

  describe('Subscription System', () => {
    it('should notify listeners when state changes', () => {
      const listener = vi.fn();
      const unsubscribe = authManagerInstance.subscribe(listener);

      // Trigger a state change by calling checkAuthStatus
      authManagerInstance['checkAuthStatus']();

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('should allow unsubscribing from notifications', () => {
      const listener = vi.fn();
      const unsubscribe = authManagerInstance.subscribe(listener);
      unsubscribe();

      // Trigger a state change
      authManagerInstance['checkAuthStatus']();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = authManagerInstance.subscribe(listener1);
      const unsubscribe2 = authManagerInstance.subscribe(listener2);

      // Trigger a state change
      authManagerInstance['checkAuthStatus']();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('checkAuthStatus', () => {
    it('should set loading state and check authentication', async() => {
      const mockUser: SteamUser = {
        id: '123',
        displayName: 'TestUser',
        profileUrl: 'https://steamcommunity.com/profiles/123',
        avatar: 'https://example.com/avatar.jpg',
        steamId: '76561198012345678',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      await authManagerInstance['checkAuthStatus']();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/status');
    });

    it('should handle successful authentication', async() => {
      const mockUser: SteamUser = {
        id: '123',
        displayName: 'TestUser',
        profileUrl: 'https://steamcommunity.com/profiles/123',
        avatar: 'https://example.com/avatar.jpg',
        steamId: '76561198012345678',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      await authManagerInstance['checkAuthStatus']();

      const state = authManagerInstance.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBe(null);
      expect(state.loading).toBe(false);
    });

    it('should handle failed authentication', async() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      });

      await authManagerInstance['checkAuthStatus']();

      const state = authManagerInstance.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.loading).toBe(false);
    });

    it('should handle network errors', async() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      await authManagerInstance['checkAuthStatus']();

      const state = authManagerInstance.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.error).toBe('Failed to check authentication status');
      expect(state.loading).toBe(false);
    });
  });

  describe('login', () => {
    it('should redirect to Steam login', async() => {
      await authManagerInstance.login();

      expect(window.location.href).toBe('/api/auth/steam');
    });

    it('should handle login errors', async() => {
      // Mock window.location.href to throw an error
      Object.defineProperty(window, 'location', {
        value: {
          get href() {
            return '';
          },
          set href(value: string) {
            throw new Error('Navigation blocked');
          },
        },
        writable: true,
      });

      await authManagerInstance.login();

      const state = authManagerInstance.getState();
      expect(state.error).toBe('Failed to initiate login');
      expect(state.loading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should handle successful logout', async() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
      });

      await authManagerInstance.logout();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });

      const state = authManagerInstance.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.error).toBe(null);
      expect(state.loading).toBe(false);
    });

    it('should handle failed logout response', async() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      });

      await authManagerInstance.logout();

      const state = authManagerInstance.getState();
      expect(state.error).toBe('Failed to logout');
      expect(state.loading).toBe(false);
    });

    it('should handle logout network errors', async() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      await authManagerInstance.logout();

      const state = authManagerInstance.getState();
      expect(state.error).toBe('Failed to logout');
      expect(state.loading).toBe(false);
    });
  });

  describe('refreshUser', () => {
    it('should call checkAuthStatus', async() => {
      const checkAuthStatusSpy = vi.spyOn(authManagerInstance as any, 'checkAuthStatus');

      await authManagerInstance.refreshUser();

      expect(checkAuthStatusSpy).toHaveBeenCalled();
    });
  });
});

describe('authManager export', () => {
  it('should export the singleton instance', () => {
    expect(authManager).toBeInstanceOf(AuthManager);
    expect(authManager).toStrictEqual(AuthManager.getInstance());
  });
});
