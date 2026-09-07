// Inline feedback after an action (success or error). Uses the API error shape.
export default function Notice({ tone = 'ok', code, message, correlationId }) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <div className="notice__head">
        {code && <span className="notice__code">{code}</span>}
        <span className="notice__msg">{message}</span>
      </div>
      {correlationId && <span className="notice__ref">ref {correlationId}</span>}
    </div>
  );
}
