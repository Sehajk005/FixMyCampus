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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#67e8f9', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Staff Portal</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Resolved History</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{tickets.length} issues resolved by you</p>
      </div>

      <div className="animate-fade-up delay-100" style={{ marginBottom: '1.5rem' }}>
        <input className="input-field" placeholder="Search resolved tickets…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: '1rem' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: '#94a3b8' }}>{search ? 'No matching tickets.' : 'No resolved tickets yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map((t, i) => (
            <div key={t.id} className={`animate-fade-up delay-${Math.min(i*100+100, 600)}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #10b981', borderRadius: '1rem', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {t.location} · {t.category?.replace('_',' ')} · {new Date(t.updated_at).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                <StatusBadge status={t.status} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#34d399' }}>✓ Done</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
