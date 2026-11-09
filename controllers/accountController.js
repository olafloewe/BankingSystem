import { store } from '../models/Store.js';

/**
 * Handles DOM events for Accounts, Transactions, Cards, and Loans
 * using Event Delegation on the root container.
 * @param {HTMLElement} rootElement
 */
export function initAccountController(rootElement) {
  // 1. Delegated Click Events (Select Account, Toggle Card, Pay Loan, Approve Loan)
  rootElement.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-action]');
    if (!actionBtn) return;

    const { action } = actionBtn.dataset;

    if (action === 'select-account') {
      store.dispatch('SELECT_ACCOUNT', {
        accountId: Number(actionBtn.dataset.accountId),
      });
    } else if (action === 'toggle-card') {
      store.dispatch('TOGGLE_CARD_STATUS', {
        cardId: Number(actionBtn.dataset.cardId),
      });
    } else if (action === 'pay-loan') {
      store.dispatch('PAY_LOAN', {
        loanId: Number(actionBtn.dataset.loanId),
      });
    } else if (action === 'approve-loan') {
      store.dispatch('APPROVE_LOAN', {
        loanId: Number(actionBtn.dataset.loanId),
      });
    }
  });

  // 2. Toggle target account field visibility when transaction type changes
  rootElement.addEventListener('change', (event) => {
    const typeSelect = event.target.closest('#tx-type');
    if (!typeSelect) return;

    const targetGroup = rootElement.querySelector('#target-account-group');
    if (targetGroup) {
      targetGroup.hidden = typeSelect.value !== 'transfer';
    }
  });

  // 3. Delegated Form Submissions (Open Account, Transaction, Issue Card, Request Loan)
  rootElement.addEventListener('submit', (event) => {
    const form = event.target;

    if (form.matches('#open-account-form')) {
      event.preventDefault();
      const formData = new FormData(form);
      store.dispatch('OPEN_ACCOUNT', {
        type: formData.get('type'),
        initialDepositCents: 0,
      });
    } else if (form.matches('#transaction-form')) {
      event.preventDefault();
      const formData = new FormData(form);
      const type = formData.get('type');
      const amountCents = Math.round(parseFloat(formData.get('amount')) * 100);
      const rawTarget = formData.get('targetAccountId');
      const targetAccountId =
        type === 'transfer' && rawTarget ? Number(rawTarget) : null;
      const description = formData.get('description')?.trim() || '';

      store.dispatch('CREATE_TRANSACTION', {
        type,
        amountCents,
        targetAccountId,
        description,
      });
    } else if (form.matches('#issue-card-form')) {
      event.preventDefault();
      const formData = new FormData(form);
      store.dispatch('ISSUE_CARD', {
        cardNumber: formData.get('cardNumber')?.trim(),
      });
    } else if (form.matches('#request-loan-form')) {
      event.preventDefault();
      const formData = new FormData(form);
      const amountCents = Math.round(parseFloat(formData.get('amount')) * 100);
      const interestRate = parseFloat(formData.get('interestRate'));

      store.dispatch('REQUEST_LOAN', {
        amountCents,
        interestRate,
      });
    }
  });
}
