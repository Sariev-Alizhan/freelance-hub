// Hand-curated feed cards: recent releases + editor posts.
// Rendered in-feed as pinned update/editor cards alongside user posts and news.

export interface FeedRelease {
  id:         string          // stable id for reactions
  version:    string
  date:       string          // ISO
  emoji:      string
  title:      string
  summary:    string
  highlights: string[]
}

export interface EditorPost {
  id:      string
  emoji:   string
  author:  string           // e.g. 'FreelanceHub Team'
  tag:     string           // e.g. 'Tips', 'Guide', 'Announcement'
  tagColor: string          // accent color for the tag pill
  title:   string
  body:    string           // one-paragraph body
  tags:    string[]         // hashtag-style list
  date:    string           // ISO
}

// ── 5 recent releases ─────────────────────────────────────────────────────────
export const FEED_RELEASES: FeedRelease[] = [
  {
    id:      'rel-1.5.0',
    version: '1.5.0',
    date:    '2026-04-17',
    emoji:   '✨',
    title:   'Лендинг почищен + лента по умолчанию',
    summary: 'Убрали вымышленные цены с карточек AI-агентов, заменили ∞ countries на Global Reach. После входа теперь попадаешь сразу в ленту, а не на дашборд.',
    highlights: [
      '🧹 Убраны fake-цены $0 / $22000 / $35000 с карточек агентов',
      '🌍 ∞ Countries → Global Reach на главной',
      '🚀 Редирект после логина: /dashboard → /feed',
      '🎯 Онбординг финиширует на /feed для обеих ролей',
    ],
  },
  {
    id:      'rel-1.4.0',
    version: '1.4.0',
    date:    '2026-04-17',
    emoji:   '🔔',
    title:   'Исправлен красный бейдж непрочитанных',
    summary: 'После выхода из чата красный кружок на иконке сообщений висел, хотя всё прочитано. Supabase-запросы не терминировались — поправили. Та же проблема была в уведомлениях.',
    highlights: [
      '💬 is_read флаги теперь реально летят в БД',
      '🔴 Бейдж сообщений очищается при выходе из чата',
      '🔔 Бейдж колокольчика корректно сбрасывается',
      '⚡ Realtime update срабатывает как надо',
    ],
  },
  {
    id:      'rel-1.3.0',
    version: '1.3.0',
    date:    '2026-04-16',
    emoji:   '🛡️',
    title:   'Стабильность: Rules of Hooks + React Compiler',
    summary: 'Зафиксили крэш BottomNav при переходе /auth ↔ app, TDZ и impurity в StoryViewer. React Compiler теперь мемоизирует ProfileContext, notifications, goals.',
    highlights: [
      '🎣 BottomNav: useCallback до early return',
      '📖 StoryViewer: Date.now() → useState, goNext/Prev → useCallback',
      '⚙️ React Compiler мемоизация разблокирована в 3 компонентах',
      '🧹 Убраны мёртвые импорты и props',
    ],
  },
  {
    id:      'rel-1.2.0',
    version: '1.2.0',
    date:    '2026-04-16',
    emoji:   '🎬',
    title:   'Splash screen + нижний nav в сообщениях',
    summary: 'Instagram-style splash screen после логина: центрированный лого и "from FreelanceHub" снизу, адаптирован под светлую и тёмную темы. Нижний бар теперь виден на /messages в списке чатов.',
    highlights: [
      '🎬 Splash screen с пружинной анимацией',
      '🌗 Respect light/dark + safe-area insets',
      '📱 Bottom nav виден в списке чатов',
      '🙈 Скрывается только внутри открытого чата',
    ],
  },
  {
    id:      'rel-1.1.0',
    version: '1.1.0',
    date:    '2026-04-15',
    emoji:   '💬',
    title:   'Messenger: реакции и emoji picker как в Instagram',
    summary: 'Переработали реакции: 6 эмодзи + "+" открывает полноэкранный picker с поиском. Long-press на сообщение — action sheet (ответить, переслать, копировать, удалить, ещё).',
    highlights: [
      '❤️ 6 быстрых реакций + "+" для полного picker',
      '📱 Bottom sheet на 78dvh с drag handle и поиском',
      '👆 Long-press action sheet с подменю',
      '🎨 Круглые 24px реакционные пузырьки',
    ],
  },
]

// ── 4 editor posts ────────────────────────────────────────────────────────────
export const EDITOR_POSTS: EditorPost[] = [
  {
    id:       'ed-welcome',
    emoji:    '👋',
    author:   'FreelanceHub Team',
    tag:      'Добро пожаловать',
    tagColor: '#7170ff',
    title:    'Добро пожаловать на FreelanceHub',
    body:     'Мы строим платформу, где фрилансеры и клиенты работают напрямую — без комиссии, без посредников, с AI-агентами в роли полноценных исполнителей. Настрой профиль, опубликуй первый заказ или найди работу. Напиши нам в чат поддержки, если что-то не очевидно.',
    tags:     ['welcome', 'start', 'guide'],
    date:     '2026-04-17',
  },
  {
    id:       'ed-ai-agents',
    emoji:    '🤖',
    author:   'Product',
    tag:      'Фича',
    tagColor: '#a78bfa',
    title:    'AI-агенты берут заказы как люди',
    body:     'В разделе /agents агенты на базе Claude отвечают за минуты, доступны 24/7, работают с фикс-ценой за результат. Попробуй SocialPilot для SMM, LandingForge для посадочных, Orchestrator — для многошаговых задач. Это не чат-бот, это исполнитель.',
    tags:     ['ai', 'agents', 'claude'],
    date:     '2026-04-16',
  },
  {
    id:       'ed-zero-fee',
    emoji:    '💸',
    author:   'FreelanceHub Team',
    tag:      'Тарифы',
    tagColor: '#27a644',
    title:    '0% комиссии. Серьёзно.',
    body:     'Upwork и Fiverr забирают 10–20% с каждой сделки. Мы берём 0%. Договаривайся о любом способе оплаты: Kaspi, карта, наличные, USDT. Платформа зарабатывает на Premium-подписке и Featured-буст для объявлений, но базовые возможности — навсегда бесплатны.',
    tags:     ['pricing', 'zero-fee', 'transparent'],
    date:     '2026-04-16',
  },
  {
    id:       'ed-telegram',
    emoji:    '📲',
    author:   'Growth',
    tag:      'Совет',
    tagColor: '#0ea5e9',
    title:    'Подключи Telegram — будешь первым на откликах',
    body:     'В Settings → Notifications привяжи Telegram-бот и получай пуши о новых заказах, откликах и сообщениях мгновенно. На активных категориях заказ забирают за первые 2–5 минут — не упусти своё.',
    tags:     ['telegram', 'notifications', 'speed'],
    date:     '2026-04-15',
  },
]
