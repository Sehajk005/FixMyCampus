import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CATS = [
  { v: 'electrical', i: '⚡', label: 'Electrical', color: '#fbbf24' },
  { v: 'wifi',       i: '📶', label: 'Wi-Fi',      color: '#38bdf8' },
  { v: 'plumbing',   i: '🔧', label: 'Plumbing',   color: '#34d399' },
  { v: 'cleanliness',i: '🧹', label: 'Cleanliness',color: '#a78bfa' },
  { v: 'furniture',  i: '🪑', label: 'Furniture',  color: '#fb923c' },
  { v: 'ac_hvac',    i: '❄️', label: 'AC / HVAC',  color: '#67e8f9' },
  { v: 'security',   i: '🔒', label: 'Security',   color: '#f87171' },
  { v: 'other',      i: '📋', label: 'Other',      color: '#94a3b8' },
];

const STATUS_COLORS = { submitted:'#fbbf24', verified:'#60a5fa', assigned:'#a78bfa', in_progress:'#fb923c', resolved:'#34d399', closed:'#94a3b8' };

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets/mine').then(r => setTickets(r.data)).finally(() => setLoading(false));
  }, []);

  const open = tickets.filter(t => !['resolved','closed'].includes(t.status)).length;
  const resolved = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      {/* Welcome */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Report campus issues and track them in real-time.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Reported', value: tickets.length, color: '#818cf8', delay: 'delay-100' },
          { label: 'Active Issues', value: open, color: '#fb923c', delay: 'delay-200' },
          { label: 'Resolved', value: resolved, color: '#34d399', delay: 'delay-300' },
        ].map(s => (
          <div key={s.label} className={`stat-card animate-fade-up ${s.delay}`}>
            {loading ? (
              <div className="skeleton" style={{ height: 36, width: 60, marginBottom: 8 }} />
            ) : (
              <div className="animate-count" style={{ fontSize: '2.25rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            )}
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="animate-fade-up delay-300" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1rem', padding: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '0.3rem' }}>Spotted an issue?</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Report it now and our team will get on it.</p>
        </div>
        <Link to="/tickets/new" className="btn-primary animate-pulse-glow" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          + Report Issue
        </Link>
      </div>

      {/* Categories */}
      <div className="animate-fade-up delay-400">
        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Quick Report by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {CATS.map((c, i) => (
            <Link key={c.v} to={`/tickets/new?category=${c.v}`} className={`animate-fade-up delay-${(i+1)*100}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem 0.75rem', borderRadius: '0.875rem', background: 'rgba(15,22,41,0.8)', border: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.background = `rgba(${c.color === '#fbbf24' ? '251,191,36' : c.color === '#38bdf8' ? '56,189,248' : '99,102,241'},0.1)`; e.currentTarget.style.borderColor = c.color + '40'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,22,41,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ fontSize: '1.75rem' }}>{c.i}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>{c.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent tickets */}
      {tickets.length > 0 && (
        <div className="animate-fade-up delay-500" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recent Reports</h2>
            <Link to="/tickets" style={{ fontSize: '0.8rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {tickets.slice(0, 3).map((t, i) => (
              <Link key={t.id} to={`/tickets/${t.id}`} className={`animate-fade-up delay-${(i+1)*100}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.875rem', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(15,22,41,0.8)'; }}
              >
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '0.2rem' }}>{t.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {t.location}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[t.status] || '#94a3b8', display: 'inline-block', boxShadow: `0 0 8px ${STATUS_COLORS[t.status] || '#94a3b8'}` }} />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>{t.status?.replace('_',' ')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
