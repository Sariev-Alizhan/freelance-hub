import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { CurrencyProvider } from '@/lib/context/CurrencyContext'
import { ToastProvider } from '@/lib/context/ToastContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import Toaster from '@/components/ui/Toaster'
import InstallPrompt from '@/components/shared/InstallPrompt'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  // Enable variable font axes for weight 510, 590 (Linear signature weights)
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://freelance-hub-gamma.vercel.app'),
  title: {
    default: 'FreelanceHub — фриланс-платформа для СНГ',
    template: '%s | FreelanceHub',
  },
  description:
    'Найдите лучших фрилансеров для вашего проекта или получайте заказы. AI-подбор специалистов, современные профессии, рынок СНГ.',
  keywords: ['фриланс', 'фрилансеры', 'заказы', 'удалённая работа', 'СНГ', 'Россия', 'Казахстан', 'Украина'],
  authors: [{ name: 'FreelanceHub' }],
  creator: 'FreelanceHub',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FreelanceHub' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    title: 'FreelanceHub — фриланс-платформа для СНГ',
    description: 'Находите фрилансеров и заказы с AI-подбором',
    type: 'website', locale: 'ru_RU', siteName: 'FreelanceHub',
    url: 'https://freelance-hub-gamma.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreelanceHub — фриланс-платформа для СНГ',
    description: 'Находите фрилансеров и заказы с AI-подбором',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#08090a' },
    { media: '(prefers-color-scheme: light)', color: '#f7f8f8' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Anti-FOUC: apply saved theme BEFORE first paint.
// Default = dark. Only remove 'dark' if user explicitly chose 'light'.
const themeScript = `(function(){try{var t=localStorage.getItem('fh-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC — must run synchronously before any render */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FreelanceHub" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <ToastProvider>
            <CurrencyProvider>
              <Header />
              <main className="flex-1 pb-safe-mobile">{children}</main>
              <Footer />
              <BottomNav />
              <Toaster />
              <InstallPrompt />
            </CurrencyProvider>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
