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
  const [form, setForm] = useState({ title:'', description:'', category: params.get('category')||'', location:'', priority:'medium', is_anonymous: false });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateId, setDuplicateId] = useState(null);

  async function handleSubmit() {
    setLoading(true); setError(''); setDuplicateId(null);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (photo) formData.append('photo', photo);

      await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/tickets`); // Redirect to My Tickets
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.existing_ticket_id) {
         setError(err.response.data.error || 'An open ticket already exists for this issue.');
         setDuplicateId(err.response.data.existing_ticket_id);
      } else {
         setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to submit');
      }
    } finally { setLoading(false); }
  }

  const isValid = form.title && form.description && form.category && form.location;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1rem' }}>← Back</Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Report an Issue</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Describe the problem and we'll get it fixed.</p>
      </div>

      {error && !duplicateId && <div className="alert-error animate-fade-in" style={{ marginBottom: '1.25rem' }}>⚠ {error}</div>}
      
      {duplicateId && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.4)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ color: '#f87171', fontWeight: 600 }}>{error}</span>
          <Link to={`/tickets/${duplicateId}`} style={{ color: '#fff', background: '#ef4444', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', textAlign: 'center', display: 'inline-block', fontWeight: 600 }}>
            View Existing Ticket
          </Link>
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-up delay-100">

        <div>
          <label className="label">Issue Title</label>
          <input className="input-field" placeholder="Brief summary e.g. 'Wi-Fi down in Lab 3'" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
        </div>

        {/* Category grid */}
        <div>
          <label className="label">Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }}>
            {CATEGORIES.map(c => (
              <button key={c.v} onClick={() => setForm(f=>({...f,category:c.v}))} style={{ padding: '0.75rem 0.5rem', borderRadius: '0.75rem', border: form.category === c.v ? '1px solid color-mix(in oklab, var(--accent) 45%, transparent)' : '1px solid var(--border)', background: form.category === c.v ? 'color-mix(in oklab, var(--accent) 18%, transparent)' : 'var(--surface2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', transition: 'all 0.15s' }}>
                <span style={{ fontSize: '1.25rem' }}>{c.i}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: form.category === c.v ? 'var(--accent)' : 'var(--text-muted)' }}>{c.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="label">Priority</label>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            {PRIORITIES.map(p => (
              <button key={p.v} onClick={() => setForm(f=>({...f,priority:p.v}))} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: form.priority === p.v ? `1px solid ${p.c}50` : '1px solid var(--border)', background: form.priority === p.v ? `${p.c}15` : 'var(--surface2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: form.priority === p.v ? p.c : 'var(--text-muted)', transition: 'all 0.15s', textTransform: 'capitalize' }}>
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
        
        <div>
          <label className="label">Attach Photo (Optional)</label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ color: 'var(--text)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="checkbox" 
            id="anonymous" 
            checked={form.is_anonymous} 
            onChange={e => setForm(f=>({...f, is_anonymous: e.target.checked}))} 
            style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
          />
          <label htmlFor="anonymous" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}>Submit Anonymously (Staff will not see your name)</label>
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
