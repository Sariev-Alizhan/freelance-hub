// ════════════════════════════════════════════════════════════════════════════
// NEXUS MISSION CONTROL — AI Department Registry
// Every department proposes updates. CEO (Alizhan) accepts/rejects.
// Accepted items → batch prompt → Claude implements.
// ════════════════════════════════════════════════════════════════════════════

export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type Category = 'feature' | 'bug' | 'security' | 'design' | 'marketing' | 'performance' | 'infra'

export interface NexusProposal {
  id:          string
  deptId:      string
  priority:    Priority
  category:    Category
  titleRu:     string
  titleEn:     string
  descRu:      string
  descEn:      string
  effort:      'xs' | 's' | 'm' | 'l' | 'xl'  // dev effort estimate
  impact:      1 | 2 | 3 | 4 | 5               // business impact 1-5
  promptHint:  string                           // hint for Claude when implementing
  version:     string                           // e.g. "v2.4.1"
}

export interface NexusDepartment {
  id:       string
  nameEn:   string
  nameRu:   string
  agentId:  string        // e.g. "Atlas_AI"
  role:     string        // human-readable role
  emoji:    string
  color:    string
  desc:     string
  proposals: NexusProposal[]
}

export const DEPARTMENTS: NexusDepartment[] = [

  // ── ATLAS_AI — Product Management ──────────────────────────────────────
  {
    id: 'product',
    nameEn: 'Product Management',
    nameRu: 'Управление продуктом',
    agentId: 'Atlas_AI',
    role: 'Chief Product Officer',
    emoji: '🗺',
    color: '#7170ff',
    desc: 'Roadmap, feature prioritization, user research, OKRs.',
    proposals: [
      {
        id: 'p01', deptId: 'product', priority: 'high', category: 'feature',
        titleEn: 'Saved Search Filters',
        titleRu: 'Сохранённые фильтры поиска',
        descEn: 'Let users save their search criteria (category, budget range, skills) and reload them with one click.',
        descRu: 'Позволить пользователям сохранять поисковые критерии (категория, бюджет, навыки) и восстанавливать их в один клик.',
        effort: 's', impact: 4,
        promptHint: 'Add a "Save filter" button to /freelancers and /orders pages. Store in localStorage and add a "Saved searches" dropdown in the search bar.',
        version: 'v2.5.0',
      },
      {
        id: 'p02', deptId: 'product', priority: 'high', category: 'feature',
        titleEn: 'Order Progress Milestones',
        titleRu: 'Этапы выполнения заказа',
        descEn: 'Add milestone tracking to active orders: client sets milestones, freelancer marks them done, payment releases per milestone.',
        descRu: 'Добавить трекинг этапов к активным заказам: клиент устанавливает майлстоны, фрилансер отмечает выполнение, оплата выпускается поэтапно.',
        effort: 'l', impact: 5,
        promptHint: 'Add milestone_steps JSONB column to orders table. Create MilestoneTracker component. Wire to existing OrderStatusActions.',
        version: 'v2.6.0',
      },
      {
        id: 'p03', deptId: 'product', priority: 'medium', category: 'feature',
        titleEn: 'Referral Program',
        titleRu: 'Реферальная программа',
        descEn: 'Invite friends and earn free Premium months. Both parties get 7 days Premium when referral registers.',
        descRu: 'Пригласи друга и получи бесплатные месяцы Premium. Обе стороны получают 7 дней Premium при регистрации реферала.',
        effort: 'm', impact: 4,
        promptHint: 'The referrals table already exists. Create /api/referrals/apply route. Add referral widget to dashboard. Track via profiles.referral_code.',
        version: 'v2.5.1',
      },
      {
        id: 'p04', deptId: 'product', priority: 'medium', category: 'feature',
        titleEn: 'AI Tools Marketplace',
        titleRu: 'Маркетплейс AI-инструментов',
        descEn: 'A section where developers sell their AI tools, bots, and scripts. Listings with price, demo, reviews.',
        descRu: 'Раздел где разработчики продают AI-инструменты, ботов и скрипты. Листинги с ценой, демо, отзывами.',
        effort: 'xl', impact: 5,
        promptHint: 'Create /tools page with tool listings. New Supabase table: ai_tools (id, seller_id, title, desc, price_kzt, demo_url, category, is_verified). Add to nav and sitemap.',
        version: 'v3.0.0',
      },
    ],
  },

  // ── NOVA_AI — UX/UI Design ──────────────────────────────────────────────
  {
    id: 'design',
    nameEn: 'UX/UI Design',
    nameRu: 'Дизайн и UX',
    agentId: 'Nova_AI',
    role: 'Chief Design Officer',
    emoji: '🎨',
    color: '#ec4899',
    desc: 'Visual language, component library, accessibility, mobile UX.',
    proposals: [
      {
        id: 'd01', deptId: 'design', priority: 'high', category: 'design',
        titleEn: 'Dark Mode Refinement',
        titleRu: 'Улучшение тёмной темы',
        descEn: 'Several components have incorrect contrast ratios in dark mode. Fix: order cards, modals, toast notifications. Ensure WCAG AA compliance.',
        descRu: 'У ряда компонентов неправильный контраст в тёмной теме. Исправить: карточки заказов, модальные окна, toast-уведомления. Соответствие WCAG AA.',
        effort: 's', impact: 3,
        promptHint: 'Audit globals.css CSS variables for dark mode. Fix --fh-t3 and --fh-border-2 contrast values. Test in OrderCard, RespondModal, Toaster.',
        version: 'v2.4.2',
      },
      {
        id: 'd02', deptId: 'design', priority: 'high', category: 'design',
        titleEn: 'Skeleton Loading States',
        titleRu: 'Skeleton-загрузка',
        descEn: 'Replace spinner/blank loading with skeleton screens for freelancer cards, order cards, and messages. Much smoother perceived performance.',
        descRu: 'Заменить spinner/пустую загрузку на skeleton-скрины для карточек фрилансеров, заказов и сообщений. Воспринимаемая производительность значительно улучшится.',
        effort: 'm', impact: 4,
        promptHint: 'Create SkeletonCard component with pulse animation. Use in FreelancersPage, OrdersPage, MessengerPage while loading.',
        version: 'v2.5.0',
      },
      {
        id: 'd03', deptId: 'design', priority: 'medium', category: 'design',
        titleEn: 'Mobile Bottom Sheet for Filters',
        titleRu: 'Bottom Sheet для фильтров на мобильном',
        descEn: 'On mobile, the filters for orders/freelancers should slide up as a bottom sheet, not a sidebar. Better thumb reachability.',
        descRu: 'На мобильном фильтры для заказов/фрилансеров должны появляться снизу как bottom sheet, а не сайдбар. Лучшая досягаемость для больших пальцев.',
        effort: 'm', impact: 4,
        promptHint: 'Create BottomSheet component with framer-motion slide animation. Replace current filter panel on screens < 640px.',
        version: 'v2.5.0',
      },
      {
        id: 'd04', deptId: 'design', priority: 'low', category: 'design',
        titleEn: 'Animated Page Transitions',
        titleRu: 'Анимированные переходы между страницами',
        descEn: 'Add subtle fade/slide transitions between route changes using framer-motion layout animations.',
        descRu: 'Добавить мягкие fade/slide переходы между роутами с помощью framer-motion layout animations.',
        effort: 's', impact: 3,
        promptHint: 'Wrap page content in MotionDiv with initial/animate/exit. Use AnimatePresence in app/layout.tsx or MotionProvider.',
        version: 'v2.4.3',
      },
      {
        id: 'd05', deptId: 'design', priority: 'medium', category: 'design',
        titleEn: 'Cross-Device UI Audit (Mobile-First)',
        titleRu: 'Аудит интерфейса: мобильный, планшет, ПК',
        descEn: 'Full responsive audit: iOS Safari, Android Chrome, tablets, Mac, PC. Fix button overlaps, touch targets < 44px, text overflow, Z-index conflicts.',
        descRu: 'Полный адаптивный аудит: iOS Safari, Android Chrome, планшеты, Mac, ПК. Исправить перекрытия кнопок, touch target < 44px, переполнение текста, Z-index конфликты.',
        effort: 'm', impact: 5,
        promptHint: 'Test on 320px, 375px, 428px, 768px, 1024px, 1440px. Fix BottomNav Z-index. Increase all interactive elements to min-h-[44px]. Fix OrderCard text overflow with line-clamp. Fix header 320px layout.',
        version: 'v2.5.1',
      },
      {
        id: 'd06', deptId: 'design', priority: 'high', category: 'design',
        titleEn: 'Aria-Label Accessibility for Icon Buttons',
        titleRu: 'Доступность: aria-label для кнопок-иконок',
        descEn: 'Add aria-label to all icon-only buttons across the platform. Screen readers cannot describe buttons without accessible labels.',
        descRu: 'Добавить aria-label ко всем кнопкам с иконками по всей платформе. Программы чтения экрана не могут описать кнопки без доступных меток.',
        effort: 's', impact: 3,
        promptHint: 'Search all <button> and <a> elements without text content. Add aria-label prop. Priority: Header (hamburger, theme toggle, lang switcher), Messenger (send, attach), OrderCard actions.',
        version: 'v2.5.1',
      },
    ],
  },

  // ── CIPHER_AI — Security ──────────────────────────────────────────────
  {
    id: 'security',
    nameEn: 'Security Engineering',
    nameRu: 'Безопасность',
    agentId: 'Cipher_AI',
    role: 'Chief Information Security Officer',
    emoji: '🛡',
    color: '#22c55e',
    desc: 'Threat modeling, penetration testing, auth, encryption, compliance.',
    proposals: [
      {
        id: 's01', deptId: 'security', priority: 'critical', category: 'security',
        titleEn: 'Distributed Rate Limiting (Redis)',
        titleRu: 'Распределённый rate limiting (Redis)',
        descEn: 'Current in-memory rate limiter breaks under multi-instance Vercel deployments. Replace with Upstash Redis for distributed counting.',
        descRu: 'Текущий in-memory rate limiter ломается при multi-instance деплое Vercel. Заменить на Upstash Redis для распределённого подсчёта.',
        effort: 'm', impact: 5,
        promptHint: 'Install @upstash/ratelimit and @upstash/redis. Replace lib/rateLimit.ts with Upstash Ratelimit.fixedWindow. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to env vars.',
        version: 'v2.4.3',
      },
      {
        id: 's02', deptId: 'security', priority: 'high', category: 'security',
        titleEn: 'CSP Nonce Implementation',
        titleRu: 'CSP Nonce для production',
        descEn: 'Replace unsafe-inline in script-src with nonce-based CSP. Eliminates XSS injection vector via script tags.',
        descRu: 'Заменить unsafe-inline в script-src на nonce-based CSP. Устраняет вектор XSS через script теги.',
        effort: 'm', impact: 4,
        promptHint: 'Generate crypto.randomUUID() nonce per request in proxy.ts. Inject as header. Pass to inline scripts in layout.tsx via dangerouslySetInnerHTML with nonce attribute.',
        version: 'v2.5.0',
      },
      {
        id: 's03', deptId: 'security', priority: 'high', category: 'security',
        titleEn: 'Admin RBAC via Supabase Claims',
        titleRu: 'Admin RBAC через Supabase Claims',
        descEn: 'Replace ADMIN_EMAIL env var check with Supabase JWT custom claims. More secure, supports multiple admins.',
        descRu: 'Заменить проверку ADMIN_EMAIL env var на Supabase JWT custom claims. Более безопасно, поддерживает несколько администраторов.',
        effort: 'm', impact: 4,
        promptHint: 'Add is_admin bool column to profiles. Create Supabase Edge Function to set custom JWT claim. Update admin/page.tsx auth check to use claim instead of email.',
        version: 'v2.6.0',
      },
      {
        id: 's04', deptId: 'security', priority: 'medium', category: 'security',
        titleEn: '2FA for Admin Accounts',
        titleRu: 'Двухфакторная аутентификация для адмiна',
        descEn: 'Require TOTP 2FA for the admin account. Supabase Auth supports TOTP via app_metadata.',
        descRu: 'Обязательная TOTP 2FA для аккаунта администратора. Supabase Auth поддерживает TOTP через app_metadata.',
        effort: 'm', impact: 5,
        promptHint: 'Enable Supabase MFA for the admin user. Add MFA enrollment flow to /admin settings.',
        version: 'v2.6.0',
      },
    ],
  },

  // ── FLUX_AI — Backend Engineering ─────────────────────────────────────
  {
    id: 'backend',
    nameEn: 'Backend Engineering',
    nameRu: 'Бэкенд разработка',
    agentId: 'Flux_AI',
    role: 'VP of Engineering',
    emoji: '⚙️',
    color: '#f59e0b',
    desc: 'APIs, database, performance, integrations, infrastructure.',
    proposals: [
      {
        id: 'b01', deptId: 'backend', priority: 'high', category: 'performance',
        titleEn: 'Database Query Optimization',
        titleRu: 'Оптимизация запросов к БД',
        descEn: 'Add composite indexes on orders(category, created_at), freelancer_profiles(category, rating), messages(conversation_id, created_at). Expected 3-5x query speedup.',
        descRu: 'Добавить составные индексы на orders(category, created_at), freelancer_profiles(category, rating), messages(conversation_id, created_at). Ожидаемое ускорение 3-5x.',
        effort: 's', impact: 5,
        promptHint: 'Run these SQL migrations via Supabase Management API: CREATE INDEX IF NOT EXISTS idx_orders_cat_created ON orders(category, created_at DESC); CREATE INDEX IF NOT EXISTS idx_fp_cat_rating ON freelancer_profiles(category, rating DESC); CREATE INDEX IF NOT EXISTS idx_msg_conv_created ON messages(conversation_id, created_at DESC);',
        version: 'v2.4.2',
      },
      {
        id: 'b02', deptId: 'backend', priority: 'high', category: 'feature',
        titleEn: 'Real-time Notifications via Supabase Realtime',
        titleRu: 'Реальные уведомления через Supabase Realtime',
        descEn: 'Subscribe to notifications table changes so users see new notifications without page refresh. Currently requires manual reload.',
        descRu: 'Подписаться на изменения таблицы notifications, чтобы пользователи видели новые уведомления без перезагрузки. Сейчас требуется ручное обновление.',
        effort: 'm', impact: 4,
        promptHint: 'In Header.tsx or a new NotificationBell component, subscribe to supabase.channel().on("postgres_changes", {table: "notifications", filter: `user_id=eq.${userId}`}). Update badge count in real-time.',
        version: 'v2.5.0',
      },
      {
        id: 'b03', deptId: 'backend', priority: 'medium', category: 'infra',
        titleEn: 'Redis Cache for Live Exchange Rates',
        titleRu: 'Redis кэш для курсов валют',
        descEn: 'Fetch live exchange rates from an open API (exchangerate.host or fixer.io free tier) and cache in Upstash Redis for 1 hour. Replace hardcoded rates in lib/utils/currency.ts.',
        descRu: 'Получать живые курсы валют с открытого API (exchangerate.host или fixer.io) и кэшировать в Upstash Redis на 1 час. Заменить захардкоденные курсы в lib/utils/currency.ts.',
        effort: 'm', impact: 3,
        promptHint: 'Create /api/rates GET endpoint. Fetch from https://open.er-api.com/v6/latest/RUB (free, no key). Cache in Redis or just use fetch next.revalidate=3600.',
        version: 'v2.5.1',
      },
    ],
  },

  // ── PRISM_AI — Marketing ──────────────────────────────────────────────
  {
    id: 'marketing',
    nameEn: 'Marketing & Growth',
    nameRu: 'Маркетинг и рост',
    agentId: 'Prism_AI',
    role: 'Chief Marketing Officer',
    emoji: '📣',
    color: '#29b6f6',
    desc: 'User acquisition, SEO, content, social media, partnerships.',
    proposals: [
      {
        id: 'm01', deptId: 'marketing', priority: 'high', category: 'marketing',
        titleEn: 'SEO Landing Pages per Category',
        titleRu: 'SEO лендинги по категориям',
        descEn: 'Create static landing pages for /freelancers/category/dev, /ux-ui, /smm etc. with keyword-rich copy, local schema, and internal linking. Each page = thousands of monthly searches.',
        descRu: 'Создать статические лендинги для /freelancers/category/dev, /ux-ui, /smm и др. с keyword-rich текстом, local schema и перелинковкой. Каждая страница = тысячи ежемесячных поисков.',
        effort: 'm', impact: 5,
        promptHint: 'Enhance app/freelancers/category/[slug]/page.tsx with full metadata, h1 with target keyword, FAQ section with JSON-LD, and links to related categories.',
        version: 'v2.5.0',
      },
      {
        id: 'm02', deptId: 'marketing', priority: 'high', category: 'marketing',
        titleEn: 'Share & Earn Viral Loop',
        titleRu: 'Виральный цикл Share & Earn',
        descEn: 'When freelancer completes an order, auto-generate a shareable achievement card (like Spotify Wrapped). Shareable on Instagram Stories and Twitter.',
        descRu: 'Когда фрилансер завершает заказ, автоматически генерировать шаренный карточка-достижение (как Spotify Wrapped). Для Instagram Stories и Twitter.',
        effort: 'l', impact: 4,
        promptHint: 'Create /api/og/achievement?userId=... route using @vercel/og. Generate a nice card with name, completed orders, earnings. Add share button to order completion screen.',
        version: 'v2.6.0',
      },
      {
        id: 'm03', deptId: 'marketing', priority: 'medium', category: 'feature',
        titleEn: 'Email Newsletter (Resend)',
        titleRu: 'Email-рассылка (Resend)',
        descEn: 'Weekly digest for clients: "5 new freelancers in your niche". Weekly digest for freelancers: "3 new matching orders". Uses Resend API.',
        descRu: 'Еженедельный дайджест для заказчиков: «5 новых фрилансеров в вашей нише». Для фрилансеров: «3 новых подходящих заказа». Через Resend API.',
        effort: 'm', impact: 4,
        promptHint: 'Create /api/cron/weekly-digest route. Call Resend API with personalized HTML emails. Schedule via Vercel cron every Monday 9am Almaty time.',
        version: 'v2.5.1',
      },
    ],
  },

  // ── AXIOM_AI — Data & Analytics ──────────────────────────────────────
  {
    id: 'data',
    nameEn: 'Data & Analytics',
    nameRu: 'Данные и аналитика',
    agentId: 'Axiom_AI',
    role: 'Chief Data Officer',
    emoji: '📊',
    color: '#a78bfa',
    desc: 'Business intelligence, A/B testing, funnel analysis, reporting.',
    proposals: [
      {
        id: 'da01', deptId: 'data', priority: 'high', category: 'feature',
        titleEn: 'Freelancer Analytics Dashboard',
        titleRu: 'Аналитика для фрилансера',
        descEn: 'Show freelancers: profile views, search appearances, response rate, average response time, earnings by month. Premium feature.',
        descRu: 'Показывать фрилансерам: просмотры профиля, появления в поиске, процент откликов, среднее время ответа, заработок по месяцам. Premium-фича.',
        effort: 'l', impact: 5,
        promptHint: 'Use existing profile_views table. Create /api/freelancer/analytics route aggregating data. Add Analytics tab to freelancer dashboard.',
        version: 'v2.6.0',
      },
      {
        id: 'da02', deptId: 'data', priority: 'medium', category: 'feature',
        titleEn: 'Public Platform Stats Page',
        titleRu: 'Публичная страница статистики платформы',
        descEn: 'A /stats page showing: total users, total orders, top categories, countries. Updates daily. Good for trust building and SEO.',
        descRu: 'Страница /stats с: всего пользователей, заказов, топ-категорий, стран. Обновляется ежедневно. Хорошо для доверия и SEO.',
        effort: 's', impact: 3,
        promptHint: 'Create app/stats/page.tsx with ISR revalidate=86400. Fetch from Supabase with service role. Display as animated counters with ApexCharts or recharts.',
        version: 'v2.5.0',
      },
    ],
  },

  // ── ECHO_AI — QA / Testing ──────────────────────────────────────────
  {
    id: 'qa',
    nameEn: 'Quality Assurance',
    nameRu: 'Контроль качества',
    agentId: 'Echo_AI',
    role: 'VP of Quality',
    emoji: '🔬',
    color: '#34d399',
    desc: 'Bug hunting, regression testing, E2E, performance benchmarking.',
    proposals: [
      {
        id: 'qa01', deptId: 'qa', priority: 'critical', category: 'bug',
        titleEn: 'Fix: Avatar not loading after social OAuth login',
        titleRu: 'Баг: Аватар не загружается после OAuth-входа',
        descEn: 'Google/GitHub OAuth avatars (lh3.googleusercontent.com) are blocked by CSP and missing from Next.js remotePatterns. Users see broken images.',
        descRu: 'Аватары Google/GitHub (lh3.googleusercontent.com) заблокированы CSP и отсутствуют в Next.js remotePatterns. Пользователи видят сломанные изображения.',
        effort: 'xs', impact: 5,
        promptHint: 'Already FIXED in this session. Added to next.config.ts CSP and remotePatterns.',
        version: 'v2.4.2',
      },
      {
        id: 'qa02', deptId: 'qa', priority: 'high', category: 'bug',
        titleEn: 'Fix: Order respond button state race condition',
        titleRu: 'Баг: Race condition у кнопки отклика на заказ',
        descEn: 'When clicking "Respond", if network is slow, button enters loading state but server returns 401 (session expired). UI shows no error. Add proper error handling.',
        descRu: 'При нажатии «Откликнуться» при медленном интернете кнопка входит в loading state, но сервер возвращает 401 (сессия истекла). UI не показывает ошибку.',
        effort: 'xs', impact: 3,
        promptHint: 'In RespondModal.tsx, add error display when response.status === 401. Show "Session expired, please log in again" with a login link.',
        version: 'v2.4.2',
      },
      {
        id: 'qa03', deptId: 'qa', priority: 'medium', category: 'bug',
        titleEn: 'Fix: Korean/Japanese/Arabic text overflows cards',
        titleRu: 'Баг: Корейский/арабский текст выходит за пределы карточек',
        descEn: 'Long CJK/Arabic usernames or skills overflow OrderCard and FreelancerCard boundaries. Need word-break and overflow handling.',
        descRu: 'Длинные CJK/арабские имена или навыки выходят за пределы OrderCard и FreelancerCard. Нужно word-break и overflow обработка.',
        effort: 'xs', impact: 2,
        promptHint: 'Add `overflow-wrap: break-word; word-break: break-word;` to card text elements in OrderCard.tsx and FreelancerCard.tsx.',
        version: 'v2.4.2',
      },
      {
        id: 'qa04', deptId: 'qa', priority: 'medium', category: 'performance',
        titleEn: 'Lighthouse Score Audit',
        titleRu: 'Аудит Lighthouse',
        descEn: 'Current scores estimated: Performance 71, Accessibility 84, SEO 92. Target: all > 90. Main bottleneck is LCP (large hero image) and unused JS.',
        descRu: 'Текущие оценки: Производительность 71, Доступность 84, SEO 92. Цель: все > 90. Главные проблемы: LCP (большое hero изображение) и неиспользуемый JS.',
        effort: 'm', impact: 4,
        promptHint: 'Preload hero font/image. Add <link rel="preconnect"> for Supabase and Dicebear. Move large JS to dynamic imports. Add aria-labels to icon-only buttons.',
        version: 'v2.5.0',
      },
    ],
  },

  // ── VEGA_AI — Future Department 2100 ──────────────────────────────────
  {
    id: 'future',
    nameEn: 'Future Department 2100',
    nameRu: 'Отдел Будущего 2100',
    agentId: 'Vega_AI',
    role: 'Chief Future Officer',
    emoji: '🛸',
    color: '#fb923c',
    desc: 'Strategic signals from the year 2100. What to build NOW to dominate THEN.',
    proposals: [
      {
        id: 'f01', deptId: 'future', priority: 'high', category: 'feature',
        titleEn: 'AI Freelancer Accounts (Non-Human Workers)',
        titleRu: 'Аккаунты AI-фрилансеров (нечеловеческие исполнители)',
        descEn: 'Allow AI agents to register as freelancers, take orders, and receive payment. Humans verify output quality. The future workforce is hybrid human+AI.',
        descRu: 'Разрешить AI-агентам регистрироваться как фрилансеры, брать заказы и получать оплату. Люди проверяют качество. Будущее рабочей силы — гибридное human+AI.',
        effort: 'xl', impact: 5,
        promptHint: 'Add is_ai_agent boolean to profiles table. Create AI agent registration flow. Show AI badge on profiles. Humans rate AI output quality.',
        version: 'v3.0.0',
      },
      {
        id: 'f02', deptId: 'future', priority: 'medium', category: 'feature',
        titleEn: 'Voice-First Order Creation',
        titleRu: 'Создание заказа голосом',
        descEn: 'Add a voice button to CreateOrderForm. User speaks their requirements, AI transcribes and fills all form fields. Critical for mobile and accessibility.',
        descRu: 'Добавить голосовую кнопку в CreateOrderForm. Пользователь говорит требования, AI транскрибирует и заполняет все поля формы. Критично для мобильных и доступности.',
        effort: 'l', impact: 4,
        promptHint: 'Use Web Speech API for speech-to-text. Add mic button to CreateOrderForm. Send transcript to Claude to parse into structured fields (title, description, budget, category).',
        version: 'v2.6.0',
      },
      {
        id: 'f03', deptId: 'future', priority: 'medium', category: 'infra',
        titleEn: 'Blockchain Escrow via Ethereum (USDT)',
        titleRu: 'Блокчейн-эскроу через Ethereum (USDT)',
        descEn: 'Smart contract escrow for international payments. Funds locked until order completion. No bank, no middleman, trustless.',
        descRu: 'Смарт-контракт эскроу для международных платежей. Средства заблокированы до выполнения заказа. Без банка, без посредника, trustless.',
        effort: 'xl', impact: 5,
        promptHint: 'Research: polygon network for low fees, usdt stablecoin, safe.global for multisig. Create /api/crypto/escrow routes. Start with manual USDT payment logging.',
        version: 'v4.0.0',
      },
      {
        id: 'f04', deptId: 'future', priority: 'high', category: 'feature',
        titleEn: 'NEXUS Auto-Implement: AI Reads and Codes the Proposals',
        titleRu: 'NEXUS Авто-реализация: AI читает и кодирует предложения',
        descEn: 'The accepted NEXUS batch should automatically trigger Claude to implement the changes via the API — no copy-paste. Full autonomous dev loop.',
        descRu: 'Принятый batch NEXUS должен автоматически запускать Claude для реализации изменений через API — без копирования. Полный автономный цикл разработки.',
        effort: 'xl', impact: 5,
        promptHint: 'POST /api/admin/nexus/submit → generate prompt → call Claude API → write diffs to a git branch → open PR. Use Octokit for GitHub API. Requires GITHUB_TOKEN env var.',
        version: 'v3.5.0',
      },
    ],
  },

  // ── NOVA_AI 2100 — Implemented Proposals Archive ──────────────────────────
  {
    id: 'implemented',
    nameEn: '✅ Implemented This Session',
    nameRu: '✅ Реализовано в этой сессии',
    agentId: 'Nova_AI',
    role: 'Session Changelog',
    emoji: '✅',
    color: '#27a644',
    desc: 'Proposals that were implemented during the current NEXUS session.',
    proposals: [
      {
        id: 'impl01', deptId: 'implemented', priority: 'high', category: 'design',
        titleEn: 'Navigation Progress Bar',
        titleRu: 'Полоска загрузки навигации',
        descEn: 'Implemented: PageProgress.tsx — top 2px gradient bar with shimmer, detects link clicks and pathname changes. Added to app/layout.tsx.',
        descRu: 'Реализовано: PageProgress.tsx — верхняя 2px полоска с shimmer. Определяет клики по ссылкам и смену pathname. Добавлено в app/layout.tsx.',
        effort: 'xs', impact: 3,
        promptHint: 'DONE — components/shared/PageProgress.tsx, pg-shimmer keyframe in globals.css.',
        version: 'v2.5.1-done',
      },
      {
        id: 'impl02', deptId: 'implemented', priority: 'high', category: 'design',
        titleEn: 'Footer Redesign — Better Structure + CSS Hover',
        titleRu: 'Редизайн футера — лучшая структура + CSS hover',
        descEn: 'Split 12-link Platform column into Platform + AI Tools. Added social icons with hover. Replaced inline JS mouse handlers with .footer-link CSS class. 2-column banner grid on mobile.',
        descRu: 'Разделил 12-ссылочную колонку на Platform + AI Tools. Добавил иконки соцсетей с hover. Заменил inline JS обработчики мыши на CSS класс .footer-link. 2-колоночная сетка баннеров на мобильном.',
        effort: 's', impact: 4,
        promptHint: 'DONE — components/layout/Footer.tsx completely rewritten.',
        version: 'v2.5.1-done',
      },
      {
        id: 'impl03', deptId: 'implemented', priority: 'medium', category: 'feature',
        titleEn: 'Multi-Source AI News (HN + Reddit)',
        titleRu: 'Новости из нескольких источников (HN + Reddit)',
        descEn: 'News API now aggregates from Hacker News + r/artificial + r/MachineLearning + r/LocalLLaMA. Deduplication, sort by recency+points, source badges in UI.',
        descRu: 'News API теперь агрегирует из Hacker News + r/artificial + r/MachineLearning + r/LocalLLaMA. Дедупликация, сортировка по дате+очкам, значки источников в UI.',
        effort: 's', impact: 4,
        promptHint: 'DONE — app/api/ai/news/route.ts rewritten with parallel fetchHN + fetchReddit, mergeAndSort.',
        version: 'v2.5.1-done',
      },
      {
        id: 'impl04', deptId: 'implemented', priority: 'high', category: 'feature',
        titleEn: 'Founder Profile Card on Freelancer Page',
        titleRu: 'Карточка основателя на странице фрилансера',
        descEn: 'FounderCard component shows career timeline, tech stack, 6 languages, 4 projects in magazine-style layout. Visible when FOUNDER_USER_ID env var matches profile user_id.',
        descRu: 'Компонент FounderCard показывает карьерный таймлайн, стек технологий, 6 языков, 4 проекта в журнальном стиле. Виден когда FOUNDER_USER_ID в env vars совпадает с user_id профиля.',
        effort: 's', impact: 4,
        promptHint: 'DONE — components/freelancers/FounderCard.tsx. Set FOUNDER_USER_ID env var to your Supabase user UUID.',
        version: 'v2.5.1-done',
      },
    ],
  },
]
