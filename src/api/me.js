import { request } from './http.js';

// The caller's own data — the API resolves the user from the JWT, never from an id here.
export const getMyAccount = () => request('/api/me/account');

// Instructor only. Update sends Specialization / Bio only (InstructorUpdateDto).
export const getMyInstructorProfile = () => request('/api/me/instructor-profile');
export const updateMyInstructorProfile = (body) =>
  request('/api/me/instructor-profile', { method: 'PUT', body });
