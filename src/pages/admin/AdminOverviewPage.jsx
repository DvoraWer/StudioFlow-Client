import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listClasses } from '../../api/classes.js';
import { listRooms } from '../../api/rooms.js';
import { listInstructors } from '../../api/instructors.js';
import useResource from '../../hooks/useResource.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatTile from '../../components/ui/StatTile.jsx';
import CapacityMeter from '../../components/ui/CapacityMeter.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';
import { fmtDay, fmtTime } from '../../lib/format.js';

// Every figure here is derived from the three list endpoints — no fabricated data.
export default function AdminOverviewPage() {
  const fetcher = useCallback(
    () =>
      Promise.all([listClasses({ page: 1, pageSize: 100 }), listRooms(), listInstructors()]).then(
        ([classes, rooms, instructors]) => ({ classes: classes.items, rooms, instructors })
      ),
    []
  );
  const { data, error, loading, reload } = useResource(fetcher, []);

  if (error) return <ErrorState error={error} onRetry={reload} />;

  const classes = data?.classes ?? [];
  const now = Date.now();

  const active = classes.filter((c) => c.status === 'Active');
  const upcoming = active
    .filter((c) => new Date(c.startTime).getTime() >= now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const fullCount = active.filter((c) => c.registeredCount >= c.capacity).length;
  const seatsCap = active.reduce((s, c) => s + c.capacity, 0);
  const seatsUsed = active.reduce((s, c) => s + c.registeredCount, 0);
  const pressure = [...upcoming]
    .sort((a, b) => a.capacity - a.registeredCount - (b.capacity - b.registeredCount))
    .slice(0, 5);

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Control" />

      {loading && !data ? (
        <LoadingRows rows={4} />
      ) : (
        <>
          <div className="tiles">
            <StatTile value={active.length} label="Active classes" />
            <StatTile
              value={fullCount}
              label="Full classes"
              tone={fullCount > 0 ? 'alert' : undefined}
              hint={fullCount > 0 ? 'waitlists forming' : 'seats open'}
            />
            <StatTile
              value={`${seatsUsed}/${seatsCap}`}
              label="Seats taken"
              hint={`${seatsCap - seatsUsed} open`}
            />
            <StatTile value={data.rooms.length} label="Rooms" />
            <StatTile value={data.instructors.length} label="Instructors" tone="accent" />
          </div>

          <div className="section">
            <div className="section__head">
              <h2 className="section__title">Capacity pressure</h2>
              <Link to="/classes" className="section__link">
                All classes →
              </Link>
            </div>
            {pressure.length === 0 ? (
              <p className="muted" style={{ padding: '14px 4px' }}>
                No upcoming active classes.
              </p>
            ) : (
              pressure.map((c) => (
                <div className="pressure-row" key={c.id}>
                  <div className="pressure-row__name">
                    <Link to={`/classes/${c.id}`}>{c.name}</Link>
                  </div>
                  <span className="pressure-row__when">
                    {fmtDay(c.startTime)} · {fmtTime(c.startTime)}
                  </span>
                  <CapacityMeter capacity={c.capacity} registeredCount={c.registeredCount} />
                </div>
              ))
            )}
          </div>

          <div className="section">
            <div className="section__head">
              <h2 className="section__title">Up next</h2>
            </div>
            {upcoming.slice(0, 6).map((c) => (
              <div className="pressure-row" key={c.id}>
                <div className="pressure-row__name">
                  <Link to={`/classes/${c.id}`}>{c.name}</Link>
                </div>
                <span className="pressure-row__when">
                  {fmtDay(c.startTime)} · {fmtTime(c.startTime)}
                </span>
                <span className="pressure-row__when">
                  {c.instructorName} · {c.roomName}
                </span>
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className="muted" style={{ padding: '14px 4px' }}>
                Nothing scheduled ahead.
              </p>
            )}
          </div>

          <div className="quick-actions">
            <Link to="/admin/classes/new" className="btn btn--primary btn--sm">
              New class
            </Link>
            <Link to="/admin/rooms" className="btn btn--ghost btn--sm">
              Manage rooms
            </Link>
            <Link to="/admin/instructors" className="btn btn--ghost btn--sm">
              Manage instructors
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
