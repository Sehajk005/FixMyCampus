export default function PageLoading({ label = 'Loading…' }) {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <div className="page-loading-inner motion-surface-enter">
        <div className="page-loading-bar skeleton" />
        <div className="page-loading-bar skeleton" style={{ width: '72%' }} />
        <div className="page-loading-bar skeleton" style={{ width: '56%' }} />
      </div>
      <span className="page-loading-label">{label}</span>
    </div>
  );
}
