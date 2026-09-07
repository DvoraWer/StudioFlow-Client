import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Renders children only when the current role is allowed. Purely presentational —
 * the API still enforces authorization (spec §20, §40).
 */
export default function RoleGate({ allow, children, fallback = null }) {
  const { role } = useAuth();
  const roles = Array.isArray(allow) ? allow : [allow];
  return roles.includes(role) ? children : fallback;
}
