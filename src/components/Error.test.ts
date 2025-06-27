import { describe, it, expect, vi } from 'vitest';
import { ErrorComponent } from './Error';

describe('ErrorComponent', () => {
  it('creates an error element with title and message', () => {
    const title = 'Test Error';
    const message = 'This is a test error message';

    const element = ErrorComponent.create(title, message);

    expect(element).toBeDefined();
    expect(element.className).toBe('error-container');
    expect(element.querySelector('h2')?.textContent).toBe('Test Error');
    expect(element.querySelector('p')?.textContent).toBe('This is a test error message');
    expect(element.querySelector('button')?.textContent).toBe('Refresh');
  });

  it('creates an error element with custom button text', () => {
    const title = 'Test Error';
    const message = 'This is a test error message';
    const buttonText = 'Custom Button';

    const element = ErrorComponent.create(title, message, buttonText);

    expect(element.querySelector('button')?.textContent).toBe('Custom Button');
  });

  it('calls window.location.reload when button is clicked', () => {
    // Create a mock function for reload
    const mockReload = vi.fn();
    
    // Mock window.location.reload using Object.defineProperty
    Object.defineProperty(window, 'location', {
      value: {
        reload: mockReload
      },
      writable: true
    });
    
    const title = 'Test Error';
    const message = 'This is a test error message';

    const element = ErrorComponent.create(title, message);
    const button = element.querySelector('button');
    expect(button).toBeDefined();

    button?.click();

    expect(mockReload).toHaveBeenCalledTimes(1);
  });
});
