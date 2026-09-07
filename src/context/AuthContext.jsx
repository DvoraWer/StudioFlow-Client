import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY, setUnauthorizedHandler } from '../api/http.js';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

function loadStored() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // auth = AuthResponseDto: { token, userId, name, email, role } | null
  const [auth, setAuth] = useState(loadStored);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  // Any 401 from the API helper => log out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res));
    setAuth(res);
    return res;
  }, []);

  const register = useCallback(
    (name, email, password) => authApi.register(name, email, password),
    []
  );

  const value = useMemo(
    () => ({
      user: auth,
      role: auth?.role ?? null,
      isAuthenticated: Boolean(auth?.token),
      login,
      register,
      logout
    }),
    [auth, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
