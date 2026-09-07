import { request } from './http.js';

// spec §21 — Admin only. Create provisions a User (Role = Instructor) + Instructor.
export const listInstructors = () => request('/api/instructors');
export const getInstructor = (id) => request(`/api/instructors/${id}`);
export const createInstructor = (body) => request('/api/instructors', { method: 'POST', body });
export const updateInstructor = (id, body) => request(`/api/instructors/${id}`, { method: 'PUT', body });
export const deleteInstructor = (id) => request(`/api/instructors/${id}`, { method: 'DELETE' });
