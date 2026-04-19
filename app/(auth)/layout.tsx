import AuthLangSwitcher from '@/components/auth/AuthLangSwitcher'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 min-h-screen" style={{ position: 'relative' }}>
      <AuthLangSwitcher />
      {children}
    </main>
  )
}
