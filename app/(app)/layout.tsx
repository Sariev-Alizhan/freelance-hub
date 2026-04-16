import Header from '@/components/layout/Header'
import AppFooter from '@/components/layout/AppFooter'
import BottomNav from '@/components/layout/BottomNav'
import LeftSidebar from '@/components/layout/LeftSidebar'
import PageTransition from '@/components/shared/PageTransition'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LeftSidebar />
      <Header />
      <main className="flex-1 pb-safe-mobile md:ml-[72px]">
        <PageTransition>{children}</PageTransition>
      </main>
      <div className="md:ml-[72px]">
        <AppFooter />
      </div>
      <BottomNav />
    </>
  )
}
