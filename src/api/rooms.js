import { request } from './http.js';

// Admin or Instructor (room picker when an instructor creates their own class).
export const listRooms = () => request('/api/rooms');

// spec §21 — Admin only.
export const getRoom = (id) => request(`/api/rooms/${id}`);
export const createRoom = (body) => request('/api/rooms', { method: 'POST', body });
export const updateRoom = (id, body) => request(`/api/rooms/${id}`, { method: 'PUT', body });
export const deleteRoom = (id) => request(`/api/rooms/${id}`, { method: 'DELETE' });
