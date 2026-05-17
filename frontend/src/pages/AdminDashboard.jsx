import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/analytics/StatsCard';
import BarChart from '../components/analytics/BarChart';
import PieChart from '../components/analytics/PieChart';
import LineChart from '../components/analytics/LineChart';
import WorkloadTable from '../components/analytics/WorkloadTable';
import PageLoading from '../components/PageLoading';

const ADMIN_DASHBOARD_QUERY = gql`
  query GetAdminDashboard {
    ticketStats {
      total
      submitted
      in_progress
      resolved
      closed
    }
    technicianWorkload {
      id
      name
      active_tickets
      completed_tickets
      avg_resolution_time
      score
    }
    avgResolutionTime {
      date
      avg_hours
    }
    ticketsByCategory {
      category
      count
    }
    priorityDistribution {
      priority
      count
    }
  }
`;

export default function AdminDashboard() {
  const { data, loading, error } = useQuery(ADMIN_DASHBOARD_QUERY);

  if (loading) return <PageLoading label="Loading analytics…" />;

  if (error) return (
    <div className="motion-surface-enter" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', color: 'var(--danger)', padding: '2rem' }}>
      <div>Error loading dashboard: {error.message}</div>
    </div>
  );

  const stats = data.ticketStats;
  const activeTickets = stats.submitted + stats.in_progress;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem 6rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent2)' }}>Operations</p>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Admin Analytics Dashboard</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Comprehensive overview of ticket flow and team performance.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <Link to="/admin/users" className="btn-secondary">Manage Users</Link>
            <Link to="/admin/tickets" className="btn-primary">Manage Tickets</Link>
          </div>
        </div>

        <div className="animate-fade-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem' }}>
          <StatsCard title="Total Tickets" value={stats.total} color="border-blue-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>} />
          <StatsCard title="Active / Open" value={activeTickets} color="border-yellow-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} />
          <StatsCard title="Resolved" value={stats.resolved} color="border-green-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>} />
          <StatsCard title="Closed" value={stats.closed} color="border-gray-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>} />
        </div>

        <div className="animate-fade-up delay-200" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
          <div className="card card-hover">
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Tickets by Category</h2>
            <BarChart data={data.ticketsByCategory} dataKey="count" xAxisKey="category" />
          </div>
          <div className="card card-hover">
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Priority Distribution</h2>
            <PieChart data={data.priorityDistribution} nameKey="priority" dataKey="count" />
          </div>
        </div>

        <div className="card card-hover animate-fade-up delay-300">
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Resolution Time Trend</h2>
          <LineChart data={data.avgResolutionTime} dataKey="avg_hours" xAxisKey="date" />
        </div>

        <div className="card card-hover animate-fade-up delay-400" style={{ paddingBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>Technician Workload</h2>
          <WorkloadTable data={data.technicianWorkload} />
        </div>
      </div>
    </div>
  );
}
