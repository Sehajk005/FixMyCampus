import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const PRIORITY_COLORS = { low:'#94a3b8', medium:'#60a5fa', high:'#fb923c', critical:'#ef4444' };
const STATUSES = ['submitted', 'verified', 'assigned', 'in_progress', 'resolved', 'closed'];

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket,   setTicket]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });
  const [noteInput, setNoteInput] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  const bottomRef = useRef(null);

  const fetchTicket = () => {
    api.get(`/tickets/${id}`)
      .then(r => { 
        setTicket(r.data); 
        setMessages(r.data.messages || []); 
        
        if (r.data.photo_url) {
          api.get(r.data.photo_url, { responseType: 'blob' })
            .then(imgRes => setPhotoUrl(URL.createObjectURL(imgRes.data)))
            .catch(console.error);
        }

        if (r.data.submitter_id === user?.id && ['resolved', 'closed'].includes(r.data.status) && !r.data.feedback) {
          setShowFeedback(true);
        }
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load ticket'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
  }, [id, user?.id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('join_room', id);
    setConnected(true);
    socket.on('new_message', msg => setMessages(prev => [...prev, msg]));
    socket.on('typing', ({ name }) => setTypingUsers(prev => new Set([...prev, name])));
    socket.on('stop_typing', ({ name }) => setTypingUsers(prev => {
      const updated = new Set(prev);
      updated.delete(name);
      return updated;
    }));
    return () => { 
      socket.emit('leave_room', id); 
      socket.off('new_message'); 
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function sendMessage() {
    if (!msgInput.trim()) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit('message', { ticketId: id, content: msgInput.trim() });
    socket.emit('stop_typing', { ticketId: id });
    setMsgInput('');
  }

  const handleTyping = (e) => {
    setMsgInput(e.target.value);
    const socket = getSocket();
    if (!socket) return;
    socket.emit('typing', { ticketId: id });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { ticketId: id });
    }, 2000);
  };

  async function handleStatusChange(newStatus) {
    const note = prompt(`Enter a note for the transition to ${newStatus}:`);
    if (note === null) return;
    try {
      await api.patch(`/tickets/${id}`, { status: newStatus, note });
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  }

  async function submitFeedback() {
    try {
      await api.post(`/tickets/${id}/feedback`, feedbackData);
      setShowFeedback(false);
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.error || 'Feedback submission failed');
      if (err.response?.status === 409) setShowFeedback(false); // already provided
    }
  }

  async function submitStaffNote() {
    if (!noteInput.trim()) return;
    setNoteSaving(true);
    try {
      await api.post(`/tickets/${id}/updates`, { note: noteInput.trim() });
      setNoteInput('');
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add update');
    } finally {
      setNoteSaving(false);
    }
  }

  const backPath = user?.role === 'admin' ? '/admin/tickets' : user?.role === 'technician' ? '/staff' : '/tickets';
  const isStaff  = user?.role === 'admin' || user?.role === 'technician';

  if (loading) return (
    <div className="motion-surface-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="skeleton" style={{ height: 180, borderRadius: '1rem', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ height: 340, borderRadius: '1rem' }} />
    </div>
  );

  if (error) return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
      <p style={{ color: '#f87171' }}>{error}</p>
      <Link to={backPath} style={{ color: 'var(--accent)', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>← Go back</Link>
    </div>
  );

  if (!ticket) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      <Link to={backPath} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem' }}>← Back</Link>

      {/* Main Container Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        
        {/* Ticket info card */}
        <div className="animate-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
                <StatusBadge status={ticket.status} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: PRIORITY_COLORS[ticket.priority], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ticket.priority}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{ticket.category?.replace('_',' ')}</span>
              </div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{ticket.title}</h1>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>{ticket.description}</p>
          
          {photoUrl && (
            <div style={{ marginBottom: '1rem' }}>
               <img src={photoUrl} alt="Attached Evidence" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.75rem', objectFit: 'cover', border: '1px solid var(--border)' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {ticket.location}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👤 {ticket.submitter?.name || (ticket.is_anonymous ? 'Anonymous' : 'Unknown')}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🕐 {new Date(ticket.created_at || ticket.createdAt).toLocaleString()}</span>
          </div>

          {ticket.feedback && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>Feedback Provided</p>
              <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
                {[1,2,3,4,5].map(s => <span key={s}>{s <= ticket.feedback.rating ? '⭐' : '☆'}</span>)}
              </div>
              {ticket.feedback.comment && <p style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{ticket.feedback.comment}</p>}
            </div>
          )}

          {isStaff && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Update Status (Staff Options)</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button key={s} disabled={ticket.status === s} onClick={() => handleStatusChange(s)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '0.5rem', background: ticket.status === s ? 'var(--surface2)' : 'color-mix(in oklab, var(--accent) 12%, transparent)', color: ticket.status === s ? 'var(--text-muted)' : 'var(--accent)', border: '1px solid ' + (ticket.status === s ? 'var(--border)' : 'color-mix(in oklab, var(--accent) 35%, transparent)'), cursor: ticket.status === s ? 'not-allowed' : 'pointer' }}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                <input
                  className="input-field"
                  placeholder="Add internal update note for timeline"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  style={{ flex: 1, minWidth: 240 }}
                />
                <button
                  className="btn-secondary"
                  onClick={submitStaffNote}
                  disabled={noteSaving || !noteInput.trim()}
                >
                  {noteSaving ? 'Saving...' : 'Add Update'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timeline updates */}
        <div className="animate-fade-up delay-100" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Activity Timeline</h2>
          {(!ticket.updates || ticket.updates.length === 0) ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No updates on this ticket yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {ticket.updates.map(u => (
                <div key={u.id} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, background: '#818cf8', borderRadius: '50%' }} />
                    <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: '0.2rem' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>{u.updater?.name || 'Staff'}</p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(u.created_at || u.createdAt).toLocaleString()}</span>
                    </div>
                    {u.old_status !== u.new_status && (
                       <p style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '0.25rem' }}>Changed status to {u.new_status}</p>
                    )}
                    {u.note && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface2)', padding: '0.5rem', borderRadius: '0.5rem', marginTop: '0.25rem', border: '1px solid var(--border)' }}>{u.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Live Chat */}
      <div className="animate-fade-up delay-200" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#34d399' : '#94a3b8', boxShadow: connected ? '0 0 10px #34d399' : 'none' }} />
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>Live Discussion</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'color-mix(in oklab, var(--accent) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--accent) 28%, transparent)', padding: '0.15rem 0.5rem', borderRadius: 99 }}>Socket.io</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{messages.length} messages</span>
        </div>

        {/* Messages */}
        <div style={{ padding: '1rem 1.5rem', height: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem' }}>💬</div>
              <p style={{ fontSize: '0.875rem' }}>No messages yet. Start the conversation!</p>
            </div>
          ) : messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id || msg.sender?.id === user?.id;
            const name = msg.sender?.name || msg.sender_email || 'User';
            return (
              <div key={msg.id || i} className="animate-fade-in" style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '72%' }}>
                  {!isMe && <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.25rem', paddingLeft: '0.75rem' }}>{name}</p>}
                  <div style={{ padding: '0.625rem 1rem', borderRadius: isMe ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem', background: isMe ? 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 58%, transparent), color-mix(in oklab, var(--accent2) 40%, transparent))' : 'var(--surface2)', border: isMe ? '1px solid color-mix(in oklab, var(--accent) 38%, transparent)' : '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.5 }}>{msg.content}</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div style={{ padding: '0 1.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
          <input className="input-field" style={{ flex: 1 }} placeholder="Type a message… (Enter to send)" value={msgInput} onChange={handleTyping} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
          <button onClick={sendMessage} disabled={!msgInput.trim()} className="btn-primary" style={{ padding: '0.625rem 1.25rem', flexShrink: 0 }}>Send ↑</button>
        </div>
      </div>

      {/* Feedback Modal Overlay */}
      {showFeedback && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="animate-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: 800 }}>Service Feedback</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your ticket is {ticket.status}. Please rate the service provided.</p>
            
            <label className="label">Rating (1-5)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
               {[1,2,3,4,5].map(s => (
                 <button key={s} onClick={() => setFeedbackData(prev => ({...prev, rating: s}))} style={{ background: 'transparent', border: 'none', fontSize: '2rem', cursor: 'pointer', transition: 'transform 0.1s', transform: feedbackData.rating >= s ? 'scale(1.1)' : 'scale(1)' }}>
                    {feedbackData.rating >= s ? '⭐' : '☆'}
                 </button>
               ))}
            </div>

            <label className="label">Comments (Optional)</label>
            <textarea className="input-field" rows={3} value={feedbackData.comment} onChange={e => setFeedbackData(prev => ({...prev, comment: e.target.value}))} style={{ marginBottom: '1.5rem', resize: 'none' }} />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => setShowFeedback(false)}>Skip</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={submitFeedback}>Submit</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}