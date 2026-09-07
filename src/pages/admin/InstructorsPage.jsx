import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listInstructors, deleteInstructor } from '../../api/instructors.js';
import useResource from '../../hooks/useResource.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

export default function InstructorsPage() {
  const navigate = useNavigate();
  const { data, error, loading, reload } = useResource(
    useCallback(() => listInstructors(), []),
    []
  );

  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [delError, setDelError] = useState(null);

  async function confirmDelete() {
    setBusy(true);
    setDelError(null);
    try {
      await deleteInstructor(target.id);
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
      <PageHeader eyebrow="Admin" title="Instructors">
        {data && <span className="pager__info">{data.length} total</span>}
      </PageHeader>

      <div className="toolbar">
        <span className="toolbar__meta">Each instructor has a linked login account</span>
        <Button variant="primary" size="sm" onClick={() => navigate('/admin/instructors/new')}>
          New instructor
        </Button>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!error && loading && !data && <LoadingRows rows={3} />}

      {!error && data && data.length === 0 && (
        <EmptyState eyebrow="No instructors" title="No instructors yet" message="Add one to start scheduling classes.">
          <Link to="/admin/instructors/new" className="btn btn--primary btn--sm">
            New instructor
          </Link>
        </EmptyState>
      )}

      {!error && data && data.length > 0 && (
        <div className="ops ops--instructors">
          {data.map((i) => (
            <div key={i.id} className="ops__row">
              <div>
                <div className="ops__primary">{i.name}</div>
                <div className="ops__meta">
                  {i.specialization || 'No specialization'} · #{i.id}
                </div>
              </div>
              <div>
                <span className="ops__cell-label">Email</span>
                {i.email}
              </div>
              <div className="ops__actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/instructors/${i.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDelError(null);
                    setTarget(i);
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
        title={`Delete ${target?.name ?? 'instructor'}?`}
        body="This removes the instructor record. Instructors referenced by any class cannot be deleted."
        confirmLabel="Delete instructor"
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
