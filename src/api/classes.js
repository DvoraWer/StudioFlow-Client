import { request } from './http.js';

/** GET /api/classes — server-side paging + filtering (spec §22). Public. */
export function listClasses({ page = 1, pageSize = 10, search, status, date, instructorId, roomId } = {}) {
  const q = new URLSearchParams();
  q.set('page', String(page));
  q.set('pageSize', String(pageSize));
  if (search) q.set('search', search);
  if (status) q.set('status', status);
  if (date) q.set('date', date);
  if (instructorId) q.set('instructorId', String(instructorId));
  if (roomId) q.set('roomId', String(roomId));
  return request(`/api/classes?${q.toString()}`, { auth: false });
}

/** GET /api/classes/{id} — full detail incl. tags (spec §21). Public. */
export const getClass = (id) => request(`/api/classes/${id}`, { auth: false });

// --- Admin, or an Instructor for their own class (the API assigns ownership) --
export const createClass = (body) => request('/api/classes', { method: 'POST', body });

// --- Admin only (spec §21) --------------------------------------------------
export const updateClass = (id, body) => request(`/api/classes/${id}`, { method: 'PUT', body });
export const cancelClass = (id) => request(`/api/classes/${id}/cancel`, { method: 'POST' });

// --- Admin, or the instructor who owns the class (spec §21) ----------------
export const getParticipants = (id) => request(`/api/classes/${id}/participants`);
