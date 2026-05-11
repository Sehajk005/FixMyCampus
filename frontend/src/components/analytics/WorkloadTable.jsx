
export default function WorkloadTable({ data }) {
  return (
    <div className="motion-chart-panel rounded-xl shadow-md overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Technician</th>
              <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Active Tickets</th>
              <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Completed</th>
              <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Avg Resolution (hrs)</th>
              <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Performance Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tech, rowIdx) => (
              <tr
                key={tech.id}
                className="motion-row-enter"
                style={{
                  borderTop: '1px solid var(--border)',
                  transition: 'background-color var(--motion-ui) var(--ease-out-quart)',
                  animationDelay: `${Math.min(rowIdx, 10) * 40}ms`,
                }}
              >
                <td className="px-6 py-4 font-medium" style={{ color: 'var(--text)' }}>{tech.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'color-mix(in oklab, var(--accent) 16%, transparent)', color: 'var(--accent)' }}>
                    {tech.active_tickets}
                  </span>
                </td>
                <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{tech.completed_tickets}</td>
                <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{tech.avg_resolution_time ? tech.avg_resolution_time.toFixed(1) : '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-full rounded-full h-2.5 mr-2" style={{ background: 'var(--surface2)' }}>
                      <div className={`h-2.5 rounded-full ${tech.score >= 90 ? 'bg-green-500' : tech.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${tech.score}%` }}></div>
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{tech.score}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No technicians found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
