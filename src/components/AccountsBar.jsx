import { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';

/**
 * Renders the user's bank account tabs for switching active accounts
 * alongside an inline form to open a new checking or savings account.
 */
export default function AccountsBar({
  accounts,
  selectedAccountId,
  accountTypes,
  onSelectAccount,
  onOpenAccount,
}) {
  const [selectedType, setSelectedType] = useState(accountTypes[0] || 'checking');

  const handleSubmit = (event) => {
    event.preventDefault();
    onOpenAccount(selectedType);
  };

  return (
    <section className="accounts-bar">
      {accounts.map((acc) => (
        <button
          key={acc.id}
          type="button"
          className={`account-tab ${acc.id === selectedAccountId ? 'active' : ''}`}
          onClick={() => onSelectAccount(acc.id)}
        >
          <strong>
            #{acc.id} ({acc.type.toUpperCase()})
          </strong>
          <span>{formatCurrency(acc.balanceCents)}</span>
        </button>
      ))}

      <form id="open-account-form" className="inline-form" onSubmit={handleSubmit}>
        <select
          name="type"
          aria-label="Account Type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {accountTypes.map((type) => (
            <option key={type} value={type}>
              {type.toUpperCase()}
            </option>
          ))}
        </select>
        <button type="submit">+ Open Account</button>
      </form>
    </section>
  );
}
