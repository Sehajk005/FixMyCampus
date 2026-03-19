import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { disconnectSocket } from '../services/socket';

const ROLE_CONFIG = {
  admin:      { label: 'Admin',   color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
  technician: { label: 'Staff',   color: '#67e8f9', bg: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.3)' },
  student:    { label: 'Student', color: '#93c5fd', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
};

const NAV_LINKS = {
  admin:      [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/tickets', label: 'All Tickets' }],
  technician: [{ to: '/staff', label: 'My Tasks' }, { to: '/staff/history', label: 'History' }],
  student:    [{ to: '/dashboard', label: 'Home' }, { to: '/tickets', label: 'My Tickets' }, { to: '/tickets/new', label: '+ Report' }, { to: '/profile', label: 'Profile' }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'student';
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.student;
  const links = NAV_LINKS[role] || [];

  function handleLogout() { disconnectSocket(); logout(); navigate('/login'); }

  return (
    <nav style={{ background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Link to={role === 'admin' ? '/admin' : role === 'technician' ? '/staff' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>🏫</div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>Fix My Campus</span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {links.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: active ? 600 : 500, color: active ? '#f1f5f9' : '#94a3b8', background: active ? 'rgba(99,102,241,0.15)' : 'transparent', border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', textDecoration: 'none', transition: 'all 0.2s' }}>
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: 99, border: `1px solid ${rc.border}`, background: rc.bg, color: rc.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{rc.label}</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
            <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 500, padding: '0.375rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
