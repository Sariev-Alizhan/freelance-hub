import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { CurrencyProvider } from '@/lib/context/CurrencyContext'
import { ToastProvider } from '@/lib/context/ToastContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { LanguageProvider } from '@/lib/context/LanguageContext'
import { ProfileProvider } from '@/lib/context/ProfileContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import Toaster from '@/components/ui/Toaster'
import PageTransition from '@/components/shared/PageTransition'
import MotionProvider from '@/components/providers/MotionProvider'
import DeferredUI from '@/components/providers/DeferredUI'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  // Enable variable font axes for weight 510, 590 (Linear signature weights)
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.freelance-hub.kz'),
  title: {
    default: 'FreelanceHub — Decentralized Freelance Platform',
    template: '%s | FreelanceHub',
  },
  description:
    'Work directly. No fees, no middlemen. Pay any way you want. Built in Kazakhstan, open to the world.',
  keywords: ['freelance', 'freelancers', 'remote work', 'Kazakhstan', 'jobs', 'hire', 'SITS', 'Sariyev IT Solutions', 'фриланс'],
  authors: [{ name: 'Alizhan Sariyev · SITS Sariyev IT Solutions' }],
  creator: 'SITS Sariyev IT Solutions',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FreelanceHub' },
  icons: {
    icon: [
      { url: '/favicon.ico',  sizes: 'any' },
      { url: '/logo-icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/icon-192.png',  type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'FreelanceHub — Decentralized Freelance Platform',
    description: 'Work directly. 0% commission. Built in Kazakhstan, open to the world.',
    type: 'website', locale: 'en_US', siteName: 'FreelanceHub',
    url: 'https://www.freelance-hub.kz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreelanceHub — Decentralized Freelance Platform',
    description: '0% commission forever. Work directly from any country.',
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

// Anti-FOUC: apply theme BEFORE first paint.
// Reads fh-theme-mode: 'auto' | 'dark' | 'light' (falls back to old fh-theme key).
// Auto default: 6am–8pm = light, otherwise dark.
const themeScript = `(function(){try{var m=localStorage.getItem('fh-theme-mode')||localStorage.getItem('fh-theme');var r;if(m==='dark'){r='dark'}else if(m==='light'){r='light'}else{var h=new Date().getHours();r=(h>=6&&h<20)?'light':'dark'}if(r==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})();`
// Register Service Worker for PWA
const swScript = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? ''
  return (
    <html lang="en" className="dark" suppressHydrationWarning nonce={nonce}>
      <head>
        {/* Anti-FOUC — must run synchronously before any render */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Service Worker for PWA */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: swScript }} />
        {/* Preconnect to external origins for Lighthouse performance */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://kkvmxtwpgvubwtcalzjm.supabase.co'} />
        <link rel="preconnect" href="https://api.dicebear.com" />
        <link rel="dns-prefetch" href="https://open.er-api.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FreelanceHub" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <MotionProvider>
        <ThemeProvider>
          <LanguageProvider>
          <ToastProvider>
            <CurrencyProvider>
              <ProfileProvider>
              <Header />
              <main className="flex-1 pb-safe-mobile">
                <PageTransition>{children}</PageTransition>
              </main>
              </ProfileProvider>
              <Footer />
              <BottomNav />
              <Toaster />
              <DeferredUI />
            </CurrencyProvider>
          </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
        </MotionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
