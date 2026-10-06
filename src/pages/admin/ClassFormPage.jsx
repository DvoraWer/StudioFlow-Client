import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClass, createClass, updateClass } from '../../api/classes.js';
import { listInstructors } from '../../api/instructors.js';
import { listRooms } from '../../api/rooms.js';
import useResource from '../../hooks/useResource.js';
import { useAuth } from '../../context/AuthContext.jsx';
import FormShell from '../../components/ui/FormShell.jsx';
import Field from '../../components/ui/Field.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';
import { toLocalInput, fromLocalInput } from '../../lib/format.js';

const BLANK = {
  name: '',
  description: '',
  instructorId: '',
  roomId: '',
  start: '',
  end: '',
  capacity: ''
};

export default function ClassFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = mode === 'edit';
  // An Instructor can only create, and only for themselves: the API resolves the
  // instructor from the token, so no instructor is chosen or sent from here.
  const { role } = useAuth();
  const isInstructor = role === 'Instructor';
  const home = isInstructor ? '/instructor/classes' : '/admin';

  const fetcher = useCallback(
    () =>
      Promise.all([
        isInstructor ? Promise.resolve([]) : listInstructors(), // GET /api/instructors is Admin-only
        listRooms(),
        editing ? getClass(id) : Promise.resolve(null)
      ]).then(([instructors, rooms, cls]) => ({ instructors, rooms, cls })),
    [editing, id, isInstructor]
  );
  const { data, error, loading } = useResource(fetcher, [editing, id, isInstructor]);

  const [form, setForm] = useState(BLANK);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!data) return;
    if (data.cls) {
      setForm({
        name: data.cls.name,
        description: data.cls.description,
        instructorId: String(data.cls.instructorId),
        roomId: String(data.cls.roomId),
        start: toLocalInput(data.cls.startTime),
        end: toLocalInput(data.cls.endTime),
        capacity: String(data.cls.capacity)
      });
    } else {
      setForm((f) => ({
        ...f,
        instructorId: f.instructorId || String(data.instructors[0]?.id ?? ''),
        roomId: f.roomId || String(data.rooms[0]?.id ?? '')
      }));
    }
  }, [data]);

  if (error) return <ErrorState error={error} />;
  if (loading && !data) return <LoadingRows rows={4} />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const badRange = form.start && form.end && form.end <= form.start;

  async function submit(e) {
    e.preventDefault();
    if (badRange) return;
    setSubmitting(true);
    setSubmitError(null);

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      ...(isInstructor ? {} : { instructorId: Number(form.instructorId) }),
      roomId: Number(form.roomId),
      startTime: fromLocalInput(form.start),
      endTime: fromLocalInput(form.end),
      capacity: Number(form.capacity)
    };

    try {
      const saved = editing ? await updateClass(id, body) : await createClass(body);
      navigate(`/classes/${saved.id}`, { replace: true });
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const instructorOptions = data.instructors.map((i) => ({
    value: String(i.id),
    label: i.specialization ? `${i.name} — ${i.specialization}` : i.name
  }));
  const roomOptions = data.rooms.map((r) => ({
    value: String(r.id),
    label: `${r.name} (max ${r.maximumCapacity})${r.isActive ? '' : ' — inactive'}`
  }));

  return (
    <FormShell
      eyebrow={isInstructor ? 'Instructor · Classes' : 'Admin · Classes'}
      title={editing ? 'Edit class' : 'New class'}
      backTo={editing ? `/classes/${id}` : home}
      backLabel={editing ? 'Class' : isInstructor ? 'My Classes' : 'Overview'}
      onSubmit={submit}
      submitLabel={editing ? 'Save changes' : 'Create class'}
      submitting={submitting}
      submitDisabled={badRange}
      onCancel={() => navigate(editing ? `/classes/${id}` : home)}
      error={submitError}
    >
      <Field
        label="Name"
        value={form.name}
        onChange={set('name')}
        required
        maxLength={200}
        autoComplete="off"
      />

      <div className="field">
        <label className="field__label" htmlFor="c-desc">
          Description
        </label>
        <textarea
          id="c-desc"
          value={form.description}
          onChange={set('description')}
          required
          maxLength={2000}
        />
      </div>

      <div className="form__row">
        {!isInstructor && (
          <SelectField
            label="Instructor"
            value={form.instructorId}
            onChange={set('instructorId')}
            options={instructorOptions}
            required
          />
        )}
        <SelectField
          label="Room"
          value={form.roomId}
          onChange={set('roomId')}
          options={roomOptions}
          required
        />
      </div>

      <div className="form__row">
        <Field label="Starts" type="datetime-local" value={form.start} onChange={set('start')} required />
        <Field label="Ends" type="datetime-local" value={form.end} onChange={set('end')} required />
      </div>
      {badRange && <p className="form__hint">End time must be after the start time.</p>}

      <Field
        label="Capacity"
        type="number"
        min={1}
        step={1}
        value={form.capacity}
        onChange={set('capacity')}
        required
      />
      <p className="form__note">
        Room capacity, instructor / room clashes and other rules are checked by the server.
      </p>
    </FormShell>
  );
}
