// Restrained skeleton for list screens — hairline rows with a shimmering bar.
export default function LoadingRows({ rows = 5 }) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton__row" key={i}>
          <span className="skeleton__bar" />
          <span className="skeleton__bar" />
        </div>
      ))}
    </div>
  );
}
