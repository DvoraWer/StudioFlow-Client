import { request } from './http.js';

// spec §19 — public endpoints, no bearer token
export const login = (email, password) =>
  request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false });

export const register = (name, email, password) =>
  request('/api/auth/register', { method: 'POST', body: { name, email, password }, auth: false });
