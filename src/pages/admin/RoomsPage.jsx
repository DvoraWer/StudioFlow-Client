import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listRooms, deleteRoom } from '../../api/rooms.js';
import useResource from '../../hooks/useResource.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

export default function RoomsPage() {
  const navigate = useNavigate();
  const { data, error, loading, reload } = useResource(useCallback(() => listRooms(), []), []);

  const [target, setTarget] = useState(null); // room being deleted
  const [busy, setBusy] = useState(false);
  const [delError, setDelError] = useState(null);

  async function confirmDelete() {
    setBusy(true);
    setDelError(null);
    try {
      await deleteRoom(target.id);
      setTarget(null);
      reload();
    } catch (err) {
      setDelError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Rooms">
        {data && <span className="pager__info">{data.length} total</span>}
      </PageHeader>

      <div className="toolbar">
        <span className="toolbar__meta">Studio spaces · capacity limits</span>
        <Button variant="primary" size="sm" onClick={() => navigate('/admin/rooms/new')}>
          New room
        </Button>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!error && loading && !data && <LoadingRows rows={3} />}

      {!error && data && data.length === 0 && (
        <EmptyState
          eyebrow="No rooms"
          title="No rooms yet"
          message="Add a room before scheduling classes."
        >
          <Link to="/admin/rooms/new" className="btn btn--primary btn--sm">
            New room
          </Link>
        </EmptyState>
      )}

      {!error && data && data.length > 0 && (
        <div className="ops ops--rooms">
          {data.map((r) => (
            <div key={r.id} className={`ops__row${r.isActive ? '' : ' ops__row--muted'}`}>
              <div>
                <div className="ops__primary">{r.name}</div>
                <div className="ops__meta">Room #{r.id}</div>
              </div>
              <div>
                <span className="ops__cell-label">Max capacity</span>
                <span className="num">{r.maximumCapacity}</span>
              </div>
              <StatusBadge
                label={r.isActive ? 'Active' : 'Inactive'}
                tone={r.isActive ? 'ok' : 'neutral'}
              />
              <div className="ops__actions">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/rooms/${r.id}/edit`)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDelError(null);
                    setTarget(r);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title={`Delete ${target?.name ?? 'room'}?`}
        body="This cannot be undone. Rooms referenced by any class cannot be deleted — deactivate instead."
        confirmLabel="Delete room"
        busy={busy}
        error={delError}
        onConfirm={confirmDelete}
        onCancel={() => {
          setTarget(null);
          setDelError(null);
        }}
      />
    </div>
  );
}
