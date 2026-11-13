import { formatCurrency } from '../utils/formatCurrency.js';

/**
 * Displays the list of transactions for the currently selected account,
 * ordered from newest to oldest.
 */
export default function TransactionHistory({ accountId, transactions }) {
  const reversedTransactions = [...transactions].reverse();

  return (
    <section className="card">
      <h3>Transaction History (Account #{accountId})</h3>
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
          {reversedTransactions.length > 0 ? (
            reversedTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>#{tx.id}</td>
                <td>{tx.type}</td>
                <td>{formatCurrency(tx.amountCents)}</td>
                <td>{tx.targetAccountId ? `#${tx.targetAccountId}` : '-'}</td>
                <td>{tx.description || '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No transactions yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
