import { ImageResponse } from 'next/og'

export const alt = 'FreelanceHub — Заказы для фрилансеров'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: '#0d0e11', padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(39,166,68,0.15) 0%, transparent 70%)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '60px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '10px', background: '#27a644',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 700, color: '#fff',
          }}>F</div>
          <span style={{ fontSize: '22px', fontWeight: 600, color: '#f7f8f8', letterSpacing: '-0.02em' }}>
            FreelanceHub
          </span>
        </div>

        <div style={{
          fontSize: '76px', fontWeight: 700, color: '#f7f8f8',
          letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '24px',
          display: 'flex', flexDirection: 'column', whiteSpace: 'pre',
        }}>{'Найди проект\nв своей сфере'}</div>

        <div style={{
          fontSize: '26px', color: '#8a8f98', fontWeight: 400,
          marginBottom: 'auto', maxWidth: '900px', lineHeight: 1.4,
        }}>
          Заказы от клиентов СНГ — разработка, дизайн, маркетинг, AI и не только.
        </div>

        <div style={{ display: 'flex', gap: '14px', marginBottom: '30px' }}>
          {['0% комиссии', 'Прямые выплаты', 'AI-подбор'].map(t => (
            <div key={t} style={{
              padding: '10px 20px', borderRadius: '8px',
              background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.25)',
              fontSize: '18px', fontWeight: 600, color: '#27a644',
            }}>{t}</div>
          ))}
        </div>

        <div style={{ fontSize: '18px', color: '#4a4f57' }}>freelance-hub.kz/orders</div>
      </div>
    ),
    { ...size }
  )
}
