import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInstructorProfile, updateMyInstructorProfile } from '../../api/me.js';
import useResource from '../../hooks/useResource.js';
import FormShell from '../../components/ui/FormShell.jsx';
import Field from '../../components/ui/Field.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';

// The instructor's own profile. Only Specialization / Bio are editable and sent
// (InstructorUpdateDto); the API resolves which profile from the JWT. Password
// changes live on My Account.
export default function InstructorProfilePage() {
  const navigate = useNavigate();

  const { data, error, loading, setData } = useResource(
    useCallback(() => getMyInstructorProfile(), []),
    []
  );

  const [form, setForm] = useState({ specialization: '', bio: '' });
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) setForm({ specialization: data.specialization ?? '', bio: data.bio ?? '' });
  }, [data]);

  if (error) return <ErrorState error={error} />;
  if (loading && !data) return <LoadingRows rows={3} />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSuccess(null);
    try {
      const updated = await updateMyInstructorProfile({
        specialization: form.specialization.trim() || null,
        bio: form.bio.trim() || null
      });
      setData(updated);
      setSuccess('Your profile has been saved.');
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormShell
      eyebrow="Instructor"
      title="My instructor profile"
      backTo="/instructor"
      backLabel="Overview"
      onSubmit={submit}
      submitLabel="Save profile"
      submitting={submitting}
      onCancel={() => navigate('/instructor')}
      error={submitError}
      success={success}
    >
      <div className="form__readonly">
        <span>Name</span>
        {data?.name}
      </div>
      <div className="form__readonly">
        <span>Account email</span>
        {data?.email}
      </div>
      <p className="form__note">Name and email are managed by an Admin. Change your password on My Account.</p>

      <Field
        label="Specialization"
        value={form.specialization}
        onChange={set('specialization')}
        maxLength={200}
        autoComplete="off"
      />
      <div className="field">
        <label className="field__label" htmlFor="p-bio">
          Bio
        </label>
        <textarea id="p-bio" value={form.bio} onChange={set('bio')} maxLength={2000} />
      </div>
    </FormShell>
  );
}
