import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FreelancersClient from '@/app/(app)/freelancers/FreelancersClient'
import { CATEGORIES } from '@/lib/mock/categories'
import { Freelancer } from '@/lib/types'

interface Props {
  params: Promise<{ category: string }>
}

const SITE_URL = 'https://www.freelance-hub.kz'

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'dev':         'Hire top web and mobile developers. React, Next.js, Node.js, Python, iOS, Android and more.',
  'ux-ui':       'Find experienced UX/UI designers. Figma, web interfaces, mobile apps, prototypes and wireframes.',
  'smm':         'Social media marketing specialists. Instagram, TikTok, VK — content, growth and engagement.',
  'targeting':   'Paid ads professionals. Google Ads, Meta Ads, targeted campaigns with proven ROI.',
  'copywriting': 'Professional copywriters for landing pages, ads, SEO articles and email campaigns.',
  'video':       'Video editors and motion designers. YouTube, Reels, corporate videos and animations.',
  'tg-bots':     'Telegram bot developers. Automation, shop bots, notification systems and custom integrations.',
  'ai-ml':       'AI and machine learning engineers. Model training, data pipelines, LLM integrations.',
  'nocode':      'No-code and low-code specialists. Webflow, Bubble, Make, Zapier and automation workflows.',
  '3d-art':      '3D artists and AI art creators. Product visualization, concept art, renders and illustrations.',
}

const CATEGORY_FAQ: Record<string, { q: string; a: string }[]> = {
  'dev':         [
    { q: 'Сколько стоит нанять разработчика на FreelanceHub?', a: 'Цены начинаются от 5 000 ₸/час. Средняя стоимость проекта — от 50 000 до 500 000 ₸ в зависимости от сложности.' },
    { q: 'Как быстро найти разработчика в Казахстане?', a: 'Опубликуйте заказ — первые отклики появятся в течение нескольких часов. Большинство клиентов находят исполнителя за 1–2 дня.' },
    { q: 'Какие технологии охватывают разработчики на платформе?', a: 'React, Next.js, Vue, Node.js, Python, Django, iOS (Swift), Android (Kotlin), PostgreSQL, Supabase и многое другое.' },
  ],
  'ux-ui':       [
    { q: 'Сколько стоит UX/UI дизайн в Казахстане?', a: 'Стоимость зависит от объёма: экран мобильного приложения — от 5 000 ₸, полный дизайн сайта — от 80 000 ₸.' },
    { q: 'Работают ли дизайнеры в Figma?', a: 'Да, все UX/UI дизайнеры на платформе работают в Figma и передают исходные файлы.' },
    { q: 'Могу ли я заказать редизайн существующего сайта?', a: 'Конечно. Укажите это в заказе и прикрепите ссылку на текущий сайт.' },
  ],
  'smm':         [
    { q: 'Что включает SMM-услуга?', a: 'Создание контент-плана, написание текстов, дизайн публикаций, публикация, общение с аудиторией и ежемесячная аналитика.' },
    { q: 'Какие соцсети охватывают SMM-специалисты?', a: 'Instagram, TikTok, ВКонтакте, Telegram, Facebook, YouTube. Выберите нужные платформы в заказе.' },
    { q: 'Как оплачивать SMM-услуги — разово или ежемесячно?', a: 'Оба варианта доступны. Большинство клиентов предпочитают ежемесячное сотрудничество.' },
  ],
  'targeting':   [
    { q: 'Каков минимальный рекламный бюджет для работы с таргетологом?', a: 'Обычно от 50 000 ₸/мес на рекламу плюс оплата специалиста. Некоторые работают от 20 000 ₸.' },
    { q: 'Работают ли таргетологи с Google Ads и Meta?', a: 'Да, специалисты на платформе работают с Google Ads, Meta Ads, TikTok Ads и другими платформами.' },
    { q: 'Как быстро получить первые результаты от таргетированной рекламы?', a: 'Первые результаты обычно видны через 3–7 дней после запуска и оптимизации кампаний.' },
  ],
  'copywriting': [
    { q: 'Сколько стоит написание текстов для сайта?', a: 'SEO-статья — от 5 000 ₸, лендинг целиком — от 20 000 ₸, email-серия — от 15 000 ₸.' },
    { q: 'Пишут ли копирайтеры SEO-оптимизированные тексты?', a: 'Да. Укажите в заказе ключевые слова и требования к SEO — копирайтер учтёт их при написании.' },
    { q: 'Как долго пишется лендинг?', a: 'Стандартный лендинг пишется за 2–5 дней в зависимости от объёма и правок.' },
  ],
  'video':       [
    { q: 'Сколько стоит монтаж видео в Казахстане?', a: 'Короткий Reels — от 3 000 ₸, корпоративное видео (3–5 мин) — от 30 000 ₸, продакшн под ключ — от 100 000 ₸.' },
    { q: 'Какие форматы видео доступны?', a: 'YouTube, Instagram Reels, TikTok, корпоративные презентации, рекламные ролики, анимации.' },
    { q: 'Нужно ли предоставлять исходные материалы?', a: 'Да, видеоредакторам нужны исходные файлы. Некоторые специалисты также предлагают съёмку.' },
  ],
  'tg-bots':     [
    { q: 'Сколько стоит разработка Telegram-бота?', a: 'Простой бот — от 15 000 ₸, бот с базой данных и интеграциями — от 50 000 ₸, комплексный — от 150 000 ₸.' },
    { q: 'На каком языке разрабатываются боты?', a: 'Python (aiogram, python-telegram-bot) и Node.js — самые популярные на платформе.' },
    { q: 'Возможна ли интеграция с платёжными системами?', a: 'Да: Kaspi, Stripe, ЮKassa и другие системы. Уточните требования в заказе.' },
  ],
  'ai-ml':       [
    { q: 'Чем занимаются AI/ML специалисты на платформе?', a: 'Разработка моделей машинного обучения, интеграция LLM (GPT, Claude), Computer Vision, NLP и автоматизация данных.' },
    { q: 'Возможна ли интеграция ChatGPT/Claude в продукт?', a: 'Да. Специалисты настраивают Anthropic Claude API и OpenAI API, разрабатывают кастомные агенты.' },
    { q: 'Нужен ли датасет для работы с ML-специалистом?', a: 'Зависит от задачи. Некоторые специалисты помогают собрать и разметить данные с нуля.' },
  ],
  'nocode':      [
    { q: 'Что можно создать без кода (no-code)?', a: 'Сайты, мобильные приложения, CRM-системы, автоматизации, интернет-магазины — всё через Webflow, Bubble, Make, Zapier.' },
    { q: 'Дешевле ли no-code разработка по сравнению с обычной?', a: 'Как правило, да. No-code проекты создаются быстрее и дешевле, но имеют ограничения для очень сложных продуктов.' },
    { q: 'Какие no-code инструменты используют специалисты на платформе?', a: 'Webflow, Bubble, Tilda, Framer, Make (Integromat), Zapier, n8n, Airtable, Notion.' },
  ],
  '3d-art':      [
    { q: 'Что создают 3D-художники и AI-иллюстраторы?', a: 'Продуктовые визуализации, концепт-арт, NFT-коллекции, архитектурные рендеры, персонажи и AI-иллюстрации.' },
    { q: 'Сколько стоит 3D-визуализация продукта?', a: 'Простой рендер одного продукта — от 10 000 ₸, полная сцена с несколькими ракурсами — от 40 000 ₸.' },
    { q: 'Используют ли художники Midjourney и Stable Diffusion?', a: 'Да. AI-арт и традиционный 3D часто комбинируются для достижения лучшего результата.' },
  ],
}

export async function generateStaticParams() {
  return CATEGORIES.map(c => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = CATEGORIES.find(c => c.slug === category)
  if (!cat) return { title: 'Not Found' }

  const title = `${cat.label} Freelancers — FreelanceHub`
  const description = CATEGORY_DESCRIPTIONS[category] ?? `Find the best ${cat.label} freelancers on FreelanceHub.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: { canonical: `/freelancers/category/${category}` },
  }
}

async function fetchFreelancers(category: string): Promise<Freelancer[]> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data, error } = await db
      .from('freelancer_profiles')
      .select(`
        user_id, title, category, skills, price_from, price_to,
        level, response_time, languages, is_verified, is_premium,
        rating, reviews_count, completed_orders, availability_status,
        profiles!inner(full_name, username, avatar_url, location)
      `)
      .eq('category', category)
      .order('rating', { ascending: false })
      .limit(60)

    if (error || !data) return []

    return data.map((fp: any): Freelancer => {
      const prof = fp.profiles
      const name = prof?.full_name || prof?.username || 'Freelancer'
      return {
        id: fp.user_id,
        name,
        avatar: prof?.avatar_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4338CA&textColor=ffffff`,
        title: fp.title,
        category: fp.category,
        skills: fp.skills ?? [],
        rating: fp.rating ?? 0,
        reviewsCount: fp.reviews_count ?? 0,
        completedOrders: fp.completed_orders ?? 0,
        responseTime: fp.response_time ?? '1 day',
        priceFrom: fp.price_from ?? 0,
        priceTo: fp.price_to ?? undefined,
        location: prof?.location ?? 'Remote',
        isOnline: false,
        isVerified: fp.is_verified ?? false,
        isPremium: fp.is_premium ?? false,
        portfolio: [],
        description: '',
        level: fp.level ?? 'middle',
        languages: fp.languages ?? [],
        registeredAt: '',
        availability: fp.availability_status ?? 'open',
      }
    })
  } catch {
    return []
  }
}

const CAT_EMOJI: Record<string, string> = {
  dev: '💻', 'ux-ui': '🎨', smm: '📱', targeting: '🎯',
  copywriting: '✍️', video: '🎬', 'tg-bots': '🤖',
  'ai-ml': '🧠', nocode: '⚡', '3d-art': '🎭',
}

export default async function FreelancersCategoryPage({ params }: Props) {
  const { category } = await params
  const cat = CATEGORIES.find(c => c.slug === category)
  if (!cat) notFound()

  const freelancers = await fetchFreelancers(category)
  const desc = CATEGORY_DESCRIPTIONS[category] ?? `Find the best ${cat.label} freelancers.`
  const faqs = CATEGORY_FAQ[category] ?? []
  const related = CATEGORIES.filter(c => c.slug !== category).slice(0, 5)

  // JSON-LD: FAQPage + BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'FreelanceHub', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Freelancers', item: `${SITE_URL}/freelancers` },
          { '@type': 'ListItem', position: 3, name: cat.label, item: `${SITE_URL}/freelancers/category/${category}` },
        ],
      },
      ...(faqs.length > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }] : []),
    ],
  }

  return (
    <>
      <Script
        id={`jsonld-${category}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Category hero */}
      <div className="border-b border-subtle" style={{ background: `${cat.color}08` }}>
        <div className="page-shell page-shell--wide">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
              <span style={{ fontSize: '18px' }}>{CAT_EMOJI[category] ?? '🌐'}</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
              {cat.label} — Фрилансеры в Казахстане
            </h1>
            {freelancers.length > 0 && (
              <span className="text-sm px-2 py-0.5 rounded-full"
                style={{ background: `${cat.color}12`, color: cat.color, fontWeight: 590 }}>
                {freelancers.length}
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--fh-t3)', maxWidth: '540px' }}>{desc}</p>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mt-3">
            <ol style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--fh-t4)', listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link href="/" style={{ color: 'var(--fh-t4)', textDecoration: 'none' }}>FreelanceHub</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/freelancers" style={{ color: 'var(--fh-t4)', textDecoration: 'none' }}>Фрилансеры</Link></li>
              <li aria-hidden="true">/</li>
              <li style={{ color: 'var(--fh-t2)' }}>{cat.label}</li>
            </ol>
          </nav>
        </div>
      </div>

      <Suspense>
        <FreelancersClient realFreelancers={freelancers} defaultCategory={category as any} />
      </Suspense>

      {/* FAQ section */}
      {faqs.length > 0 && (
        <div className="page-shell page-shell--wide">
          <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fh-t1)', marginBottom: '24px' }}>
            Частые вопросы о {cat.label.toLowerCase()} фрилансерах
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '720px' }}>
            {faqs.map((faq, i) => (
              <details
                key={i}
                style={{
                  borderRadius: '12px', border: '1px solid var(--fh-border-2)',
                  background: 'var(--card)', overflow: 'hidden',
                }}
              >
                <summary style={{
                  padding: '16px 20px', fontSize: '14px', fontWeight: 600,
                  color: 'var(--fh-t1)', cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {faq.q}
                  <span style={{ color: 'var(--fh-t4)', fontSize: '20px', lineHeight: 1, flexShrink: 0, marginLeft: '12px' }}>+</span>
                </summary>
                <div style={{ padding: '0 20px 16px', fontSize: '14px', color: 'var(--fh-t3)', lineHeight: 1.65 }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Related categories */}
      <div className="page-shell page-shell--wide" style={{ paddingTop: 0 }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fh-t1)', marginBottom: '12px' }}>
          Другие категории
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {related.map(r => (
            <Link
              key={r.slug}
              href={`/freelancers/category/${r.slug}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 510,
                background: `${r.color}10`, border: `1px solid ${r.color}20`,
                color: r.color, textDecoration: 'none',
              }}
            >
              {CAT_EMOJI[r.slug] ?? '🌐'} {r.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
