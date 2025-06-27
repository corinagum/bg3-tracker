import { authManager, type AuthState } from '@utils/auth';
import '../styles/auth.css';
import steamLogo from '../assets/steam-logo.svg';

export class AuthComponent {
  private element: HTMLElement;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'auth-container';
    this.setupAuthListener();
  }

  private setupAuthListener(): void {
    this.unsubscribe = authManager.subscribe((state: AuthState) => {
      this.render(state);
    });
  }

  private render(state: AuthState): void {
    this.element.innerHTML = '';

    if (state.loading) {
      this.element.innerHTML = `
        <div class="auth-loading">
          <div class="spinner"></div>
          <span>Loading...</span>
        </div>
      `;
      return;
    }

    if (state.error) {
      this.element.innerHTML = `
        <div class="auth-error">
          <span>${state.error}</span>
          <button id="retry-auth">Retry</button>
        </div>
      `;
      this.element.querySelector('#retry-auth')?.addEventListener('click', () => this.retryAuth());
      return;
    }

    if (state.isAuthenticated && state.user) {
      this.element.innerHTML = `
        <div class="auth-user">
          <div class="user-info">
            <img src="${state.user.avatar}" alt="${state.user.displayName}" class="user-avatar">
            <div class="user-details">
              <span class="user-name">${state.user.displayName}</span>
              <a href="${state.user.profileUrl}" target="_blank" class="user-profile">View Profile</a>
            </div>
          </div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      `;
      this.element.querySelector('#logout-btn')?.addEventListener('click', () => this.logout());
    } else {
      this.element.innerHTML = `
        <div class="auth-login">
          <button id="steam-login-btn" class="steam-login-btn">
            <img src="${steamLogo}" alt="Steam logo" class="steam-logo" />
            Login with Steam
          </button>
        </div>
      `;
      this.element.querySelector('#steam-login-btn')?.addEventListener('click', () => this.login());
    }
  }

  private async login(): Promise<void> {
    await authManager.login();
  }

  private async logout(): Promise<void> {
    await authManager.logout();
  }

  private retryAuth(): void {
    authManager.refreshUser();
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
