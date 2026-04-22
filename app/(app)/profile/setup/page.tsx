import FreelancerSetupForm from '@/components/profile/FreelancerSetupForm'
import { UserCircle2 } from 'lucide-react'

export default function ProfileSetupPage() {
  return (
    <div className="min-h-[calc(100vh-52px)] py-12 px-4 sm:px-6" style={{ background: 'var(--fh-canvas)' }}>
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center rounded-xl mb-5"
            style={{
              width: '52px',
              height: '52px',
              background: 'rgba(39,166,68,0.1)',
              border: '1px solid rgba(39,166,68,0.2)',
            }}
          >
            <UserCircle2 className="h-6 w-6" style={{ color: '#27a644' }} />
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
            Profile setup
          </h1>
          <p style={{ fontSize: '14px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em' }}>
            Fill in your profile — it helps clients find exactly you
          </p>
        </div>
        <FreelancerSetupForm />
      </div>
    </div>
  )
}
