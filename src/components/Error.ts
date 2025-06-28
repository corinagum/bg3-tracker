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

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;

    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    const buttonElement = document.createElement('button');
    buttonElement.className = 'refresh-button';
    buttonElement.textContent = buttonText;

    // Add event listener for the button
    buttonElement.addEventListener('click', () => {
      window.location.reload();
    });

    errorElement.appendChild(titleElement);
    errorElement.appendChild(messageElement);
    errorElement.appendChild(buttonElement);

    return errorElement;
  }
}
