import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const PRIORITY_COLORS = { low:'#94a3b8', medium:'#60a5fa', high:'#fb923c', critical:'#ef4444' };

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket,   setTicket]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/tickets/${id}`)
      .then(r => { setTicket(r.data); setMessages(r.data.messages || []); })
      .catch(err => setError(err.response?.data?.error || 'Failed to load ticket'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('join_room', id);
    setConnected(true);
    socket.on('new_message', msg => setMessages(prev => [...prev, msg]));
    return () => { socket.emit('leave_room', id); socket.off('new_message'); };
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function sendMessage() {
    if (!msgInput.trim()) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit('message', { ticketId: id, content: msgInput.trim() });
    setMsgInput('');
  }

  const backPath = user?.role === 'admin' ? '/admin/tickets' : user?.role === 'technician' ? '/staff' : '/tickets';

  if (loading) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="skeleton" style={{ height: 180, borderRadius: '1rem', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ height: 340, borderRadius: '1rem' }} />
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
      <p style={{ color: '#f87171' }}>{error}</p>
      <Link to={backPath} style={{ color: '#818cf8', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>← Go back</Link>
    </div>
  );

  if (!ticket) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      <Link to={backPath} style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem' }}>← Back</Link>

      {/* Ticket info card */}
      <div className="animate-fade-up" style={{ background: 'rgba(15,22,41,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
              <StatusBadge status={ticket.status} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: PRIORITY_COLORS[ticket.priority], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ticket.priority}</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>{ticket.category?.replace('_',' ')}</span>
            </div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{ticket.title}</h1>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '1rem' }}>{ticket.description}</p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>📍 {ticket.location}</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>👤 {ticket.submitter?.name}</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>🕐 {new Date(ticket.createdAt).toLocaleString()}</span>
          {ticket.assigned_to && (
            <span style={{ fontSize: '0.78rem', color: '#67e8f9' }}>🔧 Assigned to staff</span>
          )}
        </div>
      </div>

      {/* Live Chat */}
      <div className="animate-fade-up delay-200" style={{ background: 'rgba(15,22,41,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#34d399' : '#94a3b8', boxShadow: connected ? '0 0 10px #34d399' : 'none' }} />
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f1f5f9' }}>Live Discussion</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '0.15rem 0.5rem', borderRadius: 99 }}>Socket.io</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b' }}>{messages.length} messages</span>
        </div>

        {/* Messages */}
        <div style={{ padding: '1rem 1.5rem', height: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', color: '#475569' }}>
              <div style={{ fontSize: '2.5rem' }}>💬</div>
              <p style={{ fontSize: '0.875rem' }}>No messages yet. Start the conversation!</p>
            </div>
          ) : messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id || msg.sender?.id === user?.id;
            const name = msg.sender?.name || msg.sender_email || 'User';
            return (
              <div key={msg.id || i} className="animate-fade-in" style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '72%' }}>
                  {!isMe && <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', marginBottom: '0.25rem', paddingLeft: '0.75rem' }}>{name}</p>}
                  <div style={{ padding: '0.625rem 1rem', borderRadius: isMe ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem', background: isMe ? 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.4))' : 'rgba(255,255,255,0.06)', border: isMe ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: '0.875rem', color: '#f1f5f9', lineHeight: 1.5 }}>{msg.content}</p>
                    <p style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.4)' : '#475569', marginTop: '0.25rem', textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '0.75rem' }}>
          <input className="input-field" style={{ flex: 1 }} placeholder="Type a message… (Enter to send)" value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
          <button onClick={sendMessage} disabled={!msgInput.trim()} className="btn-primary" style={{ padding: '0.625rem 1.25rem', flexShrink: 0 }}>Send ↑</button>
        </div>
      </div>
    </div>
  );
}