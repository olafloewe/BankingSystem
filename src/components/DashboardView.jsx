import DashboardHeader from './DashboardHeader.jsx';
import EmployeeLoanPanel from './EmployeeLoanPanel.jsx';
import AccountsBar from './AccountsBar.jsx';
import TransactionForm from './TransactionForm.jsx';
import TransactionHistory from './TransactionHistory.jsx';
import CardsSection from './CardsSection.jsx';
import LoansSection from './LoansSection.jsx';

/**
 * Container component for the authenticated dashboard view.
 * Composes header, employee portal, account selector bar, and the 4-card grid,
 * passing state and event callbacks down via props.
 */
export default function DashboardView({
  currentUser,
  selectedAccount,
  users,
  constants,
  onLogout,
  onSelectAccount,
  onOpenAccount,
  onCreateTransaction,
  onIssueCard,
  onToggleCard,
  onRequestLoan,
  onApproveLoan,
  onPayLoan,
}) {
  const isStaff =
    currentUser.role === 'employee' || currentUser.role === 'admin';

  return (
    <>
      <DashboardHeader currentUser={currentUser} onLogout={onLogout} />

      {isStaff && (
        <EmployeeLoanPanel users={users} onApproveLoan={onApproveLoan} />
      )}

      <AccountsBar
        accounts={currentUser.accounts}
        selectedAccountId={selectedAccount?.id ?? null}
        accountTypes={constants.ACCOUNT_TYPES}
        onSelectAccount={onSelectAccount}
        onOpenAccount={onOpenAccount}
      />

      {selectedAccount ? (
        <div className="dashboard-grid">
          <TransactionForm
            accountId={selectedAccount.id}
            transactionTypes={constants.TRANSACTION_TYPES}
            onCreateTransaction={onCreateTransaction}
          />

          <TransactionHistory
            accountId={selectedAccount.id}
            transactions={selectedAccount.transactions}
          />

          <CardsSection
            cards={currentUser.cards}
            selectedAccountId={selectedAccount.id}
            onToggleCard={onToggleCard}
            onIssueCard={onIssueCard}
          />

          <LoansSection
            loans={currentUser.loans}
            onPayLoan={onPayLoan}
            onRequestLoan={onRequestLoan}
          />
        </div>
      ) : (
        <p className="card">
          Open an account above to start managing transactions, cards, and
          loans.
        </p>
      )}
    </>
  );
}
