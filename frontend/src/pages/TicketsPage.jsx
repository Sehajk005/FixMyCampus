import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const PRIORITY_COLORS = { low:'#94a3b8', medium:'#60a5fa', high:'#fb923c', critical:'#ef4444' };
const CATS = { electrical:'⚡',wifi:'📶',plumbing:'🔧',cleanliness:'🧹',furniture:'🪑',ac_hvac:'❄️',security:'🔒',other:'📋' };

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets/mine').then(r => setTickets(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>My Tickets</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' }}>{tickets.length} total complaints submitted</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">+ New Report</Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: '1rem' }} />)}
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '1.5rem' }}>No complaints yet.</p>
          <Link to="/tickets/new" className="btn-primary">Report your first issue</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tickets.map((t, i) => (
            <Link key={t.id} to={`/tickets/${t.id}`} className={`animate-fade-up delay-${Math.min(i*100+100, 600)}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.125rem 1.5rem', background: 'rgba(15,22,41,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '1.5rem', width: 40, textAlign: 'center', flexShrink: 0 }}>{CATS[t.category] || '📋'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {t.location} · {new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: PRIORITY_COLORS[t.priority] }}>{t.priority}</span>
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
