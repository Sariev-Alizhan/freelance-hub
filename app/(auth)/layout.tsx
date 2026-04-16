export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 min-h-screen">
      {children}
    </main>
  )
}
