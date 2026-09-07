// Asymmetric page header: large uppercase title on the left, aligned metadata
// on the right, a heavy rule underneath.
export default function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="page-head__title">{title}</h1>
      </div>
      {children && <div className="page-head__meta">{children}</div>}
    </header>
  );
}

export function Stat({ value, label }) {
  return (
    <div className="stat">
      <span className="stat__value num">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}
