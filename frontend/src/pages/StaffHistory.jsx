import { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function StaffHistory() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/tickets/assigned-to-me').then(r => {
      setTickets(r.data.filter(t => ['resolved','closed'].includes(t.status)));
    }).catch(() => setTickets([])).finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-shell" style={{ maxWidth: 1100 }}>
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <p className="eyebrow">Staff Portal</p>
        <h1 className="section-title">Resolved History</h1>
        <p className="section-subtitle" style={{ marginTop: '0.25rem' }}>{tickets.length} issues resolved by you</p>
      </div>

      <div className="animate-fade-up delay-100" style={{ marginBottom: '1.5rem' }}>
        <input className="input-field" placeholder="Search resolved tickets…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      {loading ? (
        <div className="motion-surface-enter" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: '1rem' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: 'var(--text-muted)' }}>{search ? 'No matching tickets.' : 'No resolved tickets yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map((t, i) => (
            <div key={t.id} className={`list-row is-medium animate-fade-up delay-${Math.min(i*100+100, 600)}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {t.location} · {t.category?.replace('_',' ')} · {new Date(t.updated_at).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                <StatusBadge status={t.status} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--success)' }}>✓ Done</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
