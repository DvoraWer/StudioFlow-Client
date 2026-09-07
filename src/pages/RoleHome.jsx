import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { roleHome } from '../components/ProtectedRoute.jsx';

// "/" — send each role to its home surface (spec §13 role experiences).
export default function RoleHome() {
  const { isAuthenticated, role } = useAuth();
  return <Navigate to={isAuthenticated ? roleHome(role) : '/classes'} replace />;
}
