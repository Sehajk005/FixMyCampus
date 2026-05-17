import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const WORKLOAD_QUERY = gql`
  query GetTechWorkload {
    technicianWorkload {
      id
      score
      avg_resolution_time
    }
  }
`;

const PRIORITY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'CRITICAL' },
  high: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'HIGH' },
  medium: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', label: 'MEDIUM' },
  low: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'LOW' },
};

const STATUS_NEXT = {
  submitted: 'in_progress',
  assigned: 'in_progress',
  in_progress: 'resolved',
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('active');

  const { data: gqlData } = useQuery(WORKLOAD_QUERY);

  useEffect(() => {
    api.get('/tickets/assigned-to-me').then(r => setTickets(r.data)).catch(() => setTickets([])).finally(() => setLoading(false));
  }, []);

  const techStats = gqlData?.technicianWorkload?.find(w => w.id === user?.id) || { score: 0, avg_resolution_time: 0 };

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

  const active = tickets.filter(t => !['resolved', 'closed'].includes(t.status));
  const done = tickets.filter(t => ['resolved', 'closed'].includes(t.status));
  const displayed = filter === 'active' ? active : done;
  const criticalCount = active.filter(t => t.priority === 'critical').length;

  return (
    <div className="page-shell" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="eyebrow">Staff Portal</p>
            <h1 className="section-title">
              My Assigned Tasks
            </h1>
            <p className="section-subtitle" style={{ marginTop: '0.25rem' }}>
              {user?.name} · {user?.department || 'Facilities'}
            </p>
          </div>
          {criticalCount > 0 && (
            <div className="animate-pulse-glow" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🚨</span>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fca5a5' }}>{criticalCount} CRITICAL</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Needs immediate attention</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Assigned', value: tickets.length, color: '#818cf8', delay: 'delay-100' },
          { label: 'In Progress', value: active.filter(t => t.status === 'in_progress').length, color: '#fb923c', delay: 'delay-200' },
          { label: 'Completed', value: done.length, color: '#34d399', delay: 'delay-300' },
          { label: 'Score', value: techStats.score ? `${techStats.score}%` : 'N/A', color: '#10b981', delay: 'delay-400' },
          { label: 'Avg Time', value: techStats.avg_resolution_time ? `${techStats.avg_resolution_time.toFixed(1)}h` : 'N/A', color: '#6366f1', delay: 'delay-500' },
        ].map(s => (
          <div key={s.label} className={`stat-card animate-fade-up ${s.delay}`}>
            <div className="animate-count" style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{loading ? '—' : s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>


      <div className="animate-fade-up delay-400" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[['active', `Active (${active.length})`], ['done', `Completed (${done.length})`]].map(([v, label]) => (
          <button key={v} type="button" className="btn-secondary" onClick={() => setFilter(v)} style={{
            padding: '0.45rem 1.05rem',
            borderColor: filter === v ? 'color-mix(in oklab, var(--accent) 45%, transparent)' : 'var(--border)',
            background: filter === v ? 'color-mix(in oklab, var(--accent) 16%, transparent)' : 'var(--surface)',
            color: filter === v ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Ticket cards */}
      {loading ? (
        <div className="motion-surface-enter" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: '1rem' }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {filter === 'active' ? '🎉' : '📭'}
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
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
              <div
                key={t.id}
                className={`list-row animate-fade-up delay-${Math.min(i * 100 + 100, 800)} ${t.priority === 'critical' ? 'is-critical' : t.priority === 'high' ? 'is-high' : t.priority === 'medium' ? 'is-medium' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 99, background: pc.bg, color: pc.color, letterSpacing: '0.06em' }}>{pc.label}</span>
                      <StatusBadge status={t.status} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t.category?.replace('_', ' ')}</span>
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem' }}>{t.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      📍 {t.location}
                      {t.submitter && <> · 👤 {t.submitter.name}</>}
                      <> · {new Date(t.createdAt).toLocaleDateString()}</>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexShrink: 0 }}>
                    <Link to={`/tickets/${t.id}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      💬 Chat
                    </Link>
                    {canAdvance && (
                      <button
                        type="button"
                        onClick={() => advanceStatus(t)}
                        disabled={updating === t.id}
                        className="btn-primary"
                        style={{
                          padding: '0.5rem 1.125rem',
                          fontSize: '0.8rem',
                          background: t.status === 'in_progress'
                            ? 'linear-gradient(135deg, color-mix(in oklab, var(--success) 88%, #0000), color-mix(in oklab, var(--success) 72%, var(--accent2)))'
                            : 'linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 65%, var(--accent2)))',
                          boxShadow: t.status === 'in_progress'
                            ? '0 0 20px color-mix(in oklab, var(--success) 30%, transparent)'
                            : '0 0 20px color-mix(in oklab, var(--accent) 30%, transparent)',
                          opacity: updating === t.id ? 0.5 : 1,
                        }}
                      >
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