import HeroSection from '@/components/landing/HeroSection'
import CategoriesSection from '@/components/landing/CategoriesSection'
import TopFreelancers from '@/components/landing/TopFreelancers'
import HowItWorks from '@/components/landing/HowItWorks'
import AIFeaturesSection from '@/components/landing/AIFeaturesSection'
import CTASection from '@/components/landing/CTASection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <TopFreelancers />
      <HowItWorks />
      <AIFeaturesSection />
      <CTASection />
    </>
  )
}
