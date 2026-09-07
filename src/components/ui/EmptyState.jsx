export default function EmptyState({ eyebrow = 'No results', title, message, children }) {
  return (
    <div className="state">
      <div className="state__eyebrow">{eyebrow}</div>
      {title && <h2 className="state__title">{title}</h2>}
      {message && <p className="state__msg">{message}</p>}
      {children}
    </div>
  );
}
