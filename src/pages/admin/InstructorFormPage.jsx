import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInstructor, createInstructor, updateInstructor } from '../../api/instructors.js';
import useResource from '../../hooks/useResource.js';
import FormShell from '../../components/ui/FormShell.jsx';
import Field from '../../components/ui/Field.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';

// Create provisions a User (Role = Instructor) + Instructor in one call.
// Edit only touches Specialization / Bio — the linked account is never changed
// (matches InstructorUpdateDto).
export default function InstructorFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = mode === 'edit';

  const { data, error, loading } = useResource(
    useCallback(() => (editing ? getInstructor(id) : Promise.resolve(null)), [editing, id]),
    [editing, id]
  );

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    bio: ''
  });
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        email: data.email,
        password: '',
        specialization: data.specialization ?? '',
        bio: data.bio ?? ''
      });
    }
  }, [data]);

  if (error) return <ErrorState error={error} />;
  if (editing && loading && !data) return <LoadingRows rows={3} />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editing) {
        await updateInstructor(id, {
          specialization: form.specialization.trim() || null,
          bio: form.bio.trim() || null
        });
      } else {
        await createInstructor({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          specialization: form.specialization.trim() || null,
          bio: form.bio.trim() || null
        });
      }
      navigate('/admin/instructors', { replace: true });
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormShell
      eyebrow="Admin · Instructors"
      title={editing ? 'Edit instructor' : 'New instructor'}
      backTo="/admin/instructors"
      backLabel="Instructors"
      onSubmit={submit}
      submitLabel={editing ? 'Save changes' : 'Create instructor'}
      submitting={submitting}
      onCancel={() => navigate('/admin/instructors')}
      error={submitError}
    >
      {editing ? (
        <>
          <div className="form__readonly">
            <span>Name</span>
            {form.name}
          </div>
          <div className="form__readonly">
            <span>Account email</span>
            {form.email}
          </div>
          <p className="form__note">
            The linked login account (name, email, password) is not editable here.
          </p>
        </>
      ) : (
        <>
          <Field label="Name" value={form.name} onChange={set('name')} required maxLength={200} autoComplete="off" />
          <Field
            label="Account email"
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="off"
          />
          <Field
            label="Temporary password"
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </>
      )}

      <Field
        label="Specialization"
        value={form.specialization}
        onChange={set('specialization')}
        maxLength={200}
        autoComplete="off"
      />
      <div className="field">
        <label className="field__label" htmlFor="i-bio">
          Bio
        </label>
        <textarea id="i-bio" value={form.bio} onChange={set('bio')} maxLength={2000} />
      </div>
    </FormShell>
  );
}
