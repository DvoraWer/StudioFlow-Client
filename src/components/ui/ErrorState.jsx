import Button from './Button.jsx';

// Full-block load failure. Shows the API error code + message + correlation id.
export default function ErrorState({ error, onRetry }) {
  const code = error?.code || 'ERROR';
  const message = error?.message || 'Something failed to load.';

  return (
    <div className="state state--error" role="alert">
      <div className="state__eyebrow">Request failed · {code}</div>
      <p className="state__msg">{message}</p>
      {error?.correlationId && <p className="notice__ref">ref {error.correlationId}</p>}
      {onRetry && (
        <div className="state__actions">
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
