import { request } from './http.js';

// spec §18, §21 — Member only. Joining the waiting list is always an explicit action.
export const join = (classId) =>
  request(`/api/classes/${classId}/waitlist`, { method: 'POST' });

export const leave = (classId) =>
  request(`/api/classes/${classId}/waitlist`, { method: 'DELETE' });
