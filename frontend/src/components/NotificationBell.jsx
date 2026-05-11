import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket } from '../services/socket';

export default function NotificationBell() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const persisted = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem('accessToken') : null;
    const cookieToken = (typeof window !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1]) || null;
    const authToken = token || persisted || cookieToken || null;
    const socket = connectSocket(authToken);

    socket.on('notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    socket.on('sla_breach', () => {
      // SLA breach alert could be added locally or handled via 'notification' event
    });

    return () => {
      disconnectSocket();
    };
  }, [user]);

  // Read count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    // Optional: make API call to mark read in backend Db if we implemented it
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 focus:outline-none motion-focus-ring rounded-lg relative min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
        style={{ color: 'var(--text-muted)' }}
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center p-1 min-w-[1rem] h-4 px-0.5 text-[10px] text-white bg-red-600 rounded-full notif-badge-soft">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50 overflow-hidden text-sm motion-dropdown-enter"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-center px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
            <h3 className="font-bold" style={{ color: 'var(--text)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                <p>No new notifications</p>
                <span className="text-2xl mt-2 block">🔔</span>
              </div>
            ) : (
              <ul>
                {notifications.map(notif => (
                  <li 
                    key={notif.id} 
                    className={`px-4 py-3 cursor-pointer motion-focus-ring ${notif.is_read ? 'opacity-60' : ''}`}
                    style={{
                      borderTop: '1px solid var(--border)',
                      background: notif.is_read ? 'transparent' : 'color-mix(in oklab, var(--accent) 10%, transparent)',
                      transition: 'background-color 200ms cubic-bezier(0.25, 1, 0.5, 1)',
                    }}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold" style={{ color: 'var(--text)' }}>{notif.title}</span>
                      {!notif.is_read && <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{notif.message}</p>
                    <span className="text-[10px] mt-2 block" style={{ color: 'var(--text-muted)' }}>
                      {new Date(notif.created_at || Date.now()).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="px-4 py-2 text-center" style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>
            <button className="text-xs" style={{ color: 'var(--text-muted)' }}>View All</button>
          </div>
        </div>
      )}
    </div>
  );
}
