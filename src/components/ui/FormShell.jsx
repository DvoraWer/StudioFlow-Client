import BackLink from './BackLink.jsx';
import PageHeader from './PageHeader.jsx';
import Button from './Button.jsx';
import Notice from './Notice.jsx';

/**
 * Page scaffold shared by the create/edit forms (class, room, instructor):
 * back link, editorial header, the form body, a footer with submit + cancel, and
 * the server error / success notices in a consistent place.
 */
export default function FormShell({
  eyebrow,
  title,
  backTo,
  backLabel = 'Back',
  onSubmit,
  submitLabel,
  submitting = false,
  submitDisabled = false,
  onCancel,
  error,
  success,
  children
}) {
  return (
    <div className="formpage">
      <BackLink to={backTo}>{backLabel}</BackLink>
      <PageHeader eyebrow={eyebrow} title={title} />

      <form className="form" onSubmit={onSubmit}>
        {children}

        {error && (
          <Notice
            tone="error"
            code={error.code}
            message={error.message}
            correlationId={error.correlationId}
          />
        )}
        {success && <Notice tone="ok" code="Done" message={success} />}

        <div className="form__actions">
          <Button type="submit" variant="primary" loading={submitting} disabled={submitDisabled}>
            {submitting ? 'Saving…' : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="link" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
