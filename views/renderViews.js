/**
 * Helper to format integer cents (e.g. 150000) into "$1,500.00"
 */
function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * View: Login Screen
 */
export function renderLoginView() {
  return `
    <section class="card">
      <h2>Merito Bank Login</h2>
      <p class="hint">
        Demo Customer ID: <strong>1001</strong> (Alice - Customer)<br/>
        Demo Employee ID: <strong>2001</strong> (Bob - Employee / Loan Approver)
      </p>
      <form id="login-form">
        <label for="customerId">Login ID</label>
        <input id="customerId" name="customerId" type="text" value="1001" required />
        <button type="submit">Sign In</button>
      </form>
    </section>
  `;
}

/**
 * View: Role-based Employee Dashboard (for approving customer loans)
 */
function renderEmployeeLoanPanel(users) {
  const allLoans = users.flatMap((u) =>
    u.loans.map((loan) => ({ user: u, loan }))
  );

  const rows =
    allLoans.length > 0
      ? allLoans
          .map(
            ({ user, loan }) => `
        <tr>
          <td>#${loan.id}</td>
          <td>${user.name} (${user.customerId})</td>
          <td>${formatCurrency(loan.amountCents)}</td>
          <td>${loan.interestRate}%</td>
          <td><span class="badge badge-${loan.status}">${loan.status}</span></td>
          <td>
            ${
              loan.status === 'pending'
                ? `<button type="button" data-action="approve-loan" data-loan-id="${loan.id}">Approve & Disburse</button>`
                : '-'
            }
          </td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="6">No loan applications found.</td></tr>`;

  return `
    <section class="card">
      <h3>Employee Portal: Customer Loan Applications</h3>
      <table>
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Rate</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </section>
  `;
}

/**
 * View: Customer & Employee Dashboard Screen
 */
export function renderDashboardView({ currentUser, selectedAccount, users, constants }) {
  const isStaff = currentUser.role === 'employee' || currentUser.role === 'admin';

  const accountTabs = currentUser.accounts
    .map(
      (acc) => `
      <button
        type="button"
        class="account-tab ${acc.id === selectedAccount?.id ? 'active' : ''}"
        data-action="select-account"
        data-account-id="${acc.id}"
      >
        <strong>#${acc.id} (${acc.type.toUpperCase()})</strong>
        <span>${formatCurrency(acc.balanceCents)}</span>
      </button>
    `
    )
    .join('');

  const accountTypeOptions = constants.ACCOUNT_TYPES.map(
    (t) => `<option value="${t}">${t.toUpperCase()}</option>`
  ).join('');

  const txTypeOptions = constants.TRANSACTION_TYPES.map(
    (t) => `<option value="${t}">${t.toUpperCase()}</option>`
  ).join('');

  const transactionRows =
    selectedAccount?.transactions.length > 0
      ? selectedAccount.transactions
          .slice()
          .reverse()
          .map(
            (tx) => `
          <tr>
            <td>#${tx.id}</td>
            <td>${tx.type}</td>
            <td>${formatCurrency(tx.amountCents)}</td>
            <td>${tx.targetAccountId ? `#${tx.targetAccountId}` : '-'}</td>
            <td>${tx.description || '-'}</td>
          </tr>
        `
          )
          .join('')
      : `<tr><td colspan="5">No transactions yet.</td></tr>`;

  const cardRows =
    currentUser.cards.length > 0
      ? currentUser.cards
          .map(
            (card) => `
          <tr>
            <td>#${card.id}</td>
            <td><code>${card.cardNumber}</code></td>
            <td>#${card.accountId}</td>
            <td><span class="badge badge-${card.status}">${card.status}</span></td>
            <td>
              <button
                type="button"
                class="btn-small"
                data-action="toggle-card"
                data-card-id="${card.id}"
              >
                ${card.status === 'active' ? 'Block' : 'Unblock'}
              </button>
            </td>
          </tr>
        `
          )
          .join('')
      : `<tr><td colspan="5">No cards issued.</td></tr>`;

  const loanRows =
    currentUser.loans.length > 0
      ? currentUser.loans
          .map(
            (loan) => `
          <tr>
            <td>#${loan.id}</td>
            <td>${formatCurrency(loan.amountCents)}</td>
            <td>${loan.interestRate}%</td>
            <td><span class="badge badge-${loan.status}">${loan.status}</span></td>
            <td>
              ${
                loan.status === 'approved'
                  ? `<button type="button" class="btn-small" data-action="pay-loan" data-loan-id="${loan.id}">Pay Off</button>`
                  : '-'
              }
            </td>
          </tr>
        `
          )
          .join('')
      : `<tr><td colspan="5">No loans on record.</td></tr>`;

  return `
    <header class="dashboard-header">
      <div>
        <h2>Welcome, ${currentUser.name}</h2>
        <small>ID: ${currentUser.customerId} | Email: ${currentUser.email} | Role: <strong>${currentUser.role.toUpperCase()}</strong></small>
      </div>
      <button type="button" data-action="logout" class="btn-secondary">Log Out</button>
    </header>

    ${isStaff ? renderEmployeeLoanPanel(users) : ''}

    <section class="accounts-bar">
      ${accountTabs}
      <form id="open-account-form" class="inline-form">
        <select name="type" aria-label="Account Type">${accountTypeOptions}</select>
        <button type="submit">+ Open Account</button>
      </form>
    </section>

    ${
      selectedAccount
        ? `
      <div class="dashboard-grid">
        <section class="card">
          <h3>New Transaction (Account #${selectedAccount.id})</h3>
          <form id="transaction-form">
            <label for="tx-type">Type</label>
            <select id="tx-type" name="type">
              ${txTypeOptions}
            </select>

            <label for="tx-amount">Amount ($)</label>
            <input id="tx-amount" name="amount" type="number" step="0.01" min="0.01" required />

            <div id="target-account-group" hidden>
              <label for="tx-target">Target Account ID (e.g. 101 or 102)</label>
              <input id="tx-target" name="targetAccountId" type="number" />
            </div>

            <label for="tx-desc">Description</label>
            <input id="tx-desc" name="description" type="text" placeholder="Optional note" />

            <button type="submit">Submit Transaction</button>
          </form>
        </section>

        <section class="card">
          <h3>Transaction History (Account #${selectedAccount.id})</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Target</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${transactionRows}
            </tbody>
          </table>
        </section>

        <section class="card">
          <h3>Cards (Linked to Accounts)</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>16-Digit Number</th>
                <th>Account</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${cardRows}
            </tbody>
          </table>
          <form id="issue-card-form" class="mt-1">
            <label for="card-num">Issue New Card for Account #${selectedAccount.id} (16 digits)</label>
            <input id="card-num" name="cardNumber" type="text" pattern="\\d{16}" maxlength="16" value="4000999988887777" required />
            <button type="submit">Issue Card</button>
          </form>
        </section>

        <section class="card">
          <h3>Loans</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Principal</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${loanRows}
            </tbody>
          </table>
          <form id="request-loan-form" class="mt-1">
            <label for="loan-amount">Request Loan Amount ($)</label>
            <input id="loan-amount" name="amount" type="number" step="0.01" min="1" value="500" required />
            <label for="loan-rate">Interest Rate (%)</label>
            <input id="loan-rate" name="interestRate" type="number" step="0.1" min="0" value="5.0" required />
            <button type="submit">Apply for Loan</button>
          </form>
        </section>
      </div>
    `
        : `<p class="card">Open an account above to start managing transactions, cards, and loans.</p>`
    }
  `;
}
