import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/landing/HeroSection'

// Below-the-fold sections load their framer-motion + content chunks after
// hero is painted. Each still SSRs (ssr stays default true), so SEO crawlers
// see the full DOM — only client-side JS is deferred. This shaves ~120KB
// off the hero's critical path (measured via Lighthouse unused-js audit).
const AppPreviewSection = dynamic(() => import('@/components/landing/AppPreviewSection'))
const AIFeaturesSection = dynamic(() => import('@/components/landing/AIFeaturesSection'))
const AgentsSection     = dynamic(() => import('@/components/landing/AgentsSection'))
const CategoriesSection = dynamic(() => import('@/components/landing/CategoriesSection'))
const TopFreelancers    = dynamic(() => import('@/components/landing/TopFreelancers'))
const HowItWorks        = dynamic(() => import('@/components/landing/HowItWorks'))
const CTASection        = dynamic(() => import('@/components/landing/CTASection'))

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/feed')

  return (
    <>
      <HeroSection />
      <AppPreviewSection />
      <AIFeaturesSection />
      <AgentsSection />
      <CategoriesSection />
      <TopFreelancers />
      <HowItWorks />
      <CTASection />
    </>
  )
}
