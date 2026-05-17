import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function PieChart({ data, nameKey, dataKey }) {
  return (
    <div className="motion-chart-panel p-4 rounded-xl shadow-md h-80" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface2)',
              color: 'var(--text)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.18)'
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ color: 'var(--text-muted)' }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
