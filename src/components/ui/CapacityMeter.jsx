/**
 * Seat availability, control-room style: "registered / capacity", a segmented
 * bar, and a one-word state. Every number is derived only from the two values
 * the API supplies (capacity, registeredCount) — no synthetic progress.
 */
export default function CapacityMeter({ capacity, registeredCount, size }) {
  const cap = Math.max(0, Number(capacity) || 0);
  const filled = Math.min(Math.max(Number(registeredCount) || 0, 0), cap || Infinity);
  const available = Math.max(cap - filled, 0);

  const isFull = cap > 0 && filled >= cap;
  const nearly = !isFull && cap > 0 && available <= Math.max(1, Math.ceil(cap * 0.2));
  const state = isFull ? 'full' : nearly ? 'warn' : 'ok';
  const label = isFull ? 'Full' : nearly ? 'Filling' : 'Available';

  const segCount = Math.min(Math.max(cap, 1), 16);
  let segOn = cap > 0 ? Math.round((filled / cap) * segCount) : 0;
  if (filled > 0 && segOn === 0) segOn = 1;
  if (isFull) segOn = segCount;

  return (
    <div className={`meter meter--${state}${size === 'lg' ? ' meter--lg' : ''}`}>
      <div className="meter__top">
        <span className="meter__nums num">
          {filled}
          <small> / {cap}</small>
        </span>
        <span className="meter__label">{label}</span>
      </div>
      <div className="meter__bar" role="img" aria-label={`${available} of ${cap} seats available`}>
        {Array.from({ length: segCount }, (_, i) => (
          <span key={i} className={`meter__seg${i < segOn ? ' meter__seg--on' : ''}`} />
        ))}
      </div>
    </div>
  );
}
