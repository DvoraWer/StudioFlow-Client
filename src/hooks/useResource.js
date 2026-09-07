import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small load / loading / error / reload helper for read screens — keeps the new
 * pages consistent without a state library. Pass a `deps` array; the fetch reruns
 * when it changes, and `reload()` forces a refetch. Stale responses are ignored.
 */
export default function useResource(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // fetcher is intentionally not a dep — callers pass identity via `deps`.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(() => fetcherRef.current())
      .then((d) => {
        if (current && mounted.current) setData(d);
      })
      .catch((err) => {
        if (current && mounted.current) {
          setError(err);
          setData(null);
        }
      })
      .finally(() => {
        if (current && mounted.current) setLoading(false);
      });
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, error, loading, reload, setData };
}
