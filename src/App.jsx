import { useState } from 'react';
import { User } from '../models/User.js';
import { Account, ACCOUNT_TYPES } from '../models/Account.js';
import { Transaction, TRANSACTION_TYPES } from '../models/Transaction.js';
import { Card, CARD_STATUSES } from '../models/Card.js';
import { Loan, LOAN_STATUSES } from '../models/Loan.js';
import { ROLES } from '../models/Role.js';

import AlertBanner from './components/AlertBanner.jsx';
import LoginView from './components/LoginView.jsx';
import DashboardView from './components/DashboardView.jsx';

const CONSTANTS = {
  ACCOUNT_TYPES,
  TRANSACTION_TYPES,
  CARD_STATUSES,
  LOAN_STATUSES,
  ROLES,
};

/**
 * Creates the initial seeded domain objects for the banking system.
 */
function createInitialUsers() {
  const checking101 = new Account(101, 1, 'checking', 150000); // $1,500.00
  const savings102 = new Account(102, 1, 'savings', 500000);   // $5,000.00
  const seedCard = new Card(
    500,
    '4000123456789010',
    101,
    new Date(2029, 11, 31),
    'active'
  );
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

  return [aliceCustomer, bobEmployee];
}

/**
 * Helper to create a fresh User instance for immutable React state updates.
 */
function cloneUser(user, overrides = {}) {
  return new User(
    user.id,
    user.customerId,
    user.name,
    user.role,
    user.email,
    user.passwordHash,
    overrides.accounts ?? user.accounts,
    overrides.cards ?? user.cards,
    overrides.loans ?? user.loans
  );
}

/**
 * Helper to create a fresh Account instance for immutable React state updates.
 */
function cloneAccount(account, overrides = {}) {
  return new Account(
    account.id,
    account.userId,
    account.type,
    overrides.balanceCents ?? account.balanceCents,
    account.createdAt,
    overrides.transactions ?? account.transactions
  );
}

// returns a fresh Card instance for immutable React state updates
// acts as a single source of truth
// handlers handle react events and update state, which is then passed down to components as props
export default function App() {
  const [users, setUsers] = useState(() => createInitialUsers());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [nextIds, setNextIds] = useState({
    account: 103,
    transaction: 1,
    card: 501,
    loan: 901,
  });

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const selectedAccount =
    currentUser?.accounts.find((acc) => acc.id === selectedAccountId) || null;

  // --- Authentication Handlers ---
  const handleLogin = (customerId) => {
    try {
      const user = users.find((u) => u.customerId === customerId);
      if (!user) {
        throw new Error(`No user found with ID "${customerId}"`);
      }

      setCurrentUserId(user.id);
      setSelectedAccountId(user.accounts[0]?.id ?? null);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setSelectedAccountId(null);
    setErrorMessage('');
  };

  // --- Account Handlers ---
  const handleSelectAccount = (accountId) => {
    try {
      if (!currentUser) throw new Error('Must be logged in');
      const exists = currentUser.accounts.some((a) => a.id === accountId);
      if (!exists) throw new Error('Account not found');

      setSelectedAccountId(accountId);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleOpenAccount = (type, initialDepositCents = 0) => {
    try {
      if (!currentUser) throw new Error('Must be logged in');

      const newAccount = new Account(
        nextIds.account,
        currentUser.id,
        type,
        initialDepositCents,
        new Date()
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === currentUser.id
            ? cloneUser(u, { accounts: [...u.accounts, newAccount] })
            : u
        )
      );
      setNextIds((prev) => ({ ...prev, account: prev.account + 1 }));
      setSelectedAccountId(newAccount.id);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // --- Transaction Handler ---
  const handleCreateTransaction = ({
    type,
    amountCents,
    targetAccountId = null,
    description = '',
  }) => {
    try {
      if (!selectedAccount) throw new Error('No active account selected');

      if (type === 'withdrawal' || type === 'transfer') {
        if (amountCents > selectedAccount.balanceCents) {
          throw new Error('Insufficient funds for this transaction');
        }
      }

      if (type === 'transfer') {
        const targetExists = users.some((u) =>
          u.accounts.some((a) => a.id === targetAccountId)
        );
        if (!targetExists) {
          throw new Error(`Target account #${targetAccountId} does not exist`);
        }
      }

      const tx = new Transaction(
        nextIds.transaction,
        selectedAccount.id,
        type,
        amountCents,
        type === 'transfer' ? targetAccountId : null,
        new Date(),
        description
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          const touchesUser = user.accounts.some(
            (acc) =>
              acc.id === selectedAccount.id ||
              (type === 'transfer' && acc.id === targetAccountId)
          );
          if (!touchesUser) return user;

          const updatedAccounts = user.accounts.map((acc) => {
            if (acc.id === selectedAccount.id) {
              const newBalance =
                type === 'deposit'
                  ? acc.balanceCents + amountCents
                  : acc.balanceCents - amountCents;
              return cloneAccount(acc, {
                balanceCents: newBalance,
                transactions: [...acc.transactions, tx],
              });
            }
            if (type === 'transfer' && acc.id === targetAccountId) {
              return cloneAccount(acc, {
                balanceCents: acc.balanceCents + amountCents,
              });
            }
            return acc;
          });

          return cloneUser(user, { accounts: updatedAccounts });
        })
      );

      setNextIds((prev) => ({ ...prev, transaction: prev.transaction + 1 }));
      setErrorMessage('');
      return true;
    } catch (err) {
      setErrorMessage(err.message);
      return false;
    }
  };

  // --- Card Handlers ---
  const handleIssueCard = (cardNumber) => {
    try {
      if (!currentUser || !selectedAccount) {
        throw new Error('Select an account to issue a card');
      }

      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 4);

      const newCard = new Card(
        nextIds.card,
        cardNumber,
        selectedAccount.id,
        expiry,
        'active'
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === currentUser.id
            ? cloneUser(u, { cards: [...u.cards, newCard] })
            : u
        )
      );
      setNextIds((prev) => ({ ...prev, card: prev.card + 1 }));
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleToggleCardStatus = (cardId) => {
    try {
      if (!currentUser) throw new Error('Must be logged in');
      const targetCard = currentUser.cards.find((c) => c.id === cardId);
      if (!targetCard) throw new Error('Card not found');

      const nextStatus = targetCard.status === 'active' ? 'blocked' : 'active';
      const updatedCard = new Card(
        targetCard.id,
        targetCard.cardNumber,
        targetCard.accountId,
        targetCard.expiry,
        nextStatus
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === currentUser.id
            ? cloneUser(u, {
                cards: u.cards.map((c) => (c.id === cardId ? updatedCard : c)),
              })
            : u
        )
      );
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // --- Loan Handlers ---
  const handleRequestLoan = ({ amountCents, interestRate }) => {
    try {
      if (!currentUser) throw new Error('Must be logged in');

      const newLoan = new Loan(
        nextIds.loan,
        currentUser.id,
        amountCents,
        interestRate,
        'pending'
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === currentUser.id
            ? cloneUser(u, { loans: [...u.loans, newLoan] })
            : u
        )
      );
      setNextIds((prev) => ({ ...prev, loan: prev.loan + 1 }));
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleApproveLoan = (loanId) => {
    try {
      if (!currentUser) throw new Error('Must be logged in');
      if (currentUser.role !== 'employee' && currentUser.role !== 'admin') {
        throw new Error('Only employees or admins can approve loans');
      }

      const owner = users.find((u) => u.loans.some((l) => l.id === loanId));
      if (!owner) throw new Error(`Loan #${loanId} not found`);

      const targetLoan = owner.loans.find((l) => l.id === loanId);
      if (targetLoan.status !== 'pending') {
        throw new Error('Only pending loans can be approved');
      }

      const approvedLoan = new Loan(
        targetLoan.id,
        targetLoan.userId,
        targetLoan.amountCents,
        targetLoan.interestRate,
        'approved'
      );

      const primaryAccount = owner.accounts[0] || null;
      let disbursementTx = null;

      if (primaryAccount) {
        disbursementTx = new Transaction(
          nextIds.transaction,
          primaryAccount.id,
          'deposit',
          targetLoan.amountCents,
          null,
          new Date(),
          `Loan #${targetLoan.id} disbursement`
        );
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id !== owner.id) return u;

          const updatedLoans = u.loans.map((l) =>
            l.id === loanId ? approvedLoan : l
          );

          const updatedAccounts = primaryAccount
            ? u.accounts.map((acc) =>
                acc.id === primaryAccount.id
                  ? cloneAccount(acc, {
                      balanceCents: acc.balanceCents + targetLoan.amountCents,
                      transactions: [...acc.transactions, disbursementTx],
                    })
                  : acc
              )
            : u.accounts;

          return cloneUser(u, {
            accounts: updatedAccounts,
            loans: updatedLoans,
          });
        })
      );

      if (disbursementTx) {
        setNextIds((prev) => ({ ...prev, transaction: prev.transaction + 1 }));
      }
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handlePayLoan = (loanId) => {
    try {
      if (!currentUser || !selectedAccount) {
        throw new Error('Select an account to pay the loan from');
      }

      const targetLoan = currentUser.loans.find((l) => l.id === loanId);
      if (!targetLoan) throw new Error('Loan not found');
      if (targetLoan.status !== 'approved') {
        throw new Error('Only approved loans can be paid off');
      }
      if (selectedAccount.balanceCents < targetLoan.amountCents) {
        throw new Error(
          'Insufficient funds in selected account to pay off this loan'
        );
      }

      const paidLoan = new Loan(
        targetLoan.id,
        targetLoan.userId,
        targetLoan.amountCents,
        targetLoan.interestRate,
        'paid'
      );

      const payoffTx = new Transaction(
        nextIds.transaction,
        selectedAccount.id,
        'withdrawal',
        targetLoan.amountCents,
        null,
        new Date(),
        `Loan #${targetLoan.id} payoff`
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id !== currentUser.id) return u;

          const updatedAccounts = u.accounts.map((acc) =>
            acc.id === selectedAccount.id
              ? cloneAccount(acc, {
                  balanceCents: acc.balanceCents - targetLoan.amountCents,
                  transactions: [...acc.transactions, payoffTx],
                })
              : acc
          );

          const updatedLoans = u.loans.map((l) =>
            l.id === loanId ? paidLoan : l
          );

          return cloneUser(u, {
            accounts: updatedAccounts,
            loans: updatedLoans,
          });
        })
      );

      setNextIds((prev) => ({ ...prev, transaction: prev.transaction + 1 }));
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <main className="container">
      <AlertBanner
        message={errorMessage}
        onDismiss={() => setErrorMessage('')}
      />

      {!currentUser ? (
        <LoginView onLogin={handleLogin} />
      ) : (
        <DashboardView
          currentUser={currentUser}
          selectedAccount={selectedAccount}
          users={users}
          constants={CONSTANTS}
          onLogout={handleLogout}
          onSelectAccount={handleSelectAccount}
          onOpenAccount={handleOpenAccount}
          onCreateTransaction={handleCreateTransaction}
          onIssueCard={handleIssueCard}
          onToggleCard={handleToggleCardStatus}
          onRequestLoan={handleRequestLoan}
          onApproveLoan={handleApproveLoan}
          onPayLoan={handlePayLoan}
        />
      )}
    </main>
  );
}
