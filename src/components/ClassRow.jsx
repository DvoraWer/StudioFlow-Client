import { Link } from 'react-router-dom';
import CapacityMeter from './ui/CapacityMeter.jsx';
import StatusBadge from './ui/StatusBadge.jsx';

const DAY_FMT = { weekday: 'short', month: 'short', day: '2-digit' };
const TIME_FMT = { hour: '2-digit', minute: '2-digit' };

// One class as a horizontal row-band. The whole band links to the detail page.
export default function ClassRow({ c }) {
  const start = new Date(c.startTime);
  const cancelled = c.status === 'Cancelled';
  const className = [
    'classrow',
    c.isFull && !cancelled && 'classrow--full',
    cancelled && 'classrow--cancelled'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Link to={`/classes/${c.id}`} className={className}>
      <div className="classrow__time">
        <span className="classrow__day">{start.toLocaleDateString(undefined, DAY_FMT)}</span>
        <span className="classrow__hour num">{start.toLocaleTimeString(undefined, TIME_FMT)}</span>
      </div>

      <div>
        <div className="classrow__name">{c.name}</div>
        <div className="classrow__sub">with {c.instructorName}</div>
      </div>

      <dl className="classrow__where">
        <div>
          <dt>Room</dt>
          <dd>{c.roomName}</dd>
        </div>
      </dl>

      <div className="classrow__end">
        {cancelled ? (
          <StatusBadge label="Cancelled" tone="bad" />
        ) : (
          <CapacityMeter capacity={c.capacity} registeredCount={c.registeredCount} />
        )}
      </div>
    </Link>
  );
}
