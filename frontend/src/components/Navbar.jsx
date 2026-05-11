import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const THEME_KEY = 'fmc-theme';

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { to: '/feed', label: 'Campus Feed' },
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/tickets', label: 'Tickets' },
        { to: '/admin/users', label: 'Users' },
        { to: '/feed', label: 'Campus Feed' },
      ];
    }

    if (user?.role === 'technician') {
      return [
        { to: '/staff', label: 'Assigned Tasks' },
        { to: '/staff/history', label: 'History' },
        { to: '/feed', label: 'Campus Feed' },
      ];
    }

    return [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/tickets', label: 'My Tickets' },
      { to: '/tickets/new', label: 'New Ticket' },
      { to: '/feed', label: 'Campus Feed' },
    ];
  }, [isAuthenticated, user?.role]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const roleLabel = user?.role ? user.role.replace('_', ' ') : 'guest';

  return (
    <header className="top-nav-wrap">
      <nav className="top-nav">
        <Link to={isAuthenticated ? '/' : '/feed'} className="brand-mark">
          <span className="brand-dot" />
          <span>FixMyCampus</span>
        </Link>

        <button
          type="button"
          className={`menu-toggle ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`top-nav-links ${mobileOpen ? 'open' : ''}`}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `top-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            className="theme-switch"
            onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
            title="Toggle light and dark mode"
            aria-label="Toggle light and dark mode"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {isAuthenticated && (
            <>
              <NotificationBell />
              <Link to="/profile" className="role-chip">
                {roleLabel}
              </Link>
              <button type="button" className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
