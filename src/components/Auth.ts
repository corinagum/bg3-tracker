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
      const loadingContainer = document.createElement('div');
      loadingContainer.className = 'auth-loading';

      const spinner = document.createElement('div');
      spinner.className = 'spinner';

      const loadingText = document.createElement('span');
      loadingText.textContent = 'Loading...';

      loadingContainer.appendChild(spinner);
      loadingContainer.appendChild(loadingText);
      this.element.appendChild(loadingContainer);
      return;
    }

    if (state.error) {
      const errorContainer = document.createElement('div');
      errorContainer.className = 'auth-error';

      const errorText = document.createElement('span');
      errorText.textContent = state.error;

      const retryButton = document.createElement('button');
      retryButton.id = 'retry-auth';
      retryButton.textContent = 'Retry';
      retryButton.addEventListener('click', () => this.retryAuth());

      errorContainer.appendChild(errorText);
      errorContainer.appendChild(retryButton);
      this.element.appendChild(errorContainer);
      return;
    }

    if (state.isAuthenticated && state.user) {
      const userContainer = document.createElement('div');
      userContainer.className = 'auth-user';

      const userInfo = document.createElement('div');
      userInfo.className = 'user-info';

      const userAvatar = document.createElement('img');
      userAvatar.src = state.user.avatar;
      userAvatar.alt = state.user.displayName;
      userAvatar.className = 'user-avatar';

      const userDetails = document.createElement('div');
      userDetails.className = 'user-details';

      const userName = document.createElement('span');
      userName.className = 'user-name';
      userName.textContent = state.user.displayName;

      const userProfile = document.createElement('a');
      userProfile.href = state.user.profileUrl;
      userProfile.target = '_blank';
      userProfile.className = 'user-profile';
      userProfile.textContent = 'View Profile';

      const logoutButton = document.createElement('button');
      logoutButton.id = 'logout-btn';
      logoutButton.className = 'logout-btn';
      logoutButton.textContent = 'Logout';
      logoutButton.addEventListener('click', () => this.logout());

      userDetails.appendChild(userName);
      userDetails.appendChild(userProfile);
      userInfo.appendChild(userAvatar);
      userInfo.appendChild(userDetails);
      userContainer.appendChild(userInfo);
      userContainer.appendChild(logoutButton);
      this.element.appendChild(userContainer);
    } else {
      const loginContainer = document.createElement('div');
      loginContainer.className = 'auth-login';

      const steamLoginButton = document.createElement('button');
      steamLoginButton.id = 'steam-login-btn';
      steamLoginButton.className = 'steam-login-btn';

      const steamLogoImg = document.createElement('img');
      steamLogoImg.src = steamLogo;
      steamLogoImg.alt = 'Steam logo';
      steamLogoImg.className = 'steam-logo';

      steamLoginButton.appendChild(steamLogoImg);
      steamLoginButton.appendChild(document.createTextNode('Login with Steam'));
      steamLoginButton.addEventListener('click', () => this.login());

      loginContainer.appendChild(steamLoginButton);
      this.element.appendChild(loginContainer);
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