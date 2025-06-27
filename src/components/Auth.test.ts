import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthComponent } from './Auth';
import { authManager } from '@utils/auth';

// Mock the auth manager
vi.mock('@utils/auth', () => ({
  authManager: {
    subscribe: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  },
}));

describe('AuthComponent', () => {
  let authComponent: AuthComponent;
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();
    (authManager.subscribe as ReturnType<typeof vi.fn>).mockReturnValue(mockUnsubscribe);
    authComponent = new AuthComponent();
  });

  afterEach(() => {
    authComponent.destroy();
  });

  describe('Constructor', () => {
    it('should create an element with auth-container class', () => {
      const element = authComponent.getElement();
      expect(element.className).toBe('auth-container');
    });

    it('should subscribe to auth manager', () => {
      expect(authManager.subscribe).toHaveBeenCalled();
    });
  });

  describe('Rendering States', () => {
    it('should render loading state', () => {
      const mockState = {
        loading: true,
        isAuthenticated: false,
        user: null,
        error: null,
      };

      // Simulate state change
      const subscribeCallback = (authManager.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0];
      subscribeCallback(mockState);

      const element = authComponent.getElement();
      expect(element.innerHTML).toContain('auth-loading');
      expect(element.innerHTML).toContain('Loading...');
    });

    it('should render error state', () => {
      const mockState = {
        loading: false,
        isAuthenticated: false,
        user: null,
        error: 'Authentication failed',
      };

      const subscribeCallback = (authManager.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0];
      subscribeCallback(mockState);

      const element = authComponent.getElement();
      expect(element.innerHTML).toContain('auth-error');
      expect(element.innerHTML).toContain('Authentication failed');
      expect(element.innerHTML).toContain('Retry');
    });

    it('should render authenticated user state', () => {
      const mockUser = {
        id: '123',
        displayName: 'TestUser',
        profileUrl: 'https://steamcommunity.com/profiles/123',
        avatar: 'https://example.com/avatar.jpg',
        steamId: '76561198012345678',
      };

      const mockState = {
        loading: false,
        isAuthenticated: true,
        user: mockUser,
        error: null,
      };

      const subscribeCallback = (authManager.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0];
      subscribeCallback(mockState);

      const element = authComponent.getElement();
      expect(element.innerHTML).toContain('auth-user');
      expect(element.innerHTML).toContain('TestUser');
      expect(element.innerHTML).toContain('https://example.com/avatar.jpg');
      expect(element.innerHTML).toContain('https://steamcommunity.com/profiles/123');
      expect(element.innerHTML).toContain('Logout');
    });

    it('should render login state', () => {
      const mockState = {
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };

      const subscribeCallback = (authManager.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0];
      subscribeCallback(mockState);

      const element = authComponent.getElement();
      expect(element.innerHTML).toContain('auth-login');
      expect(element.innerHTML).toContain('steam-login-btn');
      expect(element.innerHTML).toContain('Login with Steam');
    });
  });

  describe('Event Handling', () => {
    it('should handle login button click', () => {
      const mockState = {
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };

      const subscribeCallback = (authManager.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0];
      subscribeCallback(mockState);

      const element = authComponent.getElement();
      const loginButton = element.querySelector('#steam-login-btn') as HTMLButtonElement;

      expect(loginButton).toBeTruthy();
      loginButton.click();

      expect(authManager.login).toHaveBeenCalled();
    });

    it('should handle logout button click', () => {
      const mockUser = {
        id: '123',
        displayName: 'TestUser',
        profileUrl: 'https://steamcommunity.com/profiles/123',
        avatar: 'https://example.com/avatar.jpg',
        steamId: '76561198012345678',
      };

      const mockState = {
        loading: false,
        isAuthenticated: true,
        user: mockUser,
        error: null,
      };

      const subscribeCallback = (authManager.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0];
      subscribeCallback(mockState);

      const element = authComponent.getElement();
      const logoutButton = element.querySelector('#logout-btn') as HTMLButtonElement;

      expect(logoutButton).toBeTruthy();
      logoutButton.click();

      expect(authManager.logout).toHaveBeenCalled();
    });

    it('should handle retry button click', () => {
      const mockState = {
        loading: false,
        isAuthenticated: false,
        user: null,
        error: 'Authentication failed',
      };

      const subscribeCallback = (authManager.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0];
      subscribeCallback(mockState);

      const element = authComponent.getElement();
      const retryButton = element.querySelector('#retry-auth') as HTMLButtonElement;

      expect(retryButton).toBeTruthy();
      retryButton.click();

      expect(authManager.refreshUser).toHaveBeenCalled();
    });
  });

  describe('Lifecycle', () => {
    it('should unsubscribe when destroyed', () => {
      authComponent.destroy();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle multiple destroy calls gracefully', () => {
      authComponent.destroy();
      authComponent.destroy();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Element Management', () => {
    it('should return the same element instance', () => {
      const element1 = authComponent.getElement();
      const element2 = authComponent.getElement();
      expect(element1).toBe(element2);
    });

    it('should clear element content on state changes', () => {
      const mockState1 = {
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };

      const mockState2 = {
        loading: true,
        isAuthenticated: false,
        user: null,
        error: null,
      };

      const subscribeCallback = (authManager.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0];

      // First state change
      subscribeCallback(mockState1);
      const element = authComponent.getElement();
      const initialContent = element.innerHTML;

      // Second state change
      subscribeCallback(mockState2);
      const newContent = element.innerHTML;

      expect(newContent).not.toBe(initialContent);
      expect(newContent).toContain('Loading...');
    });
  });
});
