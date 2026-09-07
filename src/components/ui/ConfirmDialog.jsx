import { useEffect, useRef } from 'react';
import Button from './Button.jsx';

/**
 * Accessible confirmation modal for destructive actions (cancel a class, delete a
 * room/instructor). Esc and backdrop dismiss; the confirm button takes focus.
 */
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  tone = 'danger',
  busy = false,
  error = null,
  onConfirm,
  onCancel
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    confirmRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="dialog__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 className="dialog__title" id="dialog-title">
          {title}
        </h2>
        {body && <p className="dialog__body">{body}</p>}
        {error && (
          <div className="notice notice--error dialog__error">
            <div className="notice__head">
              <span className="notice__code">{error.code}</span>
              <span className="notice__msg">{error.message}</span>
            </div>
          </div>
        )}
        <div className="dialog__actions">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
            Keep
          </Button>
          <Button ref={confirmRef} variant={tone} size="sm" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
