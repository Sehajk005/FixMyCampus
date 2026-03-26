import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const STATUSES   = ['submitted','verified','assigned','in_progress','resolved','closed'];
const PRIORITIES = ['low','medium','high','critical'];
const PRIORITY_COLORS = { low:'#94a3b8', medium:'#60a5fa', high:'#fb923c', critical:'#ef4444' };

export default function AdminTickets() {
  const [tickets,     setTickets]     = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [search,    setSearch]    = useState('');
  const [updating,  setUpdating]  = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/tickets/all'),
      api.get('/auth/technicians').catch(() => ({ data: [] })),
    ]).then(([tr, techr]) => {
      setTickets(tr.data);
      setTechnicians(techr.data);
    }).finally(() => setLoading(false));
  }, []);

  async function updateTicket(ticketId, patch) {
    setUpdating(ticketId);
    try {
      const res = await api.patch(`/tickets/${ticketId}`, patch);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...res.data } : t));
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    } finally { setUpdating(null); }
  }

  const filtered = tickets.filter(t => {
    if (filterStatus   !== 'all' && t.status   !== filterStatus)   return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (search && ![t.title, t.submitter?.name, t.location].some(v => v?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  if (loading) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: '1rem', marginBottom: '0.75rem' }} />)}
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <Link to="/admin" style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'none' }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
            All Tickets
            <span style={{ marginLeft: '0.75rem', fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>({filtered.length})</span>
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="animate-fade-up delay-100" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem' }}>
        <input
          className="input-field" placeholder="Search title, student, location…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select className="input-field" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 'auto' }}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filterStatus !== 'all' || filterPriority !== 'all' || search) && (
          <button onClick={() => { setFilterStatus('all'); setFilterPriority('all'); setSearch(''); }}
            style={{ fontSize: '0.8rem', color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Ticket rows */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>No tickets match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((t, i) => {
            // Find assigned technician name from our loaded list OR from included assignee
            const assignedTech = technicians.find(tc => tc.id === t.assigned_to);
            const assignedName = assignedTech?.name || t.assignee?.name || null;

            return (
              <div key={t.id} className={`animate-fade-up delay-${Math.min(i*100+100, 600)}`}
                style={{ background: 'rgba(15,22,41,0.9)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: '1rem', padding: '1.125rem 1.5rem', opacity: updating === t.id ? 0.5 : 1, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <StatusBadge status={t.status} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: PRIORITY_COLORS[t.priority] }}>{t.priority}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'capitalize' }}>{t.category?.replace('_',' ')}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.25rem' }}>{t.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      📍 {t.location} · 👤 {t.submitter?.name} · {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                    {assignedName && (
                      <p style={{ fontSize: '0.72rem', color: '#67e8f9', marginTop: '0.2rem' }}>
                        🔧 Assigned to: <strong>{assignedName}</strong>
                      </p>
                    )}
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                    {/* Status dropdown */}
                    <select
                      value={t.status}
                      onChange={e => updateTicket(t.id, { status: e.target.value })}
                      disabled={updating === t.id}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', fontSize: '0.8rem', padding: '0.45rem 0.75rem', borderRadius: '0.625rem', cursor: 'pointer', outline: 'none' }}
                    >
                      {STATUSES.map(s => <option key={s} value={s} style={{ background: '#1e2a45' }}>{s.replace('_',' ')}</option>)}
                    </select>

                    {/* Assign dropdown */}
                    <select
                      value={t.assigned_to || ''}
                      onChange={e => updateTicket(t.id, { assigned_to: e.target.value || null, status: e.target.value ? 'assigned' : t.status })}
                      disabled={updating === t.id}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: t.assigned_to ? '#67e8f9' : '#94a3b8', fontSize: '0.8rem', padding: '0.45rem 0.75rem', borderRadius: '0.625rem', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="" style={{ background: '#1e2a45' }}>Unassigned</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id} style={{ background: '#1e2a45' }}>{tech.name}</option>
                      ))}
                    </select>

                    <Link to={`/tickets/${t.id}`} style={{ padding: '0.45rem 1rem', borderRadius: '0.625rem', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      View →
                    </Link>
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