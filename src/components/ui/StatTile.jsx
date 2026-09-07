// Control-room number tile for the role dashboards. `hint` is an optional small
// mono line under the number.
export default function StatTile({ value, label, hint, tone }) {
  return (
    <div className={`stat-tile${tone ? ` stat-tile--${tone}` : ''}`}>
      <span className="stat-tile__value num">{value}</span>
      <span className="stat-tile__label">{label}</span>
      {hint && <span className="stat-tile__hint">{hint}</span>}
    </div>
  );
}
