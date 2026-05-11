import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BarChart({ data, dataKey, xAxisKey, fill = "#3b82f6" }) {
  return (
    <div className="motion-chart-panel p-4 rounded-xl shadow-md h-80" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.18)'
            }}
          />
          <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
