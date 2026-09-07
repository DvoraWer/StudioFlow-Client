import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoom, createRoom, updateRoom } from '../../api/rooms.js';
import useResource from '../../hooks/useResource.js';
import FormShell from '../../components/ui/FormShell.jsx';
import Field from '../../components/ui/Field.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';

export default function RoomFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = mode === 'edit';

  const { data, error, loading } = useResource(
    useCallback(() => (editing ? getRoom(id) : Promise.resolve(null)), [editing, id]),
    [editing, id]
  );

  const [form, setForm] = useState({ name: '', maximumCapacity: '', isActive: true });
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        maximumCapacity: String(data.maximumCapacity),
        isActive: data.isActive
      });
    }
  }, [data]);

  if (error) return <ErrorState error={error} />;
  if (editing && loading && !data) return <LoadingRows rows={3} />;

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const body = {
      name: form.name.trim(),
      maximumCapacity: Number(form.maximumCapacity),
      isActive: form.isActive
    };
    try {
      if (editing) await updateRoom(id, body);
      else await createRoom(body);
      navigate('/admin/rooms', { replace: true });
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormShell
      eyebrow="Admin · Rooms"
      title={editing ? 'Edit room' : 'New room'}
      backTo="/admin/rooms"
      backLabel="Rooms"
      onSubmit={submit}
      submitLabel={editing ? 'Save changes' : 'Create room'}
      submitting={submitting}
      onCancel={() => navigate('/admin/rooms')}
      error={submitError}
    >
      <Field
        label="Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
        maxLength={200}
        autoComplete="off"
      />
      <Field
        label="Maximum capacity"
        type="number"
        min={1}
        step={1}
        value={form.maximumCapacity}
        onChange={(e) => setForm((f) => ({ ...f, maximumCapacity: e.target.value }))}
        required
      />
      <div className="form__check">
        <input
          id="room-active"
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
        />
        <label htmlFor="room-active">Room is active (available for scheduling)</label>
      </div>
    </FormShell>
  );
}
