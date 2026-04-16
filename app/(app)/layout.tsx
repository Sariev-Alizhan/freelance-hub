import Header from '@/components/layout/Header'
import AppFooter from '@/components/layout/AppFooter'
import BottomNav from '@/components/layout/BottomNav'
import LeftSidebar from '@/components/layout/LeftSidebar'
import PageTransition from '@/components/shared/PageTransition'
import MainWrapper from './MainWrapper'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LeftSidebar />
      <Header />
      <MainWrapper>
        <PageTransition>{children}</PageTransition>
      </MainWrapper>
      <div className="md:ml-[72px]">
        <AppFooter />
      </div>
      <BottomNav />
    </>
  )
}
