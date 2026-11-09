import { User } from './User.js';
import { Account, ACCOUNT_TYPES } from './Account.js';
import { Transaction, TRANSACTION_TYPES } from './Transaction.js';
import { Card, CARD_STATUSES } from './Card.js';
import { Loan, LOAN_STATUSES } from './Loan.js';
import { ROLES } from './Role.js';

/**
 * Centralized state store extending browser-native EventTarget.
 * Integrates all domain models: User, Account, Transaction, Card, Loan, and Role.
 */
export class BankStore extends EventTarget {
  #state = {
    currentUser: null,
    currentView: 'login', // 'login' | 'dashboard'
    selectedAccountId: null,
    nextIds: {
      account: 103,
      transaction: 1,
      card: 501,
      loan: 901,
    },
    users: [],
  };

  constructor(initialUsers = []) {
    super();
    this.#state.users = initialUsers;
  }

  get state() {
    return {
      currentUser: this.#state.currentUser,
      currentView: this.#state.currentView,
      selectedAccountId: this.#state.selectedAccountId,
      selectedAccount: this.selectedAccount,
      users: this.#state.users,
      constants: {
        ACCOUNT_TYPES,
        TRANSACTION_TYPES,
        CARD_STATUSES,
        LOAN_STATUSES,
        ROLES,
      },
    };
  }

  get selectedAccount() {
    if (!this.#state.currentUser || this.#state.selectedAccountId === null) {
      return null;
    }
    return (
      this.#state.currentUser.accounts.find(
        (acc) => acc.id === this.#state.selectedAccountId
      ) || null
    );
  }

  /**
   * Central control-flow dispatcher.
   */
  dispatch(action, payload = {}) {
    try {
      switch (action) {
        case 'LOGIN':
          this.#handleLogin(payload);
          break;
        case 'LOGOUT':
          this.#handleLogout();
          break;
        case 'SELECT_ACCOUNT':
          this.#handleSelectAccount(payload);
          break;
        case 'OPEN_ACCOUNT':
          this.#handleOpenAccount(payload);
          break;
        case 'CREATE_TRANSACTION':
          this.#handleTransaction(payload);
          break;
        case 'ISSUE_CARD':
          this.#handleIssueCard(payload);
          break;
        case 'TOGGLE_CARD_STATUS':
          this.#handleToggleCardStatus(payload);
          break;
        case 'REQUEST_LOAN':
          this.#handleRequestLoan(payload);
          break;
        case 'APPROVE_LOAN':
          this.#handleApproveLoan(payload);
          break;
        case 'PAY_LOAN':
          this.#handlePayLoan(payload);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      this.dispatchEvent(
        new CustomEvent('statechange', { detail: this.state })
      );
    } catch (err) {
      this.dispatchEvent(
        new CustomEvent('error', { detail: { message: err.message } })
      );
    }
  }

  #handleLogin({ customerId }) {
    const user = this.#state.users.find((u) => u.customerId === customerId);
    if (!user) {
      throw new Error(`No user found with ID "${customerId}"`);
    }

    this.#state.currentUser = user;
    this.#state.selectedAccountId = user.accounts[0]?.id ?? null;
    this.#state.currentView = 'dashboard';
  }

  #handleLogout() {
    this.#state.currentUser = null;
    this.#state.selectedAccountId = null;
    this.#state.currentView = 'login';
  }

  #handleSelectAccount({ accountId }) {
    if (!this.#state.currentUser) throw new Error('Must be logged in');
    const exists = this.#state.currentUser.accounts.some(
      (a) => a.id === accountId
    );
    if (!exists) throw new Error('Account not found');

    this.#state.selectedAccountId = accountId;
  }

  #handleOpenAccount({ type, initialDepositCents = 0 }) {
    const user = this.#state.currentUser;
    if (!user) throw new Error('Must be logged in');

    const newAccount = new Account(
      this.#state.nextIds.account++,
      user.id,
      type,
      initialDepositCents,
      new Date()
    );

    user.addAccount(newAccount);
    this.#state.selectedAccountId = newAccount.id;
  }

  #handleTransaction({ type, amountCents, targetAccountId = null, description = '' }) {
    const account = this.selectedAccount;
    if (!account) throw new Error('No active account selected');

    if (type === 'withdrawal' || type === 'transfer') {
      if (amountCents > account.balanceCents) {
        throw new Error('Insufficient funds for this transaction');
      }
    }

    const tx = new Transaction(
      this.#state.nextIds.transaction++,
      account.id,
      type,
      amountCents,
      type === 'transfer' ? targetAccountId : null,
      new Date(),
      description
    );

    if (type === 'deposit') {
      account.balanceCents += amountCents;
    } else if (type === 'withdrawal') {
      account.balanceCents -= amountCents;
    } else if (type === 'transfer') {
      const targetAccount = this.#findAccountById(targetAccountId);
      if (!targetAccount) {
        throw new Error(`Target account #${targetAccountId} does not exist`);
      }
      account.balanceCents -= amountCents;
      targetAccount.balanceCents += amountCents;
    }

    account.addTransaction(tx);
  }

  #handleIssueCard({ cardNumber }) {
    const user = this.#state.currentUser;
    const account = this.selectedAccount;
    if (!user || !account) throw new Error('Select an account to issue a card');

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 4);

    // Validated by Card model (requires 16 digits, valid accountId, etc.)
    const card = new Card(
      this.#state.nextIds.card++,
      cardNumber,
      account.id,
      expiry,
      'active'
    );

    user.addCard(card);
  }

  #handleToggleCardStatus({ cardId }) {
    const user = this.#state.currentUser;
    if (!user) throw new Error('Must be logged in');

    const card = user.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    card.status = card.status === 'active' ? 'blocked' : 'active';
  }

  #handleRequestLoan({ amountCents, interestRate }) {
    const user = this.#state.currentUser;
    if (!user) throw new Error('Must be logged in');

    // Validated by Loan model
    const loan = new Loan(
      this.#state.nextIds.loan++,
      user.id,
      amountCents,
      interestRate,
      'pending'
    );

    user.addLoan(loan);
  }

  #handleApproveLoan({ loanId }) {
    const currentUser = this.#state.currentUser;
    if (!currentUser) throw new Error('Must be logged in');
    if (currentUser.role !== 'employee' && currentUser.role !== 'admin') {
      throw new Error('Only employees or admins can approve loans');
    }

    for (const user of this.#state.users) {
      const loan = user.loans.find((l) => l.id === loanId);
      if (loan) {
        if (loan.status !== 'pending') {
          throw new Error('Only pending loans can be approved');
        }
        loan.status = 'approved';

        // Disburse loan amount into the user's first account if available
        const primaryAccount = user.accounts[0];
        if (primaryAccount) {
          primaryAccount.balanceCents += loan.amountCents;
          const tx = new Transaction(
            this.#state.nextIds.transaction++,
            primaryAccount.id,
            'deposit',
            loan.amountCents,
            null,
            new Date(),
            `Loan #${loan.id} disbursement`
          );
          primaryAccount.addTransaction(tx);
        }
        return;
      }
    }

    throw new Error(`Loan #${loanId} not found`);
  }

  #handlePayLoan({ loanId }) {
    const user = this.#state.currentUser;
    const account = this.selectedAccount;
    if (!user || !account) throw new Error('Select an account to pay the loan from');

    const loan = user.loans.find((l) => l.id === loanId);
    if (!loan) throw new Error('Loan not found');
    if (loan.status !== 'approved') {
      throw new Error('Only approved loans can be paid off');
    }
    if (account.balanceCents < loan.amountCents) {
      throw new Error('Insufficient funds in selected account to pay off this loan');
    }

    account.balanceCents -= loan.amountCents;
    loan.status = 'paid';

    const tx = new Transaction(
      this.#state.nextIds.transaction++,
      account.id,
      'withdrawal',
      loan.amountCents,
      null,
      new Date(),
      `Loan #${loan.id} payoff`
    );
    account.addTransaction(tx);
  }

  #findAccountById(accountId) {
    for (const user of this.#state.users) {
      const found = user.accounts.find((a) => a.id === accountId);
      if (found) return found;
    }
    return null;
  }
}

// --- Seed Initial Domain Objects ---
const checking101 = new Account(101, 1, 'checking', 150000); // $1,500.00
const savings102 = new Account(102, 1, 'savings', 500000);   // $5,000.00
const seedCard = new Card(500, '4000123456789010', 101, new Date(2029, 11, 31), 'active');
const seedLoan = new Loan(900, 1, 100000, 4.5, 'pending');   // $1,000.00 @ 4.5%

const aliceCustomer = new User(
  1,
  '1001',
  'Alice Novak',
  'customer',
  'alice@meritobank.com',
  'hashed_pw_123',
  [checking101, savings102],
  [seedCard],
  [seedLoan]
);

const bobEmployee = new User(
  2,
  '2001',
  'Bob Kowalski',
  'employee',
  'bob@meritobank.com',
  'hashed_pw_456'
);

export const store = new BankStore([aliceCustomer, bobEmployee]);
