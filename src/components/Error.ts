export class ErrorComponent {
  /**
   * Creates an error container element
   * @param title - The error title
   * @param message - The error message
   * @param buttonText - The button text (defaults to "Refresh")
   * @returns The error element
   */
  static create(title: string, message: string, buttonText: string = 'Refresh'): HTMLElement {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-container';

    errorElement.innerHTML = `
      <h2>${title}</h2>
      <p>${message}</p>
      <button class="refresh-button">${buttonText}</button>
    `;

    // Add event listener for the button
    const button = errorElement.querySelector('.refresh-button');
    if (button) {
      button.addEventListener('click', () => {
        window.location.reload();
      });
    }

    return errorElement;
  }
}
