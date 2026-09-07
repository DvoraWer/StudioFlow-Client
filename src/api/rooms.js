import { request } from './http.js';

// spec §21 — Admin only.
export const listRooms = () => request('/api/rooms');
export const getRoom = (id) => request(`/api/rooms/${id}`);
export const createRoom = (body) => request('/api/rooms', { method: 'POST', body });
export const updateRoom = (id, body) => request(`/api/rooms/${id}`, { method: 'PUT', body });
export const deleteRoom = (id) => request(`/api/rooms/${id}`, { method: 'DELETE' });
