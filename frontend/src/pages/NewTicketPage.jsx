import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = [
  { v:'electrical',i:'⚡',l:'Electrical'},{v:'wifi',i:'📶',l:'Wi-Fi'},{v:'plumbing',i:'🔧',l:'Plumbing'},
  {v:'cleanliness',i:'🧹',l:'Cleanliness'},{v:'furniture',i:'🪑',l:'Furniture'},{v:'ac_hvac',i:'❄️',l:'AC / HVAC'},
  {v:'security',i:'🔒',l:'Security'},{v:'other',i:'📋',l:'Other'},
];
const PRIORITIES = [{v:'low',c:'#94a3b8'},{v:'medium',c:'#60a5fa'},{v:'high',c:'#fb923c'},{v:'critical',c:'#ef4444'}];

export default function NewTicketPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ title:'', description:'', category: params.get('category')||'', location:'', priority:'medium' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setLoading(true); setError('');
    try {
      const res = await api.post('/tickets', form);
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to submit');
    } finally { setLoading(false); }
  }

  const isValid = form.title && form.description && form.category && form.location;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1rem' }}>← Back</Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Report an Issue</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Describe the problem and we'll get it fixed.</p>
      </div>

      {error && <div className="alert-error animate-fade-in" style={{ marginBottom: '1.25rem' }}>⚠ {error}</div>}

      <div style={{ background: 'rgba(15,22,41,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-up delay-100">

        <div>
          <label className="label">Issue Title</label>
          <input className="input-field" placeholder="Brief summary e.g. 'Wi-Fi down in Lab 3'" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
        </div>

        {/* Category grid */}
        <div>
          <label className="label">Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }}>
            {CATEGORIES.map(c => (
              <button key={c.v} onClick={() => setForm(f=>({...f,category:c.v}))} style={{ padding: '0.75rem 0.5rem', borderRadius: '0.75rem', border: form.category === c.v ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)', background: form.category === c.v ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', transition: 'all 0.15s' }}>
                <span style={{ fontSize: '1.25rem' }}>{c.i}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: form.category === c.v ? '#818cf8' : '#64748b' }}>{c.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="label">Priority</label>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            {PRIORITIES.map(p => (
              <button key={p.v} onClick={() => setForm(f=>({...f,priority:p.v}))} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: form.priority === p.v ? `1px solid ${p.c}50` : '1px solid rgba(255,255,255,0.07)', background: form.priority === p.v ? `${p.c}15` : 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: form.priority === p.v ? p.c : '#64748b', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                {p.v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Location</label>
          <input className="input-field" placeholder="e.g. Block A - Lab 3, 2nd Floor" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input-field" rows={5} placeholder="Describe the issue in detail — what happened, since when, how bad…" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} style={{ resize: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={!isValid || loading} className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
            {loading ? <span className="dot-loader"><span/><span/><span/></span> : '🚀 Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
