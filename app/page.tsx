import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/landing/HeroSection'
import AppPreviewSection from '@/components/landing/AppPreviewSection'
import CategoriesSection from '@/components/landing/CategoriesSection'
import TopFreelancers from '@/components/landing/TopFreelancers'
import HowItWorks from '@/components/landing/HowItWorks'
import AIFeaturesSection from '@/components/landing/AIFeaturesSection'
import AgentsSection from '@/components/landing/AgentsSection'
import CTASection from '@/components/landing/CTASection'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/feed')

  return (
    // Force dark landing — the hero always renders on a dark canvas
    <div style={{ background: '#060612' }}>
      <HeroSection />
      <AppPreviewSection />

      {/* Transition wrapper: dark → site theme */}
      <div style={{
        background: 'linear-gradient(to bottom, #060612 0%, var(--fh-canvas) 100%)',
        paddingTop: 60,
      }}>
        <CategoriesSection />
      </div>

      <TopFreelancers />
      <HowItWorks />
      <AIFeaturesSection />
      <AgentsSection />
      {/* Extra bottom padding on mobile for sticky CTA bar */}
      <div className="md:pb-0 pb-24">
        <CTASection />
      </div>
    </div>
  )
}
