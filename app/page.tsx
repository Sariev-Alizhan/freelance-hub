import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/landing/HeroSection'
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
    <>
      <HeroSection />
      <CategoriesSection />
      <TopFreelancers />
      <HowItWorks />
      <AIFeaturesSection />
      <AgentsSection />
      <CTASection />
    </>
  )
}
