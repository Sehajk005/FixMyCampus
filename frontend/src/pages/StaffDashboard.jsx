import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const PRIORITY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'CRITICAL' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'HIGH' },
  medium:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', label: 'MEDIUM' },
  low:      { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'LOW' },
};

const STATUS_NEXT = {
  submitted:   'in_progress',
  assigned:    'in_progress',
  in_progress: 'resolved',
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    api.get('/tickets/assigned-to-me').then(r => setTickets(r.data)).catch(() => setTickets([])).finally(() => setLoading(false));
  }, []);

  async function advanceStatus(ticket) {
    const next = STATUS_NEXT[ticket.status];
    if (!next) return;
    setUpdating(ticket.id);
    try {
      const res = await api.patch(`/tickets/${ticket.id}`, { status: next });
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, ...res.data } : t));
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.error || err.message));
    } finally { setUpdating(null); }
  }

  const active = tickets.filter(t => !['resolved','closed'].includes(t.status));
  const done   = tickets.filter(t => ['resolved','closed'].includes(t.status));
  const displayed = filter === 'active' ? active : done;
  const criticalCount = active.filter(t => t.priority === 'critical').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#67e8f9', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Staff Portal</p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              My Assigned Tasks
            </h1>
            <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              {user?.name} · {user?.department || 'Facilities'}
            </p>
          </div>
          {criticalCount > 0 && (
            <div className="animate-pulse-glow" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🚨</span>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fca5a5' }}>{criticalCount} CRITICAL</p>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Needs immediate attention</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Assigned', value: tickets.length, color: '#818cf8', delay: 'delay-100' },
          { label: 'In Progress',    value: active.filter(t => t.status === 'in_progress').length, color: '#fb923c', delay: 'delay-200' },
          { label: 'Pending Start',  value: active.filter(t => t.status === 'assigned').length, color: '#fbbf24', delay: 'delay-300' },
          { label: 'Completed',      value: done.length, color: '#34d399', delay: 'delay-400' },
        ].map(s => (
          <div key={s.label} className={`stat-card animate-fade-up ${s.delay}`}>
            <div className="animate-count" style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{loading ? '—' : s.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="animate-fade-up delay-400" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[['active', `Active (${active.length})`], ['done', `Completed (${done.length})`]].map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.625rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: filter === v ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)', background: filter === v ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: filter === v ? '#818cf8' : '#64748b' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Ticket cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: '1rem' }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {filter === 'active' ? '🎉' : '📭'}
          </div>
          <p style={{ fontWeight: 600, color: '#94a3b8' }}>
            {filter === 'active' ? 'No active tasks — great work!' : 'No completed tasks yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {displayed.map((t, i) => {
            const pc = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.low;
            const canAdvance = !!STATUS_NEXT[t.status];
            const nextLabel = t.status === 'assigned' ? 'Start Work' : t.status === 'in_progress' ? 'Mark Resolved ✓' : null;
            return (
              <div key={t.id} className={`animate-fade-up delay-${Math.min(i*100+100, 800)}`}
                style={{ background: 'rgba(15,22,41,0.9)', border: `1px solid rgba(255,255,255,0.07)`, borderLeft: `3px solid ${pc.color}`, borderRadius: '1rem', padding: '1.25rem 1.5rem', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderTopColor = pc.color+'40'; e.currentTarget.style.borderRightColor = pc.color+'40'; e.currentTarget.style.borderBottomColor = pc.color+'40'; e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 0 30px ${pc.color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.borderTopColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderRightColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 99, background: pc.bg, color: pc.color, letterSpacing: '0.06em' }}>{pc.label}</span>
                      <StatusBadge status={t.status} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{t.category?.replace('_',' ')}</span>
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.35rem' }}>{t.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      📍 {t.location}
                      {t.submitter && <> · 👤 {t.submitter.name}</>}
                      <> · {new Date(t.createdAt).toLocaleDateString()}</>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexShrink: 0 }}>
                    <Link to={`/tickets/${t.id}`} style={{ padding: '0.5rem 1rem', borderRadius: '0.625rem', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textDecoration: 'none', transition: 'all 0.2s' }}>
                      💬 Chat
                    </Link>
                    {canAdvance && (
                      <button onClick={() => advanceStatus(t)} disabled={updating === t.id}
                        style={{ padding: '0.5rem 1.125rem', borderRadius: '0.625rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: t.status === 'in_progress' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: t.status === 'in_progress' ? '0 0 20px rgba(16,185,129,0.3)' : '0 0 20px rgba(99,102,241,0.3)', opacity: updating === t.id ? 0.5 : 1 }}>
                        {updating === t.id ? '…' : nextLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}