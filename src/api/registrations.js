import { request } from './http.js';

// spec §21 — Member only. The member id comes from the JWT on the server.
export const register = (classId) =>
  request(`/api/classes/${classId}/register`, { method: 'POST' });

export const cancel = (classId) =>
  request(`/api/classes/${classId}/register`, { method: 'DELETE' });

export const myRegistrations = () => request('/api/me/registrations');
