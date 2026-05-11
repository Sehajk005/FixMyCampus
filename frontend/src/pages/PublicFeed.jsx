import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../api/firebase';
import api from '../services/api';
import CampusHeatmap from '../components/CampusHeatmap';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function PublicFeed() {
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const feedRef = ref(db, 'feed');
    onValue(feedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert to array and sort by updated_at (newest first)
        const arr = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }))
        .filter(ticket => ticket.title && ticket.title.trim() !== '')
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        setFeedData(arr);
      } else {
        setFeedData([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Feed Error:", error);
      setLoading(false); // Stop loading on error
    });

    return () => off(feedRef);
  }, []);

  const handleUpvote = async (ticket) => {
    if (!user) {
      alert('Please log in to upvote issues.');
      return;
    }
    // If the user is logged in, and they have already upvoted this ticket, return early
    if (user && ticket.upvoters && ticket.upvoters[user.id]) {
      return;
    }
    try {
      await api.post(`/tickets/feed/${ticket.id}/upvote`);
      // UI updates via Firebase listener automatically
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        console.error('Failed to upvote:', error);
        alert('Could not upvote this ticket.');
      }
    }
  };

  const getPriorityStyle = (priority) => {
    if (priority === 'critical') {
      return { color: 'var(--danger-soft)', background: 'color-mix(in oklab, var(--danger) 16%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 30%, transparent)' };
    }
    if (priority === 'high') {
      return { color: 'var(--warning)', background: 'color-mix(in oklab, var(--warning) 14%, transparent)', borderColor: 'color-mix(in oklab, var(--warning) 30%, transparent)' };
    }
    return { color: 'var(--success)', background: 'color-mix(in oklab, var(--success) 14%, transparent)', borderColor: 'color-mix(in oklab, var(--success) 30%, transparent)' };
  };

  return (
    <div className="page-shell">
      <div>
        
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>
            Campus <span className="emphasis-text">Plus</span>
          </h1>
          <p style={{ marginTop: '0.7rem', maxWidth: 760, marginInline: 'auto', fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Live updates and trending issues across the university. Help prioritize by upvoting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          
          {/* Feed List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1rem' }}>
            {loading ? (
              <div className="motion-surface-enter" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 120, borderRadius: '0.9rem' }}></div>
                ))}
              </div>
            ) : feedData.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No active issues at the moment! 🎉</p>
              </div>
            ) : (
              feedData.map((ticket, index) => (
                <div key={ticket.id} className={`card card-hover animate-fade-up delay-${Math.min((index + 1) * 100, 600)}`}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  
                  {/* Upvote Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: 'var(--surface2)', borderRadius: '0.7rem', minWidth: 60 }}>
                    <button 
                      onClick={() => handleUpvote(ticket)}
                      className="motion-icon-btn rounded-lg p-1 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                      style={{ color: user && ticket.upvoters && ticket.upvoters[user.id] ? 'var(--accent)' : 'var(--text-muted)', cursor: user && ticket.upvoters && ticket.upvoters[user.id] ? 'not-allowed' : 'pointer' }}
                      disabled={user && ticket.upvoters && ticket.upvoters[user.id]}
                      title={user && ticket.upvoters && ticket.upvoters[user.id] ? "Already upvoted" : "Upvote to escalate priority"}
                    >
                      <svg className="w-8 h-8" fill={user && ticket.upvoters && ticket.upvoters[user.id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                    <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.1rem' }}>{ticket.upvotes || 0}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{ticket.title}</h3>
                      <StatusBadge status={ticket.status} />
                    </div>
                    
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface2)', padding: '0.2rem 0.55rem', borderRadius: '0.4rem' }}>
                        <span>📍</span> {ticket.location}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface2)', padding: '0.2rem 0.55rem', borderRadius: '0.4rem' }}>
                        <span>🏷️</span> <span className="capitalize">{ticket.category}</span>
                      </span>
                    </div>

                    <div style={{ marginTop: '0.75rem', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>Last Activity: {new Date(ticket.updated_at).toLocaleString()}</span>
                      {ticket.priority && (
                        <span className="priority-badge" style={getPriorityStyle(ticket.priority)}>
                          {ticket.priority.toUpperCase()} PRIORITY
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="animate-fade-up delay-200 lg:sticky lg:top-24" style={{ marginTop: '0.5rem' }}>
            <div className="card" style={{ padding: '1rem' }}>
              <CampusHeatmap />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
