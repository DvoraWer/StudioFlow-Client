import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyAccount } from '../../api/me.js';
import { changePassword } from '../../api/auth.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { roleHome } from '../../components/ProtectedRoute.jsx';
import useResource from '../../hooks/useResource.js';
import FormShell from '../../components/ui/FormShell.jsx';
import Field from '../../components/ui/Field.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

// Every role. Name / email are read-only (they are the login identity); the only
// change offered is the caller's own password. confirmPassword is checked here and
// never sent to the API.
export default function MyAccountPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const home = roleHome(role);

  const { data: account, error, loading } = useResource(useCallback(() => getMyAccount(), []), []);

  const [form, setForm] = useState(EMPTY);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (error) return <ErrorState error={error} />;
  if (loading && !account) return <LoadingRows rows={3} />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (form.newPassword !== form.confirmPassword) {
      setSubmitError({ code: 'VALIDATION_ERROR', message: 'The new passwords do not match.' });
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setSuccess('Your password has been changed.');
    } catch (err) {
      setSubmitError(err);
    } finally {
      // Never keep passwords in the form after a submission, successful or not.
      setForm(EMPTY);
      setSubmitting(false);
    }
  }

  return (
    <FormShell
      eyebrow="Account"
      title="My account"
      backTo={home}
      backLabel="Home"
      onSubmit={submit}
      submitLabel="Change password"
      submitting={submitting}
      onCancel={() => navigate(home)}
      error={submitError}
      success={success}
    >
      <div className="form__readonly">
        <span>Name</span>
        {account?.name}
      </div>
      <div className="form__readonly">
        <span>Account email</span>
        {account?.email}
      </div>
      <p className="form__note">Name and email are your login identity and cannot be changed here.</p>

      <h2 className="section__title">Change password</h2>
      <Field
        label="Current password"
        type="password"
        value={form.currentPassword}
        onChange={set('currentPassword')}
        required
        maxLength={100}
        autoComplete="current-password"
      />
      <Field
        label="New password"
        type="password"
        value={form.newPassword}
        onChange={set('newPassword')}
        required
        minLength={8}
        maxLength={100}
        autoComplete="new-password"
      />
      <Field
        label="Confirm new password"
        type="password"
        value={form.confirmPassword}
        onChange={set('confirmPassword')}
        required
        minLength={8}
        maxLength={100}
        autoComplete="new-password"
      />
    </FormShell>
  );
}
