import { useCallback } from 'react';
import { listClasses } from '../api/classes.js';
import { useAuth } from '../context/AuthContext.jsx';
import useResource from './useResource.js';

/**
 * The current instructor's classes.
 *
 * Backend limitation: the JWT carries only userId + role, and GET /api/instructors*
 * is Admin-only, so an instructor has no way to obtain their own instructorId and
 * cannot use the server-side `?instructorId=` filter. We therefore read the public
 * class list and match on instructorName. This is a display convenience, not a
 * security boundary — every write/participant call is still authorized by the API.
 */
export default function useMyClasses() {
  const { user } = useAuth();
  const fetcher = useCallback(
    () =>
      listClasses({ page: 1, pageSize: 100 }).then((res) =>
        res.items.filter((c) => c.instructorName === user?.name)
      ),
    [user?.name]
  );
  return useResource(fetcher, [user?.name]);
}
