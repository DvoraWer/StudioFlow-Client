import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as registrations from '../api/registrations.js';
import PageHeader, { Stat } from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingRows from '../components/ui/LoadingRows.jsx';

const DAY_FMT = { weekday: 'short', month: 'short', day: '2-digit' };
const TIME_FMT = { hour: '2-digit', minute: '2-digit' };

// Screen 4 (spec §39): the member's own registrations, with cancel.
export default function MyRegistrationsPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRows(await registrations.myRegistrations());
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(classId) {
    setBusyId(classId);
    setError(null);
    try {
      await registrations.cancel(classId);
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = rows ? rows.filter((r) => r.status === 'Active').length : null;

  return (
    <div>
      <PageHeader eyebrow="Member" title="My Registrations">
        {rows && (
          <>
            <Stat value={activeCount} label="Active" />
            <Stat value={rows.length} label="Total" />
          </>
        )}
      </PageHeader>

      {error && <ErrorState error={error} onRetry={load} />}

      {!error && !rows && <LoadingRows rows={4} />}

      {!error && rows && rows.length === 0 && (
        <EmptyState
          eyebrow="Nothing booked"
          title="No registrations yet"
          message="Browse the schedule and reserve a seat — you can cancel any time."
        >
          <Link to="/classes" className="btn btn--primary btn--sm">
            Browse classes
          </Link>
        </EmptyState>
      )}

      {!error && rows && rows.length > 0 && (
        <div className="reglist">
          {rows.map((r) => {
            const start = new Date(r.startTime);
            const isActive = r.status === 'Active';
            return (
              <div
                key={r.id}
                className={`regrow ${isActive ? 'regrow--active' : 'regrow--cancelled'}`}
              >
                <div className="classrow__time">
                  <span className="classrow__day">
                    {start.toLocaleDateString(undefined, DAY_FMT)}
                  </span>
                  <span className="classrow__hour num">
                    {start.toLocaleTimeString(undefined, TIME_FMT)}
                  </span>
                </div>

                <div className="regrow__name">
                  <div className="classrow__name">
                    <Link to={`/classes/${r.classId}`}>{r.className}</Link>
                  </div>
                  <div className="classrow__sub">with {r.instructorName}</div>
                </div>

                <dl className="classrow__where">
                  <div>
                    <dt>Room</dt>
                    <dd>{r.roomName}</dd>
                  </div>
                </dl>

                <StatusBadge label={r.status} tone={isActive ? 'ok' : 'neutral'} />

                <div className="regrow__action">
                  {isActive && (
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busyId === r.classId}
                      onClick={() => cancel(r.classId)}
                    >
                      {busyId === r.classId ? 'Cancelling…' : 'Cancel'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
