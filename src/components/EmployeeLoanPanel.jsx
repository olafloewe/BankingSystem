import { formatCurrency } from '../utils/formatCurrency.js';

/**
 * Role-based Employee Portal displaying all customer loan applications across users.
 * Allows employees/admins to approve and disburse pending loans via `onApproveLoan`.
 */
export default function EmployeeLoanPanel({ users, onApproveLoan }) {
  const allLoans = users.flatMap((user) =>
    user.loans.map((loan) => ({ user, loan }))
  );

  return (
    <section className="card">
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
          {allLoans.length > 0 ? (
            allLoans.map(({ user, loan }) => (
              <tr key={loan.id}>
                <td>#{loan.id}</td>
                <td>
                  {user.name} ({user.customerId})
                </td>
                <td>{formatCurrency(loan.amountCents)}</td>
                <td>{loan.interestRate}%</td>
                <td>
                  <span className={`badge badge-${loan.status}`}>
                    {loan.status}
                  </span>
                </td>
                <td>
                  {loan.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => onApproveLoan(loan.id)}
                    >
                      Approve &amp; Disburse
                    </button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No loan applications found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
