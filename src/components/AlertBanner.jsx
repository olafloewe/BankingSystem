/**
 * Displays validation or business logic error messages at the top of the app.
 */
export default function AlertBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div id="alert-banner" className="alert-error" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="btn-small btn-secondary" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}
