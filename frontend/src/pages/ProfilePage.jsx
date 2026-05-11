import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ROLE_COLORS = { student:'#60a5fa', technician:'#67e8f9', admin:'#a78bfa' };
const TASK_CATEGORIES = ['electrical', 'wifi', 'plumbing', 'cleanliness', 'furniture', 'ac_hvac', 'security', 'other'];

const Field = ({ label, value, editComp, editing }) => (
  <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
    <label className="label" style={{ marginBottom: '0.35rem' }}>{label}</label>
    {editing && editComp ? editComp : <p style={{ fontSize: '0.9rem', color: value ? 'var(--text)' : 'var(--text-muted)' }}>{value || '—'}</p>}
  </div>
);

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name||'', department: user?.department||'', phone: user?.phone||'' });
  const [passwords, setPasswords] = useState({ current:'', newPass:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Skills State
  const [skills, setSkills] = useState([]);
  const [skError, setSkError] = useState('');
  const [skSuccess, setSkSuccess] = useState('');

  useEffect(() => {
    if (user?.role === 'technician') {
      fetchSkills();
    }
  }, [user]);

  async function fetchSkills() {
    try {
      const res = await api.get('/auth/me/skills');
      setSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveSkills() {
    setSkError(''); setSkSuccess(''); setSaving(true);
    try {
      await api.put('/auth/me/skills', { skills });
      setSkSuccess('Skills updated!');
      fetchSkills();
    } catch (err) { setSkError(err.response?.data?.error || 'Update failed'); }
    finally { setSaving(false); }
  }

  function addSkill() {
    const unselected = TASK_CATEGORIES.find(c => !skills.find(s => s.skill_tag === c));
    if (unselected) {
      setSkills([...skills, { skill_tag: unselected, availability: true, max_capacity: 5 }]);
    }
  }

  function removeSkill(idx) {
    const copy = [...skills];
    copy.splice(idx, 1);
    setSkills(copy);
  }

  function updateSkill(idx, field, val) {
    const copy = [...skills];
    copy[idx][field] = val;
    setSkills(copy);
  }

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.patch('/auth/profile', form);
      setSuccess('Profile updated!'); setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
    finally { setSaving(false); }
  }

  async function handleChangePassword() {
    setPwError(''); setPwSuccess('');
    if (passwords.newPass !== passwords.confirm) return setPwError('Passwords do not match');
    if (passwords.newPass.length < 8) return setPwError('Min 8 characters');
    setSaving(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      setPwSuccess('Password updated!'); setPasswords({ current:'', newPass:'', confirm:'' });
    } catch (err) { setPwError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  const initials = user?.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const roleColor = ROLE_COLORS[user?.role] || '#94a3b8';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      <h1 className="animate-fade-up" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '2rem' }}>My Profile</h1>

      {/* Identity card */}
      <div className="animate-fade-up delay-100" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}40, ${roleColor}20)`, border: `2px solid ${roleColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: roleColor, flexShrink: 0 }}>{initials}</div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>{user?.name}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{user?.email}</p>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: 99, background: `${roleColor}18`, color: roleColor, border: `1px solid ${roleColor}30`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</span>
        </div>
      </div>

      {/* Info card */}
      <div className="animate-fade-up delay-200" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text)' }}>Personal Information</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', padding: '0.35rem 0.875rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Edit</button>
          ) : null}
        </div>

        {success && <div className="alert-success animate-fade-in" style={{ marginBottom: '1rem' }}>✓ {success}</div>}
        {error && <div className="alert-error animate-fade-in" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Field label="Full Name" value={user?.name} editing={editing} editComp={<input className="input-field" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />} />
          <Field label="Email" value={user?.email} editing={editing} />
          {user?.role !== 'technician' && (
             <Field label="Department" value={user?.department} editing={editing} editComp={<input className="input-field" placeholder="e.g. Computer Science" value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))} />} />
          )}
          <Field label="Phone" value={user?.phone} editing={editing} editComp={<input className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />} />
        </div>

        {editing && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={() => { setEditing(false); setError(''); }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
              {saving ? <span className="dot-loader"><span/><span/><span/></span> : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Technician Skills & Availability */}
      {user?.role === 'technician' && (
        <div className="animate-fade-up delay-250" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text)' }}>Skills & Availability</h3>
            <button onClick={addSkill} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', padding: '0.35rem 0.875rem', borderRadius: '0.5rem', cursor: 'pointer' }}>+ Add Skill</button>
          </div>

          {skSuccess && <div className="alert-success animate-fade-in" style={{ marginBottom: '1rem' }}>✓ {skSuccess}</div>}
          {skError && <div className="alert-error animate-fade-in" style={{ marginBottom: '1rem' }}>⚠ {skError}</div>}

          {skills.length === 0 ? (
             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No skills configured. You will not be auto-assigned any tickets.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {skills.map((skill, idx) => (
                <div key={idx} style={{ padding: '1.25rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <label className="label" style={{ marginBottom: '0.35rem' }}>Skill Category</label>
                      <select style={{ width: '100%', padding: '0.625rem 0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)', outline: 'none' }} value={skill.skill_tag || ''} onChange={e => updateSkill(idx, 'skill_tag', e.target.value)}>
                        <option value="" disabled>Select Category</option>
                        {TASK_CATEGORIES.map(c => <option key={c} value={c} style={{ background: 'var(--surface)' }}>{c}</option>)}
                      </select>
                    </div>

                    <div style={{ width: '100px' }}>
                      <label className="label" style={{ marginBottom: '0.35rem' }}>Capacity</label>
                      <input type="number" min="1" max="20" style={{ width: '100%', padding: '0.625rem 0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)', outline: 'none' }} value={skill.max_capacity} onChange={e => updateSkill(idx, 'max_capacity', parseInt(e.target.value, 10))} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={skill.availability} onChange={e => updateSkill(idx, 'availability', e.target.checked)} style={{ width: '1.25rem', height: '1.25rem', accentColor: '#6366f1' }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>Available for Auto-Assign</span>
                    </label>
                    <button onClick={() => removeSkill(idx)} style={{ fontSize: '0.85rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                  </div>
                  
                  {skill.current_workload !== undefined && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Workload: {skill.current_workload} tickets assigned</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={handleSaveSkills} disabled={saving} className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>{saving ? 'Saving...' : 'Save Skills'}</button>
          </div>
        </div>
      )}

      {/* Password card */}
      <div className="animate-fade-up delay-300" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.75rem' }}>
        <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>Change Password</h3>

        {pwError && <div className="alert-error animate-fade-in" style={{ marginBottom: '1rem' }}>⚠ {pwError}</div>}
        {pwSuccess && <div className="alert-success animate-fade-in" style={{ marginBottom: '1rem' }}>✓ {pwSuccess}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[['Current Password','current','current password'],['New Password','newPass','min 8 chars'],['Confirm Password','confirm','repeat new password']].map(([label, key, ph]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type="password" className="input-field" placeholder={ph} value={passwords[key]} onChange={e => setPasswords(p=>({...p,[key]:e.target.value}))} />
            </div>
          ))}
          <button onClick={handleChangePassword} disabled={!passwords.current || !passwords.newPass || !passwords.confirm || saving} className="btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}>
            {saving ? <span className="dot-loader"><span/><span/><span/></span> : '🔐 Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
