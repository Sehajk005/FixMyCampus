const STACK = [
  { label: 'React',      color: '#38bdf8' },
  { label: 'Node.js',    color: '#86efac' },
  { label: 'MySQL',      color: '#fb923c' },
  { label: 'Sequelize',  color: '#818cf8' },
  { label: 'Socket.io',  color: '#f1f5f9' },
];

export default function TechStackFooter() {
  return (
    <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0.6rem 1.5rem', zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.65rem', color: '#475569', marginRight: '0.25rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Stack</span>
        {STACK.map(s => (
          <span key={s.label} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: 99, background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30`, letterSpacing: '0.03em' }}>
            {s.label}
          </span>
        ))}
      </div>
    </footer>
  );
}
