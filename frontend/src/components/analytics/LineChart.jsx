import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LineChart({ data, xAxisKey, dataKey, stroke = "#10b981" }) {
  return (
    <div className="motion-chart-panel p-4 rounded-xl shadow-md h-80" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.18)'
            }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
