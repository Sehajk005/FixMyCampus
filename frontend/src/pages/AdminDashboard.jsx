import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['submitted', 'verified', 'assigned', 'in_progress', 'resolved', 'closed'];
const STATUS_COLORS = {
  submitted:   'bg-yellow-400',
  verified:    'bg-blue-400',
  assigned:    'bg-purple-400',
  in_progress: 'bg-orange-400',
  resolved:    'bg-green-400',
  closed:      'bg-gray-400',
};

const CATEGORY_ICONS = {
  electrical: '⚡', wifi: '📶', plumbing: '🔧',
  cleanliness: '🧹', furniture: '🪑', ac_hvac: '❄️',
  security: '🔒', other: '📋',
};

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets/all')
      .then(r => setTickets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Stats
  const total = tickets.length;
  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tickets.filter(t => t.status === s).length;
    return acc;
  }, {});
  const byCategory = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});
  const critical = tickets.filter(t => t.priority === 'critical').length;
  const open = tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;

  const recent = [...tickets].slice(0, 5);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400 text-sm animate-pulse">Loading dashboard…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-xs mt-0.5">Fix My Campus · Chitkara University</p>
        </div>
        <Link to="/admin/tickets" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Manage Tickets →
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Top stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tickets', value: total, color: 'text-white', bg: 'bg-slate-800' },
            { label: 'Open / Active', value: open, color: 'text-orange-400', bg: 'bg-slate-800' },
            { label: 'Critical', value: critical, color: 'text-red-400', bg: 'bg-slate-800' },
            { label: 'Resolved', value: byStatus.resolved + byStatus.closed, color: 'text-green-400', bg: 'bg-slate-800' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-5 border border-slate-700`}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Status breakdown */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Tickets by Status</h2>
            <div className="space-y-3">
              {STATUSES.map(s => {
                const count = byStatus[s] || 0;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={s}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 capitalize">{s.replace('_', ' ')}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COLORS[s]} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Tickets by Category</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                  <span className="text-lg">{CATEGORY_ICONS[cat] || '📋'}</span>
                  <div>
                    <div className="text-xs text-slate-300 capitalize">{cat.replace('_', ' ')}</div>
                    <div className="text-sm font-bold text-white">{count}</div>
                  </div>
                </div>
              ))}
              {Object.keys(byCategory).length === 0 && (
                <p className="text-slate-500 text-xs col-span-2">No tickets yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent tickets */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Recent Tickets</h2>
            <Link to="/admin/tickets" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          <div className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-slate-500 text-sm">No tickets yet.</p>
            ) : recent.map(t => (
              <Link key={t.id} to={`/tickets/${t.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{t.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.submitter?.name} · {t.location}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <StatusBadge status={t.status} />
                  <span className={`text-xs font-medium ${t.priority === 'critical' ? 'text-red-400' : t.priority === 'high' ? 'text-orange-400' : 'text-slate-400'}`}>
                    {t.priority}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
