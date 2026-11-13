import { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';

/**
 * Displays the user's loan records with an action to pay off approved loans,
 * and a controlled form for requesting a new loan.
 */
export default function LoansSection({ loans, onPayLoan, onRequestLoan }) {
  const [amount, setAmount] = useState('500');
  const [interestRate, setInterestRate] = useState('5.0');

  const handleSubmit = (event) => {
    event.preventDefault();
    const amountCents = Math.round(parseFloat(amount) * 100);
    const parsedRate = parseFloat(interestRate);

    onRequestLoan({
      amountCents,
      interestRate: parsedRate,
    });
  };

  return (
    <section className="card">
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
          {loans.length > 0 ? (
            loans.map((loan) => (
              <tr key={loan.id}>
                <td>#{loan.id}</td>
                <td>{formatCurrency(loan.amountCents)}</td>
                <td>{loan.interestRate}%</td>
                <td>
                  <span className={`badge badge-${loan.status}`}>
                    {loan.status}
                  </span>
                </td>
                <td>
                  {loan.status === 'approved' ? (
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => onPayLoan(loan.id)}
                    >
                      Pay Off
                    </button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No loans on record.</td>
            </tr>
          )}
        </tbody>
      </table>

      <form id="request-loan-form" className="mt-1" onSubmit={handleSubmit}>
        <label htmlFor="loan-amount">Request Loan Amount ($)</label>
        <input
          id="loan-amount"
          name="amount"
          type="number"
          step="0.01"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <label htmlFor="loan-rate">Interest Rate (%)</label>
        <input
          id="loan-rate"
          name="interestRate"
          type="number"
          step="0.1"
          min="0"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          required
        />
        <button type="submit">Apply for Loan</button>
      </form>
    </section>
  );
}
