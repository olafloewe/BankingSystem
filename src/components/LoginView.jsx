import { useState } from 'react';

/**
 * Login screen component with controlled input state for customerId.
 * Communicates login submissions upward via the `onLogin` callback prop.
 */
export default function LoginView({ onLogin }) {
  const [customerId, setCustomerId] = useState('1001');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(customerId.trim());
  };

  return (
    <section className="card">
      <h2>Merito Bank Login</h2>
      <p className="hint">
        Demo Customer ID: <strong>1001</strong> (Alice - Customer)
        <br />
        Demo Employee ID: <strong>2001</strong> (Bob - Employee / Loan Approver)
      </p>
      <form id="login-form" onSubmit={handleSubmit}>
        <label htmlFor="customerId">Login ID</label>
        <input
          id="customerId"
          name="customerId"
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>
    </section>
  );
}
