import { Link } from 'react-router-dom';
import useMyClasses from '../../hooks/useMyClasses.js';
import PageHeader, { Stat } from '../../components/ui/PageHeader.jsx';
import CapacityMeter from '../../components/ui/CapacityMeter.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingRows from '../../components/ui/LoadingRows.jsx';
import { fmtDay, fmtTime } from '../../lib/format.js';

export default function InstructorClassesPage() {
  const { data: mine, error, loading, reload } = useMyClasses();

  if (error) return <ErrorState error={error} onRetry={reload} />;

  const classes = (mine ?? [])
    .slice()
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  return (
    <div>
      <PageHeader eyebrow="Instructor" title="My Classes">
        {mine && <Stat value={classes.length} label="Classes" />}
      </PageHeader>

      {loading && !mine && <LoadingRows rows={4} />}

      {mine && classes.length === 0 && (
        <EmptyState
          eyebrow="Nothing listed"
          title="No classes"
          message="You are not the listed instructor on any class yet. Create one from Classes → New class, or an Admin can assign you."
        />
      )}

      {mine && classes.length > 0 && (
        <div className="ops ops--roster">
          <div className="ops__row ops__row--head">
            <span className="ops__cell-label">Class</span>
            <span className="ops__cell-label">When · Room</span>
            <span className="ops__cell-label">Capacity</span>
            <span className="ops__cell-label">Roster</span>
          </div>
          {classes.map((c) => {
            const cancelled = c.status === 'Cancelled';
            return (
              <div className="ops__row" key={c.id}>
                <div>
                  <div className="ops__primary">
                    <Link to={`/classes/${c.id}`}>{c.name}</Link>
                  </div>
                  {cancelled && (
                    <div className="ops__meta">
                      <StatusBadge label="Cancelled" tone="bad" />
                    </div>
                  )}
                </div>
                <div className="ops__meta">
                  {fmtDay(c.startTime)} · {fmtTime(c.startTime)} · {c.roomName}
                </div>
                <CapacityMeter capacity={c.capacity} registeredCount={c.registeredCount} />
                <div className="ops__actions">
                  <Link to={`/classes/${c.id}/participants`} className="btn btn--ghost btn--sm">
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="form__note">
        Matched by your name as listed instructor. You can create your own classes; editing and cancelling are managed by Admins.
      </p>
    </div>
  );
}
