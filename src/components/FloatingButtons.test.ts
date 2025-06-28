import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FloatingButtonsComponent } from './FloatingButtons';

// Mock DOM elements and methods
const mockScrollIntoView = vi.fn();
const mockScrollTo = vi.fn();

// Mock window.scrollY and window.innerHeight
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 800,
});

// Mock Element.scrollIntoView
Element.prototype.scrollIntoView = mockScrollIntoView;

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: mockScrollTo,
});

describe('FloatingButtonsComponent', () => {
  let component: FloatingButtonsComponent;
  let container: HTMLElement;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset window properties
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });

    // Create component
    component = new FloatingButtonsComponent();
    container = component.getElement();

    // Add to document for proper testing
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should create floating buttons container', () => {
      expect(container).toBeInstanceOf(HTMLElement);
      expect(container.className).toBe('floating-buttons');
    });

    it('should create jump to completed button', () => {
      const jumpToCompletedBtn = container.querySelector('.fab-jump-to-completed');
      expect(jumpToCompletedBtn).toBeInstanceOf(HTMLElement);
      expect(jumpToCompletedBtn?.tagName).toBe('BUTTON');
    });

    it('should create jump to top button', () => {
      const jumpToTopBtn = container.querySelector('.fab-jump-to-top');
      expect(jumpToTopBtn).toBeInstanceOf(HTMLElement);
      expect(jumpToTopBtn?.tagName).toBe('BUTTON');
    });

    it('should set scroll threshold to window inner height', () => {
      expect(window.innerHeight).toBe(800);
    });
  });

  describe('Button Visibility Logic', () => {
    it('should hide both buttons initially when no completed achievements', () => {
      const jumpToCompletedBtn = container.querySelector('.fab-jump-to-completed') as HTMLElement;
      const jumpToTopBtn = container.querySelector('.fab-jump-to-top') as HTMLElement;

      expect(jumpToCompletedBtn.style.display).toBe('none');
      expect(jumpToTopBtn.style.display).toBe('none');
    });

    it('should show jump to completed button when achievements exist and not scrolled', () => {
      // Mock completed achievements with proper positioning
      const mockAchievement = document.createElement('div');
      mockAchievement.className = 'achievement completed';
      mockAchievement.style.position = 'absolute';
      mockAchievement.style.top = '1000px'; // Far from current scroll position
      document.body.appendChild(mockAchievement);

      // Ensure scrollY is 0 and scrollThreshold is 800
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 0,
      });

      // Mock the isInCompletedSection method to return false
      const isInCompletedSectionSpy = vi.spyOn(component as any, 'isInCompletedSection').mockReturnValue(false);

      // Trigger visibility update
      component.updateVisibility();

      const jumpToCompletedBtn = container.querySelector('.fab-jump-to-completed') as HTMLElement;
      const jumpToTopBtn = container.querySelector('.fab-jump-to-top') as HTMLElement;

      expect(jumpToCompletedBtn.style.display).toBe('flex');
      expect(jumpToTopBtn.style.display).toBe('none');

      // Clean up
      document.body.removeChild(mockAchievement);
      isInCompletedSectionSpy.mockRestore();
    });

    it('should show jump to top button when scrolled down', () => {
      // Mock scroll position
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 1000, // More than innerHeight (800)
      });

      // Trigger visibility update
      component.updateVisibility();

      const jumpToCompletedBtn = container.querySelector('.fab-jump-to-completed') as HTMLElement;
      const jumpToTopBtn = container.querySelector('.fab-jump-to-top') as HTMLElement;

      expect(jumpToCompletedBtn.style.display).toBe('none');
      expect(jumpToTopBtn.style.display).toBe('flex');
    });

    it('should hide jump to completed button when in completed section', () => {
      // Mock completed achievements
      const mockAchievement = document.createElement('div');
      mockAchievement.className = 'achievement completed';
      document.body.appendChild(mockAchievement);

      // Mock the isInCompletedSection method to return true
      const isInCompletedSectionSpy = vi.spyOn(component as any, 'isInCompletedSection').mockReturnValue(true);

      // Trigger visibility update
      component.updateVisibility();

      const jumpToCompletedBtn = container.querySelector('.fab-jump-to-completed') as HTMLElement;
      expect(jumpToCompletedBtn.style.display).toBe('none');

      // Clean up
      document.body.removeChild(mockAchievement);
      isInCompletedSectionSpy.mockRestore();
    });
  });

  describe('Button Interactions', () => {
    it('should scroll to completed achievements when jump to completed button is clicked', () => {
      // Mock completed achievements
      const mockAchievement = document.createElement('div');
      mockAchievement.className = 'achievement completed';
      document.body.appendChild(mockAchievement);

      // Show the button
      component.updateVisibility();

      const jumpToCompletedBtn = container.querySelector('.fab-jump-to-completed') as HTMLElement;
      jumpToCompletedBtn.click();

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });

      // Clean up
      document.body.removeChild(mockAchievement);
    });

    it('should scroll to top when jump to top button is clicked', () => {
      // Mock scroll position to show the button
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 1000,
      });

      // Show the button
      component.updateVisibility();

      const jumpToTopBtn = container.querySelector('.fab-jump-to-top') as HTMLElement;
      jumpToTopBtn.click();

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('should not scroll if no completed achievements exist', () => {
      // Ensure no completed achievements exist
      const existingCompleted = document.querySelectorAll('.achievement.completed');
      existingCompleted.forEach(el => el.remove());

      const jumpToCompletedBtn = container.querySelector('.fab-jump-to-completed') as HTMLElement;
      jumpToCompletedBtn.click();

      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper title attributes', () => {
      const jumpToCompletedBtn = container.querySelector('.fab-jump-to-completed') as HTMLElement;
      const jumpToTopBtn = container.querySelector('.fab-jump-to-top') as HTMLElement;

      expect(jumpToCompletedBtn.title).toBe('Jump to completed achievements');
      expect(jumpToTopBtn.title).toBe('Jump to top');
    });

    it('should have proper button elements', () => {
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(2);
    });
  });
});
