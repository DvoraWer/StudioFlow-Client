import { Link } from 'react-router-dom';
import useMyClasses from '../../hooks/useMyClasses.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatTile from '../../components/ui/StatTile.jsx';
import CapacityMeter from '../../components/ui/CapacityMeter.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { fmtDay, fmtTime } from '../../lib/format.js';

export default function InstructorOverviewPage() {
  const { data: mine, error, loading, reload } = useMyClasses();

  if (error) return <ErrorState error={error} onRetry={reload} />;

  const classes = mine ?? [];
  const now = Date.now();
  const active = classes.filter((c) => c.status === 'Active');
  const upcoming = active
    .filter((c) => new Date(c.startTime).getTime() >= now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const registered = active.reduce((s, c) => s + c.registeredCount, 0);
  const fullest = active.reduce(
    (best, c) =>
      c.capacity - c.registeredCount < (best ? best.capacity - best.registeredCount : Infinity) ? c : best,
    null
  );

  return (
    <div>
      <PageHeader eyebrow="Instructor" title="Your studio" />

      {loading && !mine ? (
        <LoadingRows rows={3} />
      ) : (
        <>
          <div className="tiles">
            <StatTile value={active.length} label="Active classes" />
            <StatTile value={registered} label="Registered members" />
            <StatTile
              value={fullest ? `${fullest.registeredCount}/${fullest.capacity}` : '—'}
              label="Fullest class"
              tone="accent"
              hint={fullest ? fullest.name : undefined}
            />
          </div>

          <div className="section">
            <div className="section__head">
              <h2 className="section__title">Your upcoming classes</h2>
              <Link to="/instructor/classes" className="section__link">
                All your classes →
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState
                eyebrow="Nothing ahead"
                title="No upcoming classes"
                message="Classes where you are the listed instructor will appear here."
              />
            ) : (
              upcoming.slice(0, 6).map((c) => (
                <div className="pressure-row" key={c.id}>
                  <div className="pressure-row__name">
                    <Link to={`/classes/${c.id}`}>{c.name}</Link>
                    <span className="pressure-row__when">
                      {' '}
                      · <Link to={`/classes/${c.id}/participants`}>roster</Link>
                    </span>
                  </div>
                  <span className="pressure-row__when">
                    {fmtDay(c.startTime)} · {fmtTime(c.startTime)} · {c.roomName}
                  </span>
                  <CapacityMeter capacity={c.capacity} registeredCount={c.registeredCount} />
                </div>
              ))
            )}
          </div>

          <p className="form__note">
            Shows classes where your name is the listed instructor. Class scheduling and content
            changes are made by an Admin.
          </p>
        </>
      )}
    </div>
  );
}
