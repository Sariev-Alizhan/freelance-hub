import CreateOrderForm from '@/components/orders/CreateOrderForm'
import { Briefcase } from 'lucide-react'

export default function NewOrderPage() {
  return (
    <div className="min-h-[calc(100vh-52px)] py-12 px-4 sm:px-6" style={{ background: '#08090a' }}>
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center h-13 w-13 rounded-xl mb-5"
            style={{
              width: '52px',
              height: '52px',
              background: 'rgba(94,106,210,0.1)',
              border: '1px solid rgba(94,106,210,0.2)',
            }}
          >
            <Briefcase className="h-6 w-6" style={{ color: '#7170ff' }} />
          </div>
          <h1
            style={{
              fontSize: 'clamp(22px, 3.5vw, 30px)',
              fontWeight: 510,
              letterSpacing: '-0.04em',
              color: '#f7f8f8',
              marginBottom: '8px',
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            Новый заказ
          </h1>
          <p style={{ fontSize: '14px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em' }}>
            Опишите задачу — и получите отклики от лучших специалистов
          </p>
        </div>
        <CreateOrderForm />
      </div>
    </div>
  )
}
