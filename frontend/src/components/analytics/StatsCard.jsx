
export default function StatsCard({ title, value, icon, color }) {
  const colorMap = {
    'border-blue-500': { border: '#3b82f6', chipBg: 'rgba(59,130,246,0.16)', chipFg: '#60a5fa' },
    'border-green-500': { border: '#22c55e', chipBg: 'rgba(34,197,94,0.16)', chipFg: '#4ade80' },
    'border-yellow-500': { border: '#eab308', chipBg: 'rgba(234,179,8,0.16)', chipFg: '#facc15' },
    'border-red-500': { border: '#ef4444', chipBg: 'rgba(239,68,68,0.16)', chipFg: '#f87171' },
    default: { border: 'var(--accent)', chipBg: 'color-mix(in oklab, var(--accent) 16%, transparent)', chipFg: 'var(--accent)' },
  };

  const selected = colorMap[color] || colorMap.default;

  return (
    <div
      className="motion-chart-panel p-6 rounded-xl shadow-md flex items-center justify-between"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${selected.border}`,
      }}
    >
      <div>
        <p className="text-sm font-medium uppercase" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text)' }}>{value}</p>
      </div>
      <div className="p-4 rounded-full" style={{ background: selected.chipBg, color: selected.chipFg }}>
        {icon}
      </div>
    </div>
  );
}
