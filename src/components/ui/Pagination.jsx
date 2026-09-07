import Button from './Button.jsx';

/**
 * Prev / info / Next control for server-paged lists. Caller owns the page state
 * and passes the numbers straight from the API's PagedResult.
 */
export default function Pagination({ page, totalPages, totalCount, disabled, onPrev, onNext }) {
  const last = totalPages || 1;
  return (
    <div className="pager">
      <Button variant="ghost" size="sm" disabled={disabled || page <= 1} onClick={onPrev}>
        ← Prev
      </Button>
      <span className="pager__info">
        Page {page} / {last}
        {typeof totalCount === 'number' ? ` · ${totalCount} total` : ''}
      </span>
      <Button variant="ghost" size="sm" disabled={disabled || page >= last} onClick={onNext}>
        Next →
      </Button>
    </div>
  );
}
