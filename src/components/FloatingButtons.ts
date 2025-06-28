export class FloatingButtonsComponent {
  private container: HTMLElement;
  private jumpToCompletedBtn: HTMLElement;
  private jumpToTopBtn: HTMLElement;
  private scrollThreshold: number;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'floating-buttons';
    this.scrollThreshold = window.innerHeight; // 1 screen height

    this.jumpToCompletedBtn = this.createJumpToCompletedButton();
    this.jumpToTopBtn = this.createJumpToTopButton();

    this.container.appendChild(this.jumpToCompletedBtn);
    this.container.appendChild(this.jumpToTopBtn);

    this.setupEventListeners();
    this.updateButtonVisibility();
  }

  private createJumpToCompletedButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'fab fab-jump-to-completed';
    button.title = 'Jump to completed achievements';

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z');
    path.setAttribute('fill', 'currentColor');

    svg.appendChild(path);

    // Create text span
    const textSpan = document.createElement('span');
    textSpan.className = 'fab-text';
    textSpan.textContent = 'Jump to Completed';

    button.appendChild(svg);
    button.appendChild(textSpan);
    return button;
  }

  private createJumpToTopButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'fab fab-jump-to-top';
    button.title = 'Jump to top';

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z');
    path.setAttribute('fill', 'currentColor');

    svg.appendChild(path);

    // Create text span
    const textSpan = document.createElement('span');
    textSpan.className = 'fab-text';
    textSpan.textContent = 'Jump to Top';

    button.appendChild(svg);
    button.appendChild(textSpan);
    return button;
  }

  private setupEventListeners(): void {
    // Scroll event listener
    window.addEventListener('scroll', () => {
      this.updateButtonVisibility();
    });

    // Jump to completed button click
    this.jumpToCompletedBtn.addEventListener('click', () => {
      this.scrollToCompletedAchievements();
    });

    // Jump to top button click
    this.jumpToTopBtn.addEventListener('click', () => {
      this.scrollToTop();
    });
  }

  private updateButtonVisibility(): void {
    const scrollY = window.scrollY;
    const hasCompletedAchievements = this.hasCompletedAchievements();
    const isInCompletedSection = this.isInCompletedSection();

    // Show jump to completed button only if:
    // - We have completed achievements
    // - We're not already in the completed section
    // - We're not scrolled too far down
    const showJumpToCompleted = hasCompletedAchievements
                               && !isInCompletedSection
                               && scrollY < this.scrollThreshold;

    // Show jump to top button only if:
    // - We're scrolled down more than 1 screen height
    const showJumpToTop = scrollY > this.scrollThreshold;

    this.jumpToCompletedBtn.style.display = showJumpToCompleted ? 'flex' : 'none';
    this.jumpToTopBtn.style.display = showJumpToTop ? 'flex' : 'none';
  }

  private hasCompletedAchievements(): boolean {
    // Check if there are any completed achievements in the list
    const completedAchievements = document.querySelectorAll('.achievement.completed');
    return completedAchievements.length > 0;
  }

  private isInCompletedSection(): boolean {
    // Check if we're currently viewing completed achievements
    // This is a simple heuristic - we could make this more sophisticated
    const scrollY = window.scrollY;
    const completedAchievements = document.querySelectorAll('.achievement.completed');

    if (completedAchievements.length === 0) return false;

    const firstCompleted = completedAchievements[0] as HTMLElement;
    const firstCompletedTop = firstCompleted.offsetTop;

    // Consider "in completed section" if we're within 100px of the first completed achievement
    return Math.abs(scrollY - firstCompletedTop) < 100;
  }

  private scrollToCompletedAchievements(): void {
    const completedAchievements = document.querySelectorAll('.achievement.completed');
    if (completedAchievements.length > 0) {
      const firstCompleted = completedAchievements[0] as HTMLElement;
      firstCompleted.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  getElement(): HTMLElement {
    return this.container;
  }

  // Public method to force update visibility (useful when achievements are toggled)
  updateVisibility(): void {
    this.updateButtonVisibility();
  }
}
