import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listClasses } from '../api/classes.js';
import PageHeader, { Stat } from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import ClassRow from '../components/ClassRow.jsx';
import LoadingRows from '../components/ui/LoadingRows.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import RoleGate from '../components/ui/RoleGate.jsx';

const PAGE_SIZE = 10;
const EMPTY = { search: '', status: '', date: '' };

// Screen 2 (spec §39, §22): list + search + filters + SERVER-side pagination.
export default function ClassesPage() {
  const [draft, setDraft] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listClasses({ page, pageSize: PAGE_SIZE, ...applied }));
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilters(e) {
    e.preventDefault();
    setPage(1);
    setApplied(draft);
  }

  function clearFilters() {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPage(1);
  }

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <PageHeader eyebrow="Studio schedule" title="Classes">
        {data && (
          <>
            <Stat value={data.totalCount} label="Classes" />
            <Stat value={`${data.page}/${totalPages}`} label="Page" />
          </>
        )}
      </PageHeader>

      <RoleGate allow={['Admin', 'Instructor']}>
        <div className="toolbar">
          <span className="toolbar__meta">Scheduling</span>
          <Link to="/admin/classes/new" className="btn btn--primary btn--sm">
            New class
          </Link>
        </div>
      </RoleGate>

      <form className="filters" onSubmit={applyFilters}>
        <div className="filters__field filters__field--grow">
          <label className="field-label" htmlFor="flt-search">
            Search
          </label>
          <input
            id="flt-search"
            type="text"
            placeholder="Class name or description"
            value={draft.search}
            onChange={set('search')}
          />
        </div>
        <div className="filters__field">
          <label className="field-label" htmlFor="flt-status">
            Status
          </label>
          <select id="flt-status" value={draft.status} onChange={set('status')}>
            <option value="">Any</option>
            <option value="Active">Active</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filters__field">
          <label className="field-label" htmlFor="flt-date">
            Date
          </label>
          <input
            id="flt-date"
            type="date"
            value={draft.date}
            onChange={set('date')}
            title="Classes starting on this day"
          />
        </div>
        <div className="filters__actions">
          <Button type="submit" variant="primary" size="sm">
            Apply
          </Button>
          <Button type="button" variant="link" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </form>

      {error && <ErrorState error={error} onRetry={load} />}

      {!error && loading && !data && <LoadingRows rows={6} />}

      {!error && data && (
        <>
          {data.items.length === 0 ? (
            <EmptyState
              title="No classes match"
              message="Try a different search term, clear the filters, or pick another date."
            >
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </EmptyState>
          ) : (
            <div className={`classlist${loading ? ' is-busy' : ''}`}>
              {data.items.map((c) => (
                <ClassRow key={c.id} c={c} />
              ))}
            </div>
          )}

          <Pagination
            page={data.page}
            totalPages={totalPages}
            totalCount={data.totalCount}
            disabled={loading}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      )}
    </div>
  );
}
