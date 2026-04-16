import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/landing/HeroSection'
import AppPreviewSection from '@/components/landing/AppPreviewSection'
import AIFeaturesSection from '@/components/landing/AIFeaturesSection'
import AgentsSection from '@/components/landing/AgentsSection'
import CategoriesSection from '@/components/landing/CategoriesSection'
import TopFreelancers from '@/components/landing/TopFreelancers'
import HowItWorks from '@/components/landing/HowItWorks'
import CTASection from '@/components/landing/CTASection'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/feed')

  // Force dark CSS variables so the landing is always dark regardless of user theme
  const darkVars = {
    '--fh-canvas':     '#08090a',
    '--fh-surface':    'rgba(255,255,255,0.02)',
    '--fh-surface-2':  'rgba(255,255,255,0.03)',
    '--fh-surface-3':  'rgba(255,255,255,0.04)',
    '--fh-border':     'rgba(255,255,255,0.06)',
    '--fh-border-2':   'rgba(255,255,255,0.10)',
    '--fh-sep':        'rgba(255,255,255,0.05)',
    '--fh-t1':         '#f7f8f8',
    '--fh-t2':         '#d0d6e0',
    '--fh-t3':         '#9ea4ae',
    '--fh-t4':         '#797e87',
    '--fh-header-bg':  'rgba(8,9,10,0.88)',
    '--fh-footer-bg':  '#08090a',
  } as React.CSSProperties

  return (
    <div style={{ background: '#060612', ...darkVars }}>
      <HeroSection />
      <AppPreviewSection />
      <AIFeaturesSection />
      <AgentsSection />
      <CategoriesSection />
      <TopFreelancers />
      <HowItWorks />
      <CTASection />
    </div>
  )
}
