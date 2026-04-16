export default function NotificationsLoading() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* toolbar skeleton */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px',
        borderBottom: '0.5px solid var(--fh-sep)',
      }}>
        <div style={{ height: 14, width: 120, borderRadius: 7, background: 'var(--fh-surface-2)' }} />
        <div style={{ height: 14, width: 64, borderRadius: 7, background: 'var(--fh-surface-2)' }} />
      </div>

      {/* rows */}
      {[...Array(10)].map((_, i) => (
        <div key={i} style={{
          display: 'flex', gap: 14, padding: '14px 16px',
          borderBottom: '0.5px solid var(--fh-sep)',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.06}s`,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--fh-surface-2)', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <div style={{ height: 13, borderRadius: 6, background: 'var(--fh-surface-2)', width: `${55 + (i % 3) * 15}%` }} />
            <div style={{ height: 11, borderRadius: 5, background: 'var(--fh-surface-2)', width: `${70 + (i % 4) * 8}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
