import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import { headers, cookies } from 'next/headers'
import './globals.css'

// Force runtime rendering so generateMetadata() below actually reads the
// request's cookie + Accept-Language. Without this, Next.js 16 prerenders
// metadata with build-time defaults (all English) even when the body tree
// is dynamic via headers() — `generateMetadata` has its own static-check.
export const dynamic = 'force-dynamic'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { CurrencyProvider } from '@/lib/context/CurrencyContext'
import { ToastProvider } from '@/lib/context/ToastContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { LanguageProvider } from '@/lib/context/LanguageContext'
import { ProfileProvider } from '@/lib/context/ProfileContext'
import type { Lang } from '@/lib/i18n/dict'
import type { Currency } from '@/lib/types'

// KZ-domain default = ru. EN is an opt-in via the language picker.
// Precedence: fh-lang cookie > Accept-Language header > ru.
function detectLang(cookieLang: string | undefined, acceptLanguage: string): Lang {
  if (cookieLang === 'ru' || cookieLang === 'en' || cookieLang === 'kz') return cookieLang
  const al = acceptLanguage.toLowerCase()
  if (al.startsWith('kk') || al.startsWith('kz')) return 'kz'
  if (al.startsWith('en')) return 'en'
  return 'ru'
}

function detectCurrency(cookieCurrency: string | undefined, lang: Lang): Currency {
  const valid: Currency[] = ['KZT', 'RUB', 'USD', 'EUR', 'GBP', 'USDT', 'UAH', 'CNY', 'AED', 'TRY']
  if (cookieCurrency && valid.includes(cookieCurrency as Currency)) return cookieCurrency as Currency
  return lang === 'en' ? 'USD' : 'KZT'
}
import Toaster from '@/components/ui/Toaster'
import MotionProvider from '@/components/providers/MotionProvider'
import DeferredUI from '@/components/providers/DeferredUI'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  // Enable variable font axes for weight 510, 590 (Linear signature weights)
  display: 'swap',
})

// Editorial display serif — landing-only, italic for extreme-contrast pairing with Inter
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif-display',
  display: 'swap',
})

const META_COPY: Record<Lang, { title: string; desc: string; descShort: string; ogLocale: string; twShort: string }> = {
  en: {
    title:     'FreelanceHub — A freelance platform you can own',
    desc:      'Work directly. No fees, no middlemen. Pay any way you want. Built in Kazakhstan, open to the world.',
    descShort: 'Work directly. 0% commission. Built in Kazakhstan, open to the world.',
    ogLocale:  'en_US',
    twShort:   '0% commission forever. Work directly from any country.',
  },
  ru: {
    title:     'FreelanceHub — Фриланс-платформа, которой ты владеешь',
    desc:      'Работай напрямую. Без комиссий, без посредников. Плати как удобно — Kaspi, USDT, перевод. Создано в Казахстане для всего мира.',
    descShort: 'Работай напрямую. 0% комиссии. Создано в Казахстане для всего мира.',
    ogLocale:  'ru_RU',
    twShort:   '0% комиссии навсегда. Работай напрямую из любой страны.',
  },
  kz: {
    title:     'FreelanceHub — Өзіңізге тиесілі фриланс-платформа',
    desc:      'Тікелей жұмыс жасаңыз. Комиссия жоқ, делдал жоқ. Қалағаныңызша төлеңіз — Kaspi, USDT, аударым. Қазақстанда жасалған.',
    descShort: 'Тікелей жұмыс жасаңыз. 0% комиссия. Қазақстанда жасалған.',
    ogLocale:  'kk_KZ',
    twShort:   '0% комиссия мәңгілік. Кез келген елден тікелей жұмыс.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const c = await cookies()
  const lang = detectLang(c.get('fh-lang')?.value, h.get('accept-language') ?? '')
  const m = META_COPY[lang]
  return {
    metadataBase: new URL('https://www.freelance-hub.kz'),
    title: { default: m.title, template: '%s' },
    description: m.desc,
    keywords: ['freelance', 'freelancers', 'remote work', 'Kazakhstan', 'jobs', 'hire', 'SITS', 'Sariyev IT Solutions', 'фриланс', 'фрилансер', 'фрилансер Казахстан', 'қашықтан жұмыс'],
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
      title:       m.title,
      description: m.descShort,
      type:        'website',
      locale:      m.ogLocale,
      siteName:    'FreelanceHub',
      url:         'https://www.freelance-hub.kz',
    },
    twitter: {
      card:        'summary_large_image',
      title:       m.title,
      description: m.twShort,
    },
    alternates: {
      canonical: 'https://www.freelance-hub.kz',
      languages: {
        'ru-RU':     'https://www.freelance-hub.kz',
        'kk-KZ':     'https://www.freelance-hub.kz',
        'en-US':     'https://www.freelance-hub.kz',
        'x-default': 'https://www.freelance-hub.kz',
      },
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#08090a' },
    { media: '(prefers-color-scheme: light)', color: '#f7f8f8' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

// Anti-FOUC: apply theme BEFORE first paint.
// Default: light (editorial paper palette per brief §9 "no dark mode v1").
// User can override via Settings → Preferences → Theme. No auto time-of-day switch.
const themeScript = `(function(){try{var m=localStorage.getItem('fh-theme-mode')||localStorage.getItem('fh-theme');if(m==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`
// Register Service Worker for push notifications + auto-reload on SW update
const swScript = `(function(){
  if(!('serviceWorker' in navigator)) return;
  // When a new SW takes control, reload once so fresh assets are used
  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if(!sessionStorage.getItem('fh-sw-reload')){
      sessionStorage.setItem('fh-sw-reload','1');
      window.location.reload();
    }
  });
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js').catch(function(){});
  });
})();`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const c = await cookies()
  const nonce = h.get('x-nonce') ?? ''
  const initialLang = detectLang(c.get('fh-lang')?.value, h.get('accept-language') ?? '')
  const initialCurrency = detectCurrency(c.get('fh-currency')?.value, initialLang)
  return (
    <html lang={initialLang} className="" suppressHydrationWarning nonce={nonce}>
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
        {/* JSON-LD: Organization + WebSite */}
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://www.freelance-hub.kz#org',
                  name: 'FreelanceHub',
                  alternateName: 'SITS Sariyev IT Solutions',
                  url: 'https://www.freelance-hub.kz',
                  logo: 'https://www.freelance-hub.kz/logo-icon.png',
                  founder: { '@type': 'Person', name: 'Alizhan Sariyev' },
                  foundingLocation: { '@type': 'Place', name: 'Almaty, Kazakhstan' },
                  sameAs: [
                    'https://github.com/Sariev-Alizhan/freelance-hub',
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://www.freelance-hub.kz#website',
                  url: 'https://www.freelance-hub.kz',
                  name: 'FreelanceHub',
                  publisher: { '@id': 'https://www.freelance-hub.kz#org' },
                  inLanguage: ['ru', 'kk', 'en'],
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://www.freelance-hub.kz/freelancers?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <MotionProvider>
        <ThemeProvider>
          <LanguageProvider initialLang={initialLang}>
          <ToastProvider>
            <CurrencyProvider initialCurrency={initialCurrency}>
              <ProfileProvider>
                {children}
                <Toaster />
                <DeferredUI />
              </ProfileProvider>
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
