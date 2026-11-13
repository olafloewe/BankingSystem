/**
 * Header component displaying the authenticated user's profile summary
 * and a button to log out via the `onLogout` prop.
 */
export default function DashboardHeader({ currentUser, onLogout }) {
  return (
    <header className="dashboard-header">
      <div>
        <h2>Welcome, {currentUser.name}</h2>
        <small>
          ID: {currentUser.customerId} | Email: {currentUser.email} | Role:{' '}
          <strong>{currentUser.role.toUpperCase()}</strong>
        </small>
      </div>
      <button type="button" onClick={onLogout} className="btn-secondary">
        Log Out
      </button>
    </header>
  );
}
