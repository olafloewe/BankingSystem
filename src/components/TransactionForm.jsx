import { useState } from 'react';

/**
 * Controlled form component for creating a deposit, withdrawal, or transfer
 * on the currently selected account. Dynamically shows the target account input
 * when the transaction type is 'transfer'.
 */
export default function TransactionForm({
  accountId,
  transactionTypes,
  onCreateTransaction,
}) {
  const [type, setType] = useState(transactionTypes[0] || 'deposit');
  const [amount, setAmount] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const amountCents = Math.round(parseFloat(amount) * 100);
    const parsedTarget =
      type === 'transfer' && targetAccountId !== ''
        ? Number(targetAccountId)
        : null;

    const success = onCreateTransaction({
      type,
      amountCents,
      targetAccountId: parsedTarget,
      description: description.trim(),
    });

    if (success) {
      setAmount('');
      setTargetAccountId('');
      setDescription('');
    }
  };

  return (
    <section className="card">
      <h3>New Transaction (Account #{accountId})</h3>
      <form id="transaction-form" onSubmit={handleSubmit}>
        <label htmlFor="tx-type">Type</label>
        <select
          id="tx-type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {transactionTypes.map((t) => (
            <option key={t} value={t}>
              {t.toUpperCase()}
            </option>
          ))}
        </select>

        <label htmlFor="tx-amount">Amount ($)</label>
        <input
          id="tx-amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        {type === 'transfer' && (
          <div id="target-account-group">
            <label htmlFor="tx-target">Target Account ID (e.g. 101 or 102)</label>
            <input
              id="tx-target"
              name="targetAccountId"
              type="number"
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              required
            />
          </div>
        )}

        <label htmlFor="tx-desc">Description</label>
        <input
          id="tx-desc"
          name="description"
          type="text"
          placeholder="Optional note"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">Submit Transaction</button>
      </form>
    </section>
  );
}
