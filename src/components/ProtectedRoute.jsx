import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Guard from './ui/Guard.jsx';

export function roleHome(role) {
  if (role === 'Admin') return '/admin';
  if (role === 'Instructor') return '/instructor';
  return '/classes';
}

/**
 * Client-side gate only — the API still enforces every rule (spec §20, §40).
 * Unauthenticated → /login (remembering where they were headed).
 * Wrong role → an intentional "not authorized" screen, never a blank page.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowed = roles ? (Array.isArray(roles) ? roles : [roles]) : null;
  if (allowed && !allowed.includes(role)) {
    return (
      <Guard
        code="403"
        title="Not your area"
        message={`This section is for ${allowed.join(' / ')}. You are signed in as ${role}.`}
        to={roleHome(role)}
        action="Back to your home"
      />
    );
  }

  return children;
}
