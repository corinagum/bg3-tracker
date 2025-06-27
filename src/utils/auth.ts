export interface SteamUser {
  id: string;
  displayName: string;
  profileUrl: string;
  avatar: string;
  steamId: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: SteamUser | null;
  loading: boolean;
  error: string | null;
}

export class AuthManager {
  private static instance: AuthManager;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.checkAuthStatus();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): AuthState {
    return { ...this.authState };
  }

  private async checkAuthStatus(): Promise<void> {
    this.authState.loading = true;
    this.notifyListeners();

    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const user = await response.json();
        this.authState.isAuthenticated = true;
        this.authState.user = user;
        this.authState.error = null;
      } else {
        this.authState.isAuthenticated = false;
        this.authState.user = null;
      }
    } catch {
      this.authState.isAuthenticated = false;
      this.authState.user = null;
      this.authState.error = 'Failed to check authentication status';
    } finally {
      this.authState.loading = false;
      this.notifyListeners();
    }
  }

  async login(): Promise<void> {
    this.authState.loading = true;
    this.notifyListeners();

    try {
      // Redirect to Steam login
      window.location.href = '/api/auth/steam';
    } catch {
      this.authState.error = 'Failed to initiate login';
      this.authState.loading = false;
      this.notifyListeners();
    }
  }

  async logout(): Promise<void> {
    this.authState.loading = true;
    this.notifyListeners();

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        this.authState.isAuthenticated = false;
        this.authState.user = null;
        this.authState.error = null;
      } else {
        this.authState.error = 'Failed to logout';
      }
    } catch {
      this.authState.error = 'Failed to logout';
    } finally {
      this.authState.loading = false;
      this.notifyListeners();
    }
  }

  async refreshUser(): Promise<void> {
    await this.checkAuthStatus();
  }
}

export const authManager = AuthManager.getInstance();
