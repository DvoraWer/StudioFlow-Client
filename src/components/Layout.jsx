import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;

// Navigation is derived from the role's actual §21 capabilities — not just hidden.
const NAV_BY_ROLE = {
  Admin: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/classes', label: 'Classes' },
    { to: '/admin/rooms', label: 'Rooms' },
    { to: '/admin/instructors', label: 'Instructors' },
    { to: '/account', label: 'My Account' }
  ],
  Instructor: [
    { to: '/instructor', label: 'Overview', end: true },
    { to: '/classes', label: 'Classes' },
    { to: '/instructor/classes', label: 'My Classes' },
    { to: '/instructor/profile', label: 'My Instructor Profile' },
    { to: '/account', label: 'My Account' }
  ],
  Member: [
    { to: '/classes', label: 'Classes' },
    { to: '/me/registrations', label: 'My Registrations' },
    { to: '/account', label: 'My Account' }
  ]
};

export default function Layout({ children }) {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();

  const items = (isAuthenticated && NAV_BY_ROLE[role]) || [{ to: '/classes', label: 'Classes' }];

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/" className="brand" aria-label="StudioFlow home">
            <span className="brand__mark" aria-hidden="true" />
            StudioFlow
          </Link>

          <nav className="topbar__nav" aria-label="Primary">
            {items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end} className={navClass}>
                {it.label}
              </NavLink>
            ))}
          </nav>

          <span className="topbar__spacer" />

          {isAuthenticated ? (
            <div className="topbar__user">
              <span className="user-id">
                <span className="user-id__name">{user.name}</span>
                <span className="user-id__role">{role}</span>
              </span>
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="topbar__user">
              <NavLink to="/login" className={navClass}>
                Log in
              </NavLink>
            </div>
          )}
        </div>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}
