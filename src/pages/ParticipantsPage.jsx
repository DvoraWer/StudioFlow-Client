import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getClass, getParticipants } from '../api/classes.js';
import useResource from '../hooks/useResource.js';
import BackLink from '../components/ui/BackLink.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import CapacityMeter from '../components/ui/CapacityMeter.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingRows from '../components/ui/LoadingRows.jsx';
import Guard from '../components/ui/Guard.jsx';
import { fmtDateTime } from '../lib/format.js';

// spec §21 — Admin (any class) or the instructor who owns the class. Ownership is
// enforced by the API; a 403 here means "not your class".
export default function ParticipantsPage() {
  const { id } = useParams();

  const fetcher = useCallback(
    () => Promise.all([getClass(id), getParticipants(id)]).then(([cls, participants]) => ({ cls, participants })),
    [id]
  );
  const { data, error, loading, reload } = useResource(fetcher, [id]);

  if (error?.status === 403) {
    return (
      <div>
        <BackLink to={`/classes/${id}`}>Class</BackLink>
        <Guard
          code="403"
          title="Not your class"
          message="You can only view the participants of classes you teach."
          to="/classes"
          action="Browse classes"
        />
      </div>
    );
  }
  if (error?.status === 404) {
    return (
      <div>
        <BackLink to="/classes">Classes</BackLink>
        <Guard code="404" title="Class not found" message="That class does not exist." to="/classes" action="Browse classes" />
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <BackLink to={`/classes/${id}`}>Class</BackLink>
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div>
      <BackLink to={`/classes/${id}`}>Class</BackLink>

      {loading && !data ? (
        <LoadingRows rows={4} />
      ) : (
        <>
          <PageHeader eyebrow="Roster" title={data.cls.name}>
            <CapacityMeter capacity={data.cls.capacity} registeredCount={data.cls.registeredCount} />
          </PageHeader>

          {data.participants.length === 0 ? (
            <EmptyState
              eyebrow="Empty roster"
              title="No participants yet"
              message="Nobody has an active registration for this class."
            />
          ) : (
            <div className="ops ops--roster">
              <div className="ops__row ops__row--head">
                <span className="ops__cell-label">Member</span>
                <span className="ops__cell-label">Email</span>
                <span className="ops__cell-label">Registered</span>
                <span className="ops__cell-label">Status</span>
              </div>
              {data.participants.map((p) => (
                <div className="ops__row" key={p.memberId}>
                  <div className="ops__primary">{p.name}</div>
                  <div>{p.email}</div>
                  <div className="ops__meta">{fmtDateTime(p.registeredAt)}</div>
                  <StatusBadge label={p.status} tone={p.status === 'Active' ? 'ok' : 'neutral'} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
