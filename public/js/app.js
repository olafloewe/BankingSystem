import { store } from '../../models/Store.js';
import { renderLoginView, renderDashboardView } from '../../views/renderViews.js';
import { initAuthController } from '../../controllers/authController.js';
import { initAccountController } from '../../controllers/accountController.js';

const appRoot = document.querySelector('#app');
const alertBanner = document.querySelector('#alert-banner');

/**
 * Main render function triggered by Store's 'statechange' event
 */
function render(state) {
  alertBanner.hidden = true;
  alertBanner.textContent = '';

  if (state.currentView === 'login') {
    appRoot.innerHTML = renderLoginView();
  } else if (state.currentView === 'dashboard') {
    appRoot.innerHTML = renderDashboardView(state);
  }
}

// 1. Subscribe View layer to Store's 'statechange' event
store.addEventListener('statechange', (event) => {
  render(event.detail);
});

// 2. Subscribe View layer to Store's 'error' event
store.addEventListener('error', (event) => {
  alertBanner.textContent = event.detail.message;
  alertBanner.hidden = false;
});

// 3. Initialize Controllers once on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initAuthController(appRoot);
  initAccountController(appRoot);
  render(store.state);
});
