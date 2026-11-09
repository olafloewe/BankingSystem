import { store } from '../models/Store.js';

/**
 * Handles authentication events (Login form submission & Logout button clicks)
 * using Event Delegation on the root container.
 * @param {HTMLElement} rootElement
 */
export function initAuthController(rootElement) {
  // 1. Listen for login form submission
  rootElement.addEventListener('submit', (event) => {
    const form = event.target.closest('#login-form');
    if (!form) return;

    event.preventDefault();
    const formData = new FormData(form);
    const customerId = formData.get('customerId')?.trim();

    store.dispatch('LOGIN', { customerId });
  });

  // 2. Listen for logout button click
  rootElement.addEventListener('click', (event) => {
    const logoutBtn = event.target.closest('[data-action="logout"]');
    if (!logoutBtn) return;

    store.dispatch('LOGOUT');
  });
}
