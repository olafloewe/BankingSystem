import { useState } from 'react';

/**
 * Displays all cards issued to the current user with controls to block/unblock them,
 * plus a controlled form to issue a new 16-digit card linked to the selected account.
 */
export default function CardsSection({
  cards,
  selectedAccountId,
  onToggleCard,
  onIssueCard,
}) {
  const [cardNumber, setCardNumber] = useState('4000999988887777');

  const handleSubmit = (event) => {
    event.preventDefault();
    onIssueCard(cardNumber.trim());
  };

  return (
    <section className="card">
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
          {cards.length > 0 ? (
            cards.map((card) => (
              <tr key={card.id}>
                <td>#{card.id}</td>
                <td>
                  <code>{card.cardNumber}</code>
                </td>
                <td>#{card.accountId}</td>
                <td>
                  <span className={`badge badge-${card.status}`}>
                    {card.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => onToggleCard(card.id)}
                  >
                    {card.status === 'active' ? 'Block' : 'Unblock'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No cards issued.</td>
            </tr>
          )}
        </tbody>
      </table>

      <form id="issue-card-form" className="mt-1" onSubmit={handleSubmit}>
        <label htmlFor="card-num">
          Issue New Card for Account #{selectedAccountId} (16 digits)
        </label>
        <input
          id="card-num"
          name="cardNumber"
          type="text"
          pattern="\d{16}"
          maxLength={16}
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          required
        />
        <button type="submit">Issue Card</button>
      </form>
    </section>
  );
}
