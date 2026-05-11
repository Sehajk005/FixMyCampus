import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../api/firebase';

export default function CampusHeatmap() {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    const heatRef = ref(db, 'heatmap');
    onValue(heatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Data is like { "Hostel_A": 5, "Library": 2 }
        const formatted = Object.keys(data).map(loc => ({
          location: loc.replace(/_/g, ' '), // Unsanitize
          count: data[loc],
        })).sort((a, b) => b.count - a.count);
        setHeatmapData(formatted);
      } else {
        setHeatmapData([]);
      }
    });

    return () => off(heatRef);
  }, []);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.85rem', padding: '1.1rem', height: '100%' }}>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <span>🔥</span> Campus Issue Frequency
      </h3>
      {heatmapData.length === 0 ? (
        <p className="italic text-sm" style={{ color: 'var(--text-muted)' }}>No recent activity detected.</p>
      ) : (
        <ul className="space-y-3">
          {heatmapData.map((item, idx) => {
            const heatColor = item.count > 10
              ? 'color-mix(in oklab, var(--danger) 80%, var(--warning))'
              : item.count > 5
                ? 'var(--warning)'
                : 'color-mix(in oklab, var(--warning) 70%, var(--success))';
            const widthPct = Math.min(100, item.count * 10);
            
            return (
              <li
                key={idx}
                className="flex flex-col gap-1 motion-row-enter"
                style={{ animationDelay: `${Math.min(idx, 10) * 42}ms` }}
              >
                <div className="flex justify-between items-center text-sm font-medium" style={{ color: 'var(--text)' }}>
                  <span>{item.location}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ color: 'var(--text-muted)', background: 'var(--surface2)', border: '1px solid var(--border)' }}>{item.count} tickets</span>
                </div>
                <div className="heat-bar-track">
                  <div
                    className="heat-bar-fill"
                    style={{
                      background: heatColor,
                      transform: `scaleX(${Math.min(1, widthPct / 100)})`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
