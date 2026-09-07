// Bordered, uppercase, mono badge with a square glyph so state is never
// communicated by colour alone (a11y).
export default function StatusBadge({ label, tone = 'neutral' }) {
  return (
    <span className={`badge badge--${tone}`}>
      <span className="badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
