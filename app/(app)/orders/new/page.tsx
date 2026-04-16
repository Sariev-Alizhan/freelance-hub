import CreateOrderForm from '@/components/orders/CreateOrderForm'
import { Briefcase } from 'lucide-react'

export default function NewOrderPage() {
  return (
    <div className="min-h-[calc(100vh-52px)] py-12 px-4 sm:px-6" style={{ background: 'var(--fh-canvas)' }}>
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center h-13 w-13 rounded-xl mb-5"
            style={{
              width: '52px',
              height: '52px',
              background: 'var(--fh-primary-muted)',
              border: '1px solid rgba(94,106,210,0.2)',
            }}
          >
            <Briefcase className="h-6 w-6" style={{ color: 'var(--fh-primary)' }} />
          </div>
          <h1
            style={{
              fontSize: 'clamp(22px, 3.5vw, 30px)',
              fontWeight: 510,
              letterSpacing: '-0.04em',
              color: 'var(--fh-t1)',
              marginBottom: '8px',
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            Post a Job
          </h1>
          <p style={{ fontSize: '14px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em' }}>
            Describe your task — and get responses from top specialists
          </p>
        </div>
        <CreateOrderForm />
      </div>
    </div>
  )
}
