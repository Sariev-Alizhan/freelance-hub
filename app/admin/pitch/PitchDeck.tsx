'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Globe, TrendingUp, Shield, Zap, Users, DollarSign,
  ChevronRight, ChevronLeft, BarChart3, Star, Target,
  Rocket, Brain, ArrowRight, Check, Crown,
} from 'lucide-react'

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T = {
  en: {
    dir: 'ltr', flag: '🇬🇧', name: 'English',
    nav: ['Problem','Solution','Market','Product','Model','Traction','Roadmap','Team','Invest'],
    slide1: {
      badge: 'Investment Opportunity · Series A',
      title: 'The Future of Work',
      sub: 'in Central Asia & Beyond',
      desc: 'The first AI-native, decentralized freelance platform connecting 1 billion people with work — humans and AI as equals.',
      cta: 'Explore the deck',
    },
    slide2: {
      label: '01 · Problem',
      title: 'A broken market of\n$2.5 trillion',
      points: [
        { n: '73%', t: 'of freelancers get scammed or underpaid at least once' },
        { n: '0%', t: 'trust infrastructure exists in CIS freelance markets' },
        { n: '68%', t: 'of orders are completed outside platforms — no protection' },
        { n: '$0', t: 'goes through escrow in the CIS freelance economy today' },
      ],
      insight: 'Upwork and Fiverr ignore 280 million CIS + Central Asian users. We don\'t.',
    },
    slide3: {
      label: '02 · Solution',
      title: 'FreelanceHub',
      sub: 'One platform. Humans + AI. Trusted.',
      features: [
        { icon: '🤖', t: 'AI & Human freelancers side-by-side' },
        { icon: '🔒', t: 'Escrow: funds locked until work approved' },
        { icon: '⭐', t: 'Verified reviews tied to real completed orders' },
        { icon: '🌍', t: '50+ cities, 5 languages, 30+ currencies' },
        { icon: '📱', t: 'Telegram-first growth for CIS market' },
        { icon: '🗳️', t: 'Democratic roadmap — users vote on features' },
      ],
    },
    slide4: {
      label: '03 · Market',
      title: 'Massive &\nundersurved market',
      tam: { v: '$455B', t: 'Global freelance market 2024' },
      sam: { v: '$18B', t: 'CIS + Central Asia + MENA addressable' },
      som: { v: '$180M', t: '1% capture = our Year 3 target' },
      growth: '23% CAGR through 2028',
      regions: [
        { name: 'Kazakhstan', pop: '19M', note: 'Base market, 40% youth' },
        { name: 'Uzbekistan', pop: '36M', note: 'Fastest growing IT in CIS' },
        { name: 'Russia/CIS', pop: '200M+', note: 'Largest talent pool' },
        { name: 'South Asia', pop: '1.8B', note: 'World\'s #1 freelancer market' },
      ],
    },
    slide5: {
      label: '04 · Product',
      title: 'Built for\n10 million users',
      modules: [
        { icon: '📋', name: 'Smart Orders', desc: 'AI writes the brief, matches top freelancers automatically' },
        { icon: '🤖', name: 'AI Agents', desc: 'SMM, copywriting, landing pages — AI freelancers on demand' },
        { icon: '💬', name: 'Messenger', desc: 'Encrypted chat, file sharing, built-in contracts' },
        { icon: '📊', name: 'Milestone Tracker', desc: '4-step progress: Not started → Review → Done' },
        { icon: '🔐', name: 'Escrow Engine', desc: 'Funds held safely, released on approval, 8% platform fee' },
        { icon: '⭐', name: 'Trust Graph', desc: 'Reviews, ratings, verification, trust score per user' },
      ],
    },
    slide6: {
      label: '05 · Business Model',
      title: 'Multiple revenue\nstreams from Day 1',
      streams: [
        { pct: '55%', name: 'Transaction fee', desc: '8% on every completed order via escrow', color: '#7170ff' },
        { pct: '25%', name: 'Premium subscriptions', desc: '₸2,000/month for freelancers', color: '#f59e0b' },
        { pct: '12%', name: 'Featured listings', desc: 'Promoted orders & profiles', color: '#27a644' },
        { pct: '8%',  name: 'AI Agent usage', desc: 'Pay-per-task AI agents', color: '#3b82f6' },
      ],
      math: [
        { label: 'Avg order value', v: '₸85,000' },
        { label: 'Platform fee (8%)', v: '₸6,800' },
        { label: 'Orders/month at 10K MAU', v: '~2,500' },
        { label: 'Monthly revenue', v: '₸17M' },
      ],
    },
    slide7: {
      label: '06 · Traction',
      title: 'Early signals\nlook strong',
      metrics: [
        { n: 'v0.9', t: '9 major releases shipped' },
        { n: '137', t: 'Static SEO pages indexed' },
        { n: '50+', t: 'Cities covered globally' },
        { n: '5', t: 'AI agents live in marketplace' },
      ],
      built: [
        'Referral system with viral loop',
        'Telegram bot (@freelancehubkz_bot) live',
        'Featured Boost monetization',
        'Milestone Progress Tracker',
        'Democratic feature voting /vote',
        'Order reviews (bidirectional)',
        'Admin panel with company reports',
        'Multi-language: RU, KK, EN',
      ],
    },
    slide8: {
      label: '07 · Roadmap',
      title: '12 months to\nmarket leadership',
      phases: [
        {
          q: 'Q2 2026', color: '#27a644',
          items: ['Escrow payments live', 'Reviews & ratings full launch', 'AI freelancer marketplace', '10,000 registered users'],
        },
        {
          q: 'Q3 2026', color: '#7170ff',
          items: ['Mobile app iOS + Android', 'Smart AI matching (GPT-4)', 'Company/Agency accounts', '100,000 users'],
        },
        {
          q: 'Q4 2026', color: '#f59e0b',
          items: ['Uzbekistan & Turkey expansion', 'ID verification', 'Dispute resolution DAO', '$1M ARR'],
        },
        {
          q: '2027', color: '#e879f9',
          items: ['South Asia launch', '$FLH governance token', 'On-chain reputation NFTs', '1M users'],
        },
      ],
    },
    slide9: {
      label: '08 · Team',
      title: 'Built by people\nwho ship fast',
      desc: 'Our AI-powered development team ships weekly. 9 major releases in 30 days. Platform built from 0 to production in record time.',
      facts: [
        '9 releases in 30 days',
        'Zero external funding to date',
        '137 pages live on launch',
        'Full-stack AI + Web3 architecture',
      ],
    },
    slide10: {
      label: '09 · Investment',
      title: 'Join us at\nthe ground floor',
      ask: '$500,000 — $2,000,000',
      askSub: 'Seed Round · Equity',
      use: [
        { pct: '40%', label: 'Product & Engineering', note: 'Escrow, mobile app, AI matching' },
        { pct: '35%', label: 'Marketing & Growth', note: 'CIS expansion, SEO, Telegram campaigns' },
        { pct: '15%', label: 'Operations & Legal', note: 'Licensing, compliance, support team' },
        { pct: '10%', label: 'Reserve', note: 'Strategic opportunities' },
      ],
      returns: [
        { label: 'Year 1 revenue', v: '₸120M' },
        { label: 'Year 2 revenue', v: '₸850M' },
        { label: 'Year 3 revenue', v: '₸5B+' },
        { label: 'Target valuation', v: '$50M' },
      ],
      cta: 'Schedule a meeting',
      contact: 'raimzhan1907@gmail.com',
    },
  },

  ru: {
    dir: 'ltr', flag: '🇷🇺', name: 'Русский',
    nav: ['Проблема','Решение','Рынок','Продукт','Модель','Трекшн','Роадмап','Команда','Инвест.'],
    slide1: {
      badge: 'Инвестиционная возможность · Серия A',
      title: 'Будущее труда',
      sub: 'в Центральной Азии и за её пределами',
      desc: 'Первая AI-нативная, децентрализованная фриланс-платформа, соединяющая 1 миллиард людей с работой — люди и ИИ на равных.',
      cta: 'Смотреть презентацию',
    },
    slide2: {
      label: '01 · Проблема',
      title: 'Сломанный рынок\nна $2.5 триллиона',
      points: [
        { n: '73%', t: 'фрилансеров хотя бы раз теряли деньги или не получали оплату' },
        { n: '0%', t: 'доверительной инфраструктуры в СНГ-рынке фриланса' },
        { n: '68%', t: 'сделок закрываются вне платформ — без какой-либо защиты' },
        { n: '0 ₸', t: 'проходит через эскроу в СНГ-экономике фриланса' },
      ],
      insight: 'Upwork и Fiverr игнорируют 280 миллионов пользователей СНГ и Центральной Азии. Мы — нет.',
    },
    slide3: {
      label: '02 · Решение',
      title: 'FreelanceHub',
      sub: 'Одна платформа. Люди + ИИ. Доверие.',
      features: [
        { icon: '🤖', t: 'Люди и AI-фрилансеры на одной платформе' },
        { icon: '🔒', t: 'Эскроу: деньги заморожены до приёма работы' },
        { icon: '⭐', t: 'Проверенные отзывы, привязанные к реальным заказам' },
        { icon: '🌍', t: '50+ городов, 5 языков, 30+ валют' },
        { icon: '📱', t: 'Telegram-first рост для СНГ рынка' },
        { icon: '🗳️', t: 'Демократический роадмап — пользователи голосуют' },
      ],
    },
    slide4: {
      label: '03 · Рынок',
      title: 'Огромный и\nнедооцененный рынок',
      tam: { v: '$455 млрд', t: 'Глобальный рынок фриланса 2024' },
      sam: { v: '$18 млрд', t: 'СНГ + Центральная Азия + MENA' },
      som: { v: '$180 млн', t: '1% охвата = наша цель на 3-й год' },
      growth: '23% ежегодный рост до 2028 года',
      regions: [
        { name: 'Казахстан', pop: '19 млн', note: 'Базовый рынок, 40% молодёжь' },
        { name: 'Узбекистан', pop: '36 млн', note: 'Быстрейший рост IT в СНГ' },
        { name: 'Россия/СНГ', pop: '200+ млн', note: 'Крупнейший пул талантов' },
        { name: 'Южная Азия', pop: '1.8 млрд', note: '№1 рынок фрилансеров в мире' },
      ],
    },
    slide5: {
      label: '04 · Продукт',
      title: 'Создан для\n10 миллионов пользователей',
      modules: [
        { icon: '📋', name: 'Умные заказы', desc: 'ИИ пишет бриф и автоматически подбирает лучших фрилансеров' },
        { icon: '🤖', name: 'AI Агенты', desc: 'SMM, копирайтинг, лендинги — AI-фрилансеры по требованию' },
        { icon: '💬', name: 'Мессенджер', desc: 'Зашифрованный чат, обмен файлами, встроенные контракты' },
        { icon: '📊', name: 'Трекер прогресса', desc: '4 шага: Не начато → На проверке → Готово' },
        { icon: '🔐', name: 'Движок эскроу', desc: 'Средства заморожены, освобождаются при одобрении, 8% комиссия' },
        { icon: '⭐', name: 'Граф доверия', desc: 'Отзывы, рейтинги, верификация, индекс доверия пользователя' },
      ],
    },
    slide6: {
      label: '05 · Бизнес-модель',
      title: 'Несколько источников\nдохода с первого дня',
      streams: [
        { pct: '55%', name: 'Комиссия с транзакций', desc: '8% с каждого завершённого заказа через эскроу', color: '#7170ff' },
        { pct: '25%', name: 'Premium подписки', desc: '₸2,000/мес для фрилансеров', color: '#f59e0b' },
        { pct: '12%', name: 'Платное продвижение', desc: 'Продвижение заказов и профилей', color: '#27a644' },
        { pct: '8%',  name: 'AI агенты', desc: 'Оплата за использование AI-агентов', color: '#3b82f6' },
      ],
      math: [
        { label: 'Средний чек заказа', v: '₸85,000' },
        { label: 'Комиссия платформы (8%)', v: '₸6,800' },
        { label: 'Заказов/месяц при 10K MAU', v: '~2,500' },
        { label: 'Месячная выручка', v: '₸17 млн' },
      ],
    },
    slide7: {
      label: '06 · Трекшн',
      title: 'Первые сигналы\nочень обнадёживают',
      metrics: [
        { n: 'v0.9', t: '9 крупных релизов выпущено' },
        { n: '137', t: 'статических SEO-страниц проиндексировано' },
        { n: '50+', t: 'городов мира охвачено' },
        { n: '5', t: 'AI-агентов запущено в маркетплейсе' },
      ],
      built: [
        'Реферальная система с вирусным эффектом',
        'Telegram-бот (@freelancehubkz_bot) запущен',
        'Монетизация через Featured Boost',
        'Трекер прогресса по заказам',
        'Демократическое голосование /vote',
        'Двусторонние отзывы после заказов',
        'Панель администратора с отчётами',
        'Мультиязычность: RU, KK, EN',
      ],
    },
    slide8: {
      label: '07 · Роадмап',
      title: '12 месяцев до\nлидерства на рынке',
      phases: [
        { q: 'Q2 2026', color: '#27a644', items: ['Эскроу-платежи запущены', 'Система отзывов', 'AI-маркетплейс', '10,000 пользователей'] },
        { q: 'Q3 2026', color: '#7170ff', items: ['Мобильное приложение iOS + Android', 'AI-подбор (GPT-4)', 'Корпоративные аккаунты', '100,000 пользователей'] },
        { q: 'Q4 2026', color: '#f59e0b', items: ['Выход в Узбекистан и Турцию', 'ID-верификация', 'DAO-арбитраж', '$1M ARR'] },
        { q: '2027', color: '#e879f9', items: ['Запуск в Южной Азии', 'Токен $FLH', 'NFT-репутация в блокчейне', '1 млн пользователей'] },
      ],
    },
    slide9: {
      label: '08 · Команда',
      title: 'Команда, которая\nдоставляет быстро',
      desc: 'Наша AI-powered команда делает релиз каждую неделю. 9 крупных релизов за 30 дней. Платформа построена с нуля до продакшена за рекордное время.',
      facts: ['9 релизов за 30 дней', 'Без внешнего финансирования', '137 страниц при запуске', 'Full-stack AI + Web3 архитектура'],
    },
    slide10: {
      label: '09 · Инвестиции',
      title: 'Войдите в проект\nна старте',
      ask: '$500,000 — $2,000,000',
      askSub: 'Seed Round · Доля в компании',
      use: [
        { pct: '40%', label: 'Продукт и разработка', note: 'Эскроу, мобильное приложение, AI-подбор' },
        { pct: '35%', label: 'Маркетинг и рост', note: 'Экспансия в СНГ, SEO, Telegram-кампании' },
        { pct: '15%', label: 'Операции и юридические вопросы', note: 'Лицензирование, соответствие, команда поддержки' },
        { pct: '10%', label: 'Резерв', note: 'Стратегические возможности' },
      ],
      returns: [
        { label: 'Выручка год 1', v: '₸120 млн' },
        { label: 'Выручка год 2', v: '₸850 млн' },
        { label: 'Выручка год 3', v: '₸5 млрд+' },
        { label: 'Целевая оценка', v: '$50 млн' },
      ],
      cta: 'Назначить встречу',
      contact: 'raimzhan1907@gmail.com',
    },
  },

  kk: {
    dir: 'ltr', flag: '🇰🇿', name: 'Қазақша',
    nav: ['Мәселе','Шешім','Нарық','Өнім','Модель','Трекшн','Жоспар','Команда','Инвест.'],
    slide1: {
      badge: 'Инвестициялық мүмкіндік · A сериясы',
      title: 'Еңбектің болашағы',
      sub: 'Орталық Азияда және одан тысқары',
      desc: 'Адамдар мен ЖИ-ны тең санайтын — 1 миллиард адамды жұмыспен байланыстыратын алғашқы AI-нативті, орталықтандырылмаған фриланс платформасы.',
      cta: 'Презентацияны қарау',
    },
    slide2: {
      label: '01 · Мәселе',
      title: '$2.5 триллионлық\nбұзылған нарық',
      points: [
        { n: '73%', t: 'фрилансерлер кемінде бір рет алданған немесе ақы алмаған' },
        { n: '0%', t: 'ТМД фриланс нарығында сенімділік инфрақұрылымы жоқ' },
        { n: '68%', t: 'мәмілелер платформасыз жасалады — ешқандай қорғаусыз' },
        { n: '0 ₸', t: 'ТМД фриланс экономикасында эскроу арқылы өтеді' },
      ],
      insight: 'Upwork пен Fiverr 280 миллион ТМД пайдаланушыларын елемейді. Біз — жоқ.',
    },
    slide3: {
      label: '02 · Шешім',
      title: 'FreelanceHub',
      sub: 'Бір платформа. Адамдар + ЖИ. Сенімділік.',
      features: [
        { icon: '🤖', t: 'Адамдар мен AI фрилансерлері бір платформада' },
        { icon: '🔒', t: 'Эскроу: жұмыс қабылданғанша қаражат сақталады' },
        { icon: '⭐', t: 'Нақты тапсырыстарға байланған тексерілген пікірлер' },
        { icon: '🌍', t: '50+ қала, 5 тіл, 30+ валюта' },
        { icon: '📱', t: 'ТМД нарығы үшін Telegram-first өсу' },
        { icon: '🗳️', t: 'Демократиялық жол карта — пайдаланушылар дауыс береді' },
      ],
    },
    slide4: {
      label: '03 · Нарық',
      title: 'Үлкен және\nқызмет көрсетілмеген нарық',
      tam: { v: '$455 млрд', t: 'Жаһандық фриланс нарығы 2024' },
      sam: { v: '$18 млрд', t: 'ТМД + Орталық Азия + MENA' },
      som: { v: '$180 млн', t: '1% жабу = 3-жылдағы мақсатымыз' },
      growth: '2028 жылға дейін жылдық 23% өсу',
      regions: [
        { name: 'Қазақстан', pop: '19 млн', note: 'Базалық нарық, 40% жастар' },
        { name: 'Өзбекстан', pop: '36 млн', note: 'ТМД-дағы ең жылдам IT өсімі' },
        { name: 'Ресей/ТМД', pop: '200+ млн', note: 'Ең үлкен таланттар пулі' },
        { name: 'Оңтүстік Азия', pop: '1.8 млрд', note: 'Әлемдегі №1 фрилансер нарығы' },
      ],
    },
    slide5: {
      label: '04 · Өнім',
      title: '10 миллион пайдаланушыға\nарналған',
      modules: [
        { icon: '📋', name: 'Ақылды тапсырыстар', desc: 'ЖИ бриф жазады және үздік фрилансерлерді автоматты түрде таңдайды' },
        { icon: '🤖', name: 'AI Агенттер', desc: 'SMM, копирайтинг, лендингтер — сұраныс бойынша AI фрилансерлері' },
        { icon: '💬', name: 'Мессенджер', desc: 'Шифрланған чат, файл алмасу, кірістірілген келісімшарттар' },
        { icon: '📊', name: 'Прогресс трекері', desc: '4 қадам: Басталмаған → Тексерілуде → Дайын' },
        { icon: '🔐', name: 'Эскроу механизмі', desc: 'Қаражат қауіпсіз сақталады, мақұлданғанда шығарылады, 8% комиссия' },
        { icon: '⭐', name: 'Сенім графы', desc: 'Пікірлер, рейтингтер, верификация, пайдаланушы сенім индексі' },
      ],
    },
    slide6: {
      label: '05 · Бизнес модель',
      title: 'Бірінші күннен\nбірнеше кіріс ағыны',
      streams: [
        { pct: '55%', name: 'Транзакция комиссиясы', desc: 'Эскроу арқылы аяқталған әр тапсырыстан 8%', color: '#7170ff' },
        { pct: '25%', name: 'Premium жазылым', desc: 'Фрилансерлер үшін ₸2,000/ай', color: '#f59e0b' },
        { pct: '12%', name: 'Жарнамалық орналастыру', desc: 'Жылжытылған тапсырыстар мен профильдер', color: '#27a644' },
        { pct: '8%',  name: 'AI агент пайдалану', desc: 'Тапсырма бойынша төлем', color: '#3b82f6' },
      ],
      math: [
        { label: 'Орташа тапсырыс сомасы', v: '₸85,000' },
        { label: 'Платформа комиссиясы (8%)', v: '₸6,800' },
        { label: '10K MAU кезінде ай/тапсырыстар', v: '~2,500' },
        { label: 'Ай сайынғы кіріс', v: '₸17 млн' },
      ],
    },
    slide7: {
      label: '06 · Трекшн',
      title: 'Алғашқы сигналдар\nөте жақсы',
      metrics: [
        { n: 'v0.9', t: '9 үлкен шығарылым жіберілді' },
        { n: '137', t: 'статикалық SEO беті индекстелді' },
        { n: '50+', t: 'жаһандық қала қамтылды' },
        { n: '5', t: 'AI агент маркетплейсте іске қосылды' },
      ],
      built: [
        'Вирустық эффектімен реферал жүйесі',
        'Telegram бот (@freelancehubkz_bot) іске қосылды',
        'Featured Boost монетизациясы',
        'Тапсырыс прогресс трекері',
        'Демократиялық дауыс беру /vote',
        'Тапсырыстан кейін екі жақты пікірлер',
        'Есептермен әкімші панелі',
        'Көптілділік: RU, KK, EN',
      ],
    },
    slide8: {
      label: '07 · Жоспар',
      title: 'Нарықтағы көшбасшылыққа\n12 ай',
      phases: [
        { q: 'Q2 2026', color: '#27a644', items: ['Эскроу төлемдері іске қосылды', 'Пікірлер жүйесі', 'AI маркетплейс', '10,000 пайдаланушы'] },
        { q: 'Q3 2026', color: '#7170ff', items: ['iOS + Android мобильді қосымша', 'AI сәйкестендіру (GPT-4)', 'Корпоративтік аккаунттар', '100,000 пайдаланушы'] },
        { q: 'Q4 2026', color: '#f59e0b', items: ['Өзбекстан мен Түркияға шығу', 'ID верификация', 'DAO арбитраж', '$1M ARR'] },
        { q: '2027', color: '#e879f9', items: ['Оңтүстік Азияда іске қосу', '$FLH токені', 'Блокчейндегі NFT беделі', '1 млн пайдаланушы'] },
      ],
    },
    slide9: {
      label: '08 · Команда',
      title: 'Жылдам жеткізетін\nкоманда',
      desc: 'Біздің AI-powered команда апта сайын шығарылым жасайды. 30 күнде 9 үлкен шығарылым. Платформа рекордтық уақытта нөлден продакшенге дейін жасалды.',
      facts: ['30 күнде 9 шығарылым', 'Сыртқы қаржыландырусыз', 'Іске қосылуда 137 бет', 'Full-stack AI + Web3 архитектурасы'],
    },
    slide10: {
      label: '09 · Инвестиция',
      title: 'Жобаға бастапқы\nкезеңде кіріңіз',
      ask: '$500,000 — $2,000,000',
      askSub: 'Seed Round · Үлес',
      use: [
        { pct: '40%', label: 'Өнім және әзірлеу', note: 'Эскроу, мобильді қосымша, AI сәйкестендіру' },
        { pct: '35%', label: 'Маркетинг және өсу', note: 'ТМД экспансия, SEO, Telegram кампаниялары' },
        { pct: '15%', label: 'Операциялар және заңдық', note: 'Лицензиялау, сәйкестік, қолдау командасы' },
        { pct: '10%', label: 'Резерв', note: 'Стратегиялық мүмкіндіктер' },
      ],
      returns: [
        { label: '1-жыл кірісі', v: '₸120 млн' },
        { label: '2-жыл кірісі', v: '₸850 млн' },
        { label: '3-жыл кірісі', v: '₸5 млрд+' },
        { label: 'Мақсатты баға', v: '$50 млн' },
      ],
      cta: 'Кездесу белгілеу',
      contact: 'raimzhan1907@gmail.com',
    },
  },

  zh: {
    dir: 'ltr', flag: '🇨🇳', name: '中文',
    nav: ['问题','解决方案','市场','产品','模式','牵引力','路线图','团队','投资'],
    slide1: {
      badge: '投资机会 · A轮融资',
      title: '工作的未来',
      sub: '在中亚及更广泛的地区',
      desc: '首个AI原生去中心化自由职业平台，将10亿人与工作机会连接——人类与AI平等协作。',
      cta: '查看演示文稿',
    },
    slide2: {
      label: '01 · 问题',
      title: '2.5万亿美元的\n破碎市场',
      points: [
        { n: '73%', t: '的自由职业者至少遭受过一次欺诈或未获付款' },
        { n: '0%', t: '独联体自由职业市场缺乏信任基础设施' },
        { n: '68%', t: '的交易在平台外完成——没有任何保护' },
        { n: '0元', t: '独联体自由职业经济中通过托管服务流转' },
      ],
      insight: 'Upwork和Fiverr忽视了2.8亿独联体和中亚用户。我们没有。',
    },
    slide3: {
      label: '02 · 解决方案',
      title: 'FreelanceHub',
      sub: '一个平台。人类 + AI。值得信赖。',
      features: [
        { icon: '🤖', t: '人类与AI自由职业者并肩合作' },
        { icon: '🔒', t: '托管服务：资金锁定直至工作获批' },
        { icon: '⭐', t: '与真实完成订单挂钩的经过验证的评价' },
        { icon: '🌍', t: '50+城市、5种语言、30+货币' },
        { icon: '📱', t: '针对独联体市场的Telegram优先增长策略' },
        { icon: '🗳️', t: '民主路线图——用户投票决定功能' },
      ],
    },
    slide4: {
      label: '03 · 市场',
      title: '巨大且服务不足\n的市场',
      tam: { v: '4550亿美元', t: '2024年全球自由职业市场' },
      sam: { v: '180亿美元', t: '独联体+中亚+中东北非' },
      som: { v: '1.8亿美元', t: '1%市场份额=第3年目标' },
      growth: '至2028年年复合增长率23%',
      regions: [
        { name: '哈萨克斯坦', pop: '1900万', note: '基础市场，40%年轻人口' },
        { name: '乌兹别克斯坦', pop: '3600万', note: '独联体增长最快的IT市场' },
        { name: '俄罗斯/独联体', pop: '2亿+', note: '最大人才库' },
        { name: '南亚', pop: '18亿', note: '全球第一大自由职业市场' },
      ],
    },
    slide5: {
      label: '04 · 产品',
      title: '为1000万用户\n而构建',
      modules: [
        { icon: '📋', name: '智能订单', desc: 'AI撰写需求简报并自动匹配最佳自由职业者' },
        { icon: '🤖', name: 'AI代理', desc: '社媒运营、文案、落地页——按需AI自由职业者' },
        { icon: '💬', name: '消息系统', desc: '加密聊天、文件共享、内置合同' },
        { icon: '📊', name: '里程碑追踪器', desc: '4个阶段：未开始→审核中→完成' },
        { icon: '🔐', name: '托管引擎', desc: '资金安全锁定，批准后释放，平台收取8%佣金' },
        { icon: '⭐', name: '信任图谱', desc: '评价、评分、验证、用户信任评分' },
      ],
    },
    slide6: {
      label: '05 · 商业模式',
      title: '从第一天起\n多元收入来源',
      streams: [
        { pct: '55%', name: '交易手续费', desc: '通过托管服务每笔完成订单收取8%', color: '#7170ff' },
        { pct: '25%', name: 'Premium订阅', desc: '自由职业者每月₸2,000', color: '#f59e0b' },
        { pct: '12%', name: '推广位', desc: '推广订单和个人主页', color: '#27a644' },
        { pct: '8%',  name: 'AI代理使用费', desc: '按任务付费', color: '#3b82f6' },
      ],
      math: [
        { label: '平均订单金额', v: '₸85,000' },
        { label: '平台佣金(8%)', v: '₸6,800' },
        { label: '1万MAU每月订单数', v: '~2,500' },
        { label: '月收入', v: '₸1700万' },
      ],
    },
    slide7: {
      label: '06 · 牵引力',
      title: '早期信号\n令人振奋',
      metrics: [
        { n: 'v0.9', t: '已发布9个主要版本' },
        { n: '137', t: '静态SEO页面已被索引' },
        { n: '50+', t: '全球城市已覆盖' },
        { n: '5', t: 'AI代理在市场上线' },
      ],
      built: [
        '具有病毒效应的推荐系统', 'Telegram机器人已上线',
        'Featured Boost变现', '订单进度追踪器',
        '民主功能投票/vote', '双向订单完成评价',
        '含公司报告的管理后台', '多语言：RU, KK, EN',
      ],
    },
    slide8: {
      label: '07 · 路线图',
      title: '12个月内成为\n市场领导者',
      phases: [
        { q: 'Q2 2026', color: '#27a644', items: ['托管支付上线', '评价评分系统', 'AI市场', '1万注册用户'] },
        { q: 'Q3 2026', color: '#7170ff', items: ['iOS+Android移动应用', 'AI智能匹配(GPT-4)', '企业账户', '10万用户'] },
        { q: 'Q4 2026', color: '#f59e0b', items: ['进入乌兹别克斯坦和土耳其', '身份验证', 'DAO仲裁', '100万ARR'] },
        { q: '2027', color: '#e879f9', items: ['南亚市场启动', '$FLH治理代币', '链上声誉NFT', '100万用户'] },
      ],
    },
    slide9: {
      label: '08 · 团队',
      title: '快速交付的\n团队',
      desc: '我们的AI驱动团队每周发布新版本。30天内完成9个主要版本发布。平台从零到生产环境以创纪录的速度完成。',
      facts: ['30天内9次发布', '迄今零外部融资', '上线时137个页面', 'Full-stack AI + Web3架构'],
    },
    slide10: {
      label: '09 · 投资',
      title: '在起点\n加入我们',
      ask: '$500,000 — $2,000,000',
      askSub: '种子轮 · 股权',
      use: [
        { pct: '40%', label: '产品与工程', note: '托管、移动应用、AI匹配' },
        { pct: '35%', label: '营销与增长', note: '独联体扩张、SEO、Telegram营销' },
        { pct: '15%', label: '运营与法务', note: '许可证、合规、支持团队' },
        { pct: '10%', label: '储备金', note: '战略机会' },
      ],
      returns: [
        { label: '第1年收入', v: '₸1.2亿' },
        { label: '第2年收入', v: '₸8.5亿' },
        { label: '第3年收入', v: '₸50亿+' },
        { label: '目标估值', v: '5000万美元' },
      ],
      cta: '安排会议',
      contact: 'raimzhan1907@gmail.com',
    },
  },

  ar: {
    dir: 'rtl', flag: '🇸🇦', name: 'العربية',
    nav: ['المشكلة','الحل','السوق','المنتج','النموذج','التقدم','الخارطة','الفريق','الاستثمار'],
    slide1: {
      badge: 'فرصة استثمارية · الجولة أ',
      title: 'مستقبل العمل',
      sub: 'في آسيا الوسطى وما وراءها',
      desc: 'أول منصة عمل حر لا مركزية وذكاء اصطناعي متكامل تربط مليار شخص بالعمل — البشر والذكاء الاصطناعي على قدم المساواة.',
      cta: 'استعرض العرض التقديمي',
    },
    slide2: {
      label: '٠١ · المشكلة',
      title: 'سوق مكسور\nbبقيمة 2.5 تريليون دولار',
      points: [
        { n: '٧٣٪', t: 'من المستقلين تعرضوا للاحتيال أو عدم الدفع مرة واحدة على الأقل' },
        { n: '٠٪', t: 'لا توجد بنية تحتية للثقة في أسواق العمل الحر بمنطقة رابطة الدول المستقلة' },
        { n: '٦٨٪', t: 'من الصفقات تتم خارج المنصات دون أي حماية' },
        { n: '٠ ₸', t: 'يمر عبر خدمات الضمان في اقتصاد العمل الحر بدول رابطة الدول المستقلة' },
      ],
      insight: 'تتجاهل Upwork وFiverr 280 مليون مستخدم من رابطة الدول المستقلة وآسيا الوسطى. نحن لا نفعل ذلك.',
    },
    slide3: {
      label: '٠٢ · الحل',
      title: 'FreelanceHub',
      sub: 'منصة واحدة. بشر + ذكاء اصطناعي. موثوقة.',
      features: [
        { icon: '🤖', t: 'المستقلون من البشر والذكاء الاصطناعي جنباً إلى جنب' },
        { icon: '🔒', t: 'ضمان الأموال: محتجزة حتى الموافقة على العمل' },
        { icon: '⭐', t: 'مراجعات موثقة مرتبطة بطلبات مكتملة فعلية' },
        { icon: '🌍', t: 'أكثر من 50 مدينة، 5 لغات، أكثر من 30 عملة' },
        { icon: '📱', t: 'نمو Telegram-first لسوق دول رابطة الدول المستقلة' },
        { icon: '🗳️', t: 'خارطة طريق ديمقراطية — يصوت المستخدمون على الميزات' },
      ],
    },
    slide4: {
      label: '٠٣ · السوق',
      title: 'سوق ضخم\nوغير مخدوم',
      tam: { v: '٤٥٥ مليار $', t: 'السوق العالمي للعمل الحر 2024' },
      sam: { v: '١٨ مليار $', t: 'رابطة الدول المستقلة + آسيا الوسطى + الشرق الأوسط وشمال أفريقيا' },
      som: { v: '١٨٠ مليون $', t: 'استحواذ 1% = هدفنا للسنة الثالثة' },
      growth: 'معدل نمو سنوي مركب 23% حتى 2028',
      regions: [
        { name: 'كازاخستان', pop: '١٩ مليون', note: 'السوق الأساسي، 40% شباب' },
        { name: 'أوزبكستان', pop: '٣٦ مليون', note: 'أسرع نمو للتكنولوجيا في رابطة الدول المستقلة' },
        { name: 'روسيا/رابطة الدول المستقلة', pop: '٢٠٠+ مليون', note: 'أكبر مجموعة من المواهب' },
        { name: 'جنوب آسيا', pop: '١.٨ مليار', note: 'السوق الأول عالمياً للعمل الحر' },
      ],
    },
    slide5: {
      label: '٠٤ · المنتج',
      title: 'مصمم لـ\n١٠ ملايين مستخدم',
      modules: [
        { icon: '📋', name: 'طلبات ذكية', desc: 'الذكاء الاصطناعي يكتب الموجز ويطابق أفضل المستقلين تلقائياً' },
        { icon: '🤖', name: 'وكلاء AI', desc: 'تسويق وسائل التواصل الاجتماعي، كتابة الإعلانات، الصفحات المقصودة — مستقلون بالذكاء الاصطناعي عند الطلب' },
        { icon: '💬', name: 'المراسلة', desc: 'محادثات مشفرة، مشاركة الملفات، عقود مدمجة' },
        { icon: '📊', name: 'متتبع المعالم', desc: '4 خطوات: لم يبدأ → قيد المراجعة → مكتمل' },
        { icon: '🔐', name: 'محرك الضمان', desc: 'الأموال محتجزة بأمان، تُحرر عند الموافقة، عمولة 8%' },
        { icon: '⭐', name: 'رسم الثقة', desc: 'مراجعات، تقييمات، توثيق، درجة ثقة المستخدم' },
      ],
    },
    slide6: {
      label: '٠٥ · نموذج الأعمال',
      title: 'مصادر إيرادات متعددة\nمن اليوم الأول',
      streams: [
        { pct: '٥٥٪', name: 'رسوم المعاملات', desc: '8% على كل طلب مكتمل عبر الضمان', color: '#7170ff' },
        { pct: '٢٥٪', name: 'اشتراكات Premium', desc: '₸2,000/شهر للمستقلين', color: '#f59e0b' },
        { pct: '١٢٪', name: 'القوائم المميزة', desc: 'طلبات وملفات شخصية مروجة', color: '#27a644' },
        { pct: '٨٪',  name: 'استخدام وكيل AI', desc: 'الدفع مقابل كل مهمة', color: '#3b82f6' },
      ],
      math: [
        { label: 'متوسط قيمة الطلب', v: '₸85,000' },
        { label: 'عمولة المنصة (8%)', v: '₸6,800' },
        { label: 'الطلبات/شهر عند 10K MAU', v: '~2,500' },
        { label: 'الإيرادات الشهرية', v: '₸17 مليون' },
      ],
    },
    slide7: {
      label: '٠٦ · التقدم',
      title: 'الإشارات الأولى\nواعدة جداً',
      metrics: [
        { n: 'v0.9', t: '9 إصدارات رئيسية تم شحنها' },
        { n: '137', t: 'صفحة SEO ثابتة مفهرسة' },
        { n: '50+', t: 'مدينة عالمية مشمولة' },
        { n: '5', t: 'وكلاء AI في السوق' },
      ],
      built: [
        'نظام إحالة بتأثير فيروسي', 'روبوت Telegram مباشر',
        'تحقيق دخل من Featured Boost', 'متتبع تقدم الطلبات',
        'التصويت الديمقراطي /vote', 'مراجعات ثنائية الاتجاه بعد الطلبات',
        'لوحة مشرف مع تقارير الشركة', 'تعدد اللغات: RU, KK, EN',
      ],
    },
    slide8: {
      label: '٠٧ · خارطة الطريق',
      title: '12 شهراً لقيادة\nالسوق',
      phases: [
        { q: 'الربع الثاني 2026', color: '#27a644', items: ['مدفوعات الضمان مباشرة', 'إطلاق نظام التقييم', 'سوق AI', '10,000 مستخدم'] },
        { q: 'الربع الثالث 2026', color: '#7170ff', items: ['تطبيق جوال iOS + Android', 'مطابقة AI ذكية (GPT-4)', 'حسابات شركات', '100,000 مستخدم'] },
        { q: 'الربع الرابع 2026', color: '#f59e0b', items: ['التوسع لأوزبكستان وتركيا', 'التحقق من الهوية', 'تحكيم DAO', 'مليون دولار ARR'] },
        { q: '2027', color: '#e879f9', items: ['الإطلاق في جنوب آسيا', 'رمز $FLH', 'سمعة NFT على السلسلة', 'مليون مستخدم'] },
      ],
    },
    slide9: {
      label: '٠٨ · الفريق',
      title: 'فريق يُنجز\nبسرعة',
      desc: 'يصدر فريقنا المدعوم بالذكاء الاصطناعي إصداراً كل أسبوع. 9 إصدارات رئيسية في 30 يوماً. تم بناء المنصة من الصفر حتى الإنتاج في وقت قياسي.',
      facts: ['9 إصدارات في 30 يوماً', 'لا تمويل خارجي حتى الآن', '137 صفحة عند الإطلاق', 'بنية Full-stack AI + Web3'],
    },
    slide10: {
      label: '٠٩ · الاستثمار',
      title: 'انضم إلينا\nمن البداية',
      ask: '$500,000 — $2,000,000',
      askSub: 'جولة بذرية · حقوق ملكية',
      use: [
        { pct: '٤٠٪', label: 'المنتج والهندسة', note: 'الضمان، التطبيق المحمول، مطابقة AI' },
        { pct: '٣٥٪', label: 'التسويق والنمو', note: 'التوسع في رابطة الدول المستقلة، SEO، حملات Telegram' },
        { pct: '١٥٪', label: 'العمليات والقانونية', note: 'التراخيص، الامتثال، فريق الدعم' },
        { pct: '١٠٪', label: 'الاحتياطي', note: 'الفرص الاستراتيجية' },
      ],
      returns: [
        { label: 'إيرادات السنة 1', v: '₸120 مليون' },
        { label: 'إيرادات السنة 2', v: '₸850 مليون' },
        { label: 'إيرادات السنة 3', v: '₸5 مليار+' },
        { label: 'التقييم المستهدف', v: '50 مليون $' },
      ],
      cta: 'جدولة اجتماع',
      contact: 'raimzhan1907@gmail.com',
    },
  },
} as const

type LangKey = keyof typeof T

// ── ANIMATED COUNTER ──────────────────────────────────────────
function useCounter(target: number, duration = 1500, start = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf: number
    const startTime = performance.now()
    function tick(now: number) {
      const p = Math.min((now - startTime) / duration, 1)
      setVal(Math.round(p * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  return val
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function PitchDeck() {
  const [lang, setLang] = useState<LangKey>('ru')
  const [slide, setSlide] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [started, setStarted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const t = T[lang]
  const TOTAL = 10

  function go(dir: number) {
    if (animating) return
    const next = slide + dir
    if (next < 0 || next >= TOTAL) return
    setAnimating(true)
    setTimeout(() => { setSlide(next); setAnimating(false) }, 300)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => { setStarted(true) }, [])

  const isRTL = t.dir === 'rtl'

  const BG = 'linear-gradient(135deg, #08080f 0%, #0d0d1a 50%, #0a0a14 100%)'

  return (
    <div
      ref={containerRef}
      style={{ minHeight: '100vh', background: BG, color: '#fff', position: 'relative', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif' }}
      dir={t.dir}
    >
      {/* Grid background */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(113,112,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(113,112,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(113,112,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── TOP BAR ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(8,8,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7170ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Rocket style={{ width: 14, height: 14, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>FreelanceHub</span>
          <span style={{ fontSize: 10, color: '#7170ff', background: 'rgba(113,112,255,0.15)', padding: '2px 8px', borderRadius: 99, fontWeight: 600, letterSpacing: '0.04em' }}>INVESTOR DECK</span>
        </div>

        {/* Slide nav dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 99, background: i === slide ? '#7170ff' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* Language switcher */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(Object.keys(T) as LangKey[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: lang === l ? 'rgba(113,112,255,0.2)' : 'transparent',
                border: lang === l ? '1px solid rgba(113,112,255,0.4)' : '1px solid transparent',
                color: lang === l ? '#7170ff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {T[l].flag} {T[l].name}
            </button>
          ))}
        </div>
      </div>

      {/* ── SLIDES ── */}
      <div style={{ paddingTop: 60, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: animating ? 0 : 1, transition: 'opacity 0.3s', padding: '80px 48px 80px' }}>

        {/* ── SLIDE 0: COVER ── */}
        {slide === 0 && (
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(113,112,255,0.1)', border: '1px solid rgba(113,112,255,0.3)', marginBottom: 32 }}>
              <Crown style={{ width: 13, height: 13, color: '#fbbf24' }} />
              <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, letterSpacing: '0.06em' }}>{t.slide1.badge}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1.0, marginBottom: 8, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t.slide1.title}
            </h1>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 400, color: '#7170ff', marginBottom: 32, letterSpacing: '-0.02em' }}>
              {t.slide1.sub}
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.7 }}>
              {t.slide1.desc}
            </p>
            <button
              onClick={() => setSlide(1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #7170ff, #a78bfa)', color: '#fff', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' }}
            >
              {t.slide1.cta} <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center', gap: 48 }}>
              {[{ v: '$455B', l: 'Global market' }, { v: '280M', l: 'CIS + CA users' }, { v: '8%', l: 'Platform fee' }].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#7170ff', letterSpacing: '-0.03em' }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SLIDE 1: PROBLEM ── */}
        {slide === 1 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <Label text={t.slide2.label} />
            <h2 style={H2}>{t.slide2.title.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 32 }}>
              {t.slide2.points.map((p, i) => (
                <div key={i} style={{ padding: '28px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: '#e5484d', letterSpacing: '-0.04em', marginBottom: 8 }}>{p.n}</div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{p.t}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '20px 28px', borderRadius: 12, background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.2)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <Target style={{ width: 20, height: 20, color: '#7170ff', flexShrink: 0 }} />
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{t.slide2.insight}</p>
            </div>
          </div>
        )}

        {/* ── SLIDE 2: SOLUTION ── */}
        {slide === 2 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <Label text={t.slide3.label} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
              <h2 style={{ ...H2, marginBottom: 0 }}>{t.slide3.title}</h2>
            </div>
            <p style={{ fontSize: 22, color: '#7170ff', marginBottom: 40, fontWeight: 500 }}>{t.slide3.sub}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {t.slide3.features.map((f, i) => (
                <div key={i} style={{ padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</span>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{f.t}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SLIDE 3: MARKET ── */}
        {slide === 3 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <Label text={t.slide4.label} />
            <h2 style={H2}>{t.slide4.title.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
              {[t.slide4.tam, t.slide4.sam, t.slide4.som].map((m, i) => (
                <div key={i} style={{ padding: '28px', borderRadius: 16, background: i === 0 ? 'rgba(113,112,255,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 0 ? 'rgba(113,112,255,0.25)' : 'rgba(255,255,255,0.07)'}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: i === 0 ? '#7170ff' : i === 1 ? '#f59e0b' : '#27a644', letterSpacing: '-0.03em', marginBottom: 8 }}>{m.v}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{m.t}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 99, background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.25)', color: '#27a644', fontSize: 14, fontWeight: 600, marginBottom: 28 }}>
              📈 {t.slide4.growth}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {t.slide4.regions.map((r, i) => (
                <div key={i} style={{ padding: '18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{r.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#7170ff', marginBottom: 4, letterSpacing: '-0.02em' }}>{r.pop}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{r.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SLIDE 4: PRODUCT ── */}
        {slide === 4 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <Label text={t.slide5.label} />
            <h2 style={H2}>{t.slide5.title.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {t.slide5.modules.map((m, i) => (
                <div key={i} style={{ padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>{m.icon}</span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>{m.name}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SLIDE 5: BUSINESS MODEL ── */}
        {slide === 5 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <Label text={t.slide6.label} />
            <h2 style={H2}>{t.slide6.title.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {t.slide6.streams.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.pct}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '28px', borderRadius: 16, background: 'rgba(113,112,255,0.06)', border: '1px solid rgba(113,112,255,0.2)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7170ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unit Economics</div>
                {t.slide6.math.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < t.slide6.math.length - 1 ? 20 : 0, borderBottom: i < t.slide6.math.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{m.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{m.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SLIDE 6: TRACTION ── */}
        {slide === 6 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <Label text={t.slide7.label} />
            <h2 style={H2}>{t.slide7.title.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
              {t.slide7.metrics.map((m, i) => (
                <div key={i} style={{ padding: '24px', borderRadius: 16, background: 'rgba(113,112,255,0.06)', border: '1px solid rgba(113,112,255,0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: '#7170ff', letterSpacing: '-0.04em', marginBottom: 8 }}>{m.n}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{m.t}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {t.slide7.built.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(39,166,68,0.05)', border: '1px solid rgba(39,166,68,0.15)' }}>
                  <Check style={{ width: 14, height: 14, color: '#27a644', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SLIDE 7: ROADMAP ── */}
        {slide === 7 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <Label text={t.slide8.label} />
            <h2 style={H2}>{t.slide8.title.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {t.slide8.phases.map((phase, i) => (
                <div key={i} style={{ padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: `1px solid ${phase.color}25` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: phase.color, marginBottom: 16, padding: '4px 12px', borderRadius: 99, background: `${phase.color}15`, display: 'inline-block' }}>
                    {phase.q}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {phase.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: phase.color, flexShrink: 0, marginTop: 6 }} />
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SLIDE 8: TEAM ── */}
        {slide === 8 && (
          <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', textAlign: 'center' }}>
            <Label text={t.slide9.label} />
            <h2 style={H2}>{t.slide9.title.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.75 }}>
              {t.slide9.desc}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
              {t.slide9.facts.map((f, i) => (
                <div key={i} style={{ padding: '16px 28px', borderRadius: 12, background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Zap style={{ width: 16, height: 16, color: '#7170ff' }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 48, padding: '28px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'inline-flex', gap: 48, alignItems: 'center' }}>
              {[{ n: '100%', l: 'AI-powered dev' }, { n: 'v0.9', l: 'Current version' }, { n: '30d', l: 'From idea to launch' }].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.03em' }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SLIDE 9: INVESTMENT ── */}
        {slide === 9 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <Label text={t.slide10.label} />
            <h2 style={H2}>{t.slide10.title.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
              {/* Ask */}
              <div style={{ padding: '36px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(113,112,255,0.12), rgba(113,112,255,0.06))', border: '1px solid rgba(113,112,255,0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.slide10.askSub}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>{t.slide10.ask}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
                  {t.slide10.use.map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(113,112,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#7170ff' }}>{u.pct}</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{u.label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{u.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {t.slide10.returns.map((r, i) => (
                  <div key={i} style={{ padding: '20px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{r.label}</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: i === 3 ? '#fbbf24' : '#27a644', letterSpacing: '-0.02em' }}>{r.v}</span>
                  </div>
                ))}

                {/* CTA */}
                <a
                  href={`mailto:${t.slide10.contact}?subject=Investment in FreelanceHub`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '18px', borderRadius: 14, background: 'linear-gradient(135deg, #7170ff, #a78bfa)', color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em', marginTop: 4 }}
                >
                  {t.slide10.cta} <ArrowRight style={{ width: 18, height: 18 }} />
                </a>
                <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                  {t.slide10.contact}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── NAV ARROWS ── */}
      <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 50 }}>
        <button
          onClick={() => go(-1)}
          disabled={slide === 0}
          style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: slide === 0 ? 'not-allowed' : 'pointer', opacity: slide === 0 ? 0.3 : 1, transition: 'all 0.2s' }}
        >
          <ChevronLeft style={{ width: 18, height: 18 }} />
        </button>

        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', minWidth: 60, textAlign: 'center' }}>
          {slide + 1} / {TOTAL}
        </span>

        <button
          onClick={() => go(1)}
          disabled={slide === TOTAL - 1}
          style={{ width: 44, height: 44, borderRadius: '50%', background: slide === TOTAL - 1 ? 'rgba(255,255,255,0.06)' : 'rgba(113,112,255,0.3)', border: '1px solid rgba(113,112,255,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: slide === TOTAL - 1 ? 'not-allowed' : 'pointer', opacity: slide === TOTAL - 1 ? 0.3 : 1, transition: 'all 0.2s' }}
        >
          <ChevronRight style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* ── SIDEBAR SECTION LABELS ── */}
      <div style={{ position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 40 }}>
        {t.nav.map((label, i) => (
          <button
            key={i}
            onClick={() => setSlide(i + 1)}
            title={label}
            style={{
              width: 4, height: i + 1 === slide ? 24 : 4,
              borderRadius: 99,
              background: i + 1 === slide ? '#7170ff' : 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── SHARED STYLES ─────────────────────────────────────────────
const H2: React.CSSProperties = {
  fontSize: 'clamp(32px, 5vw, 56px)',
  fontWeight: 700,
  letterSpacing: '-0.04em',
  color: '#fff',
  marginBottom: 36,
  lineHeight: 1.1,
  fontFeatureSettings: '"cv01", "ss03"',
}

function Label({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 12, color: '#7170ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, opacity: 0.8 }}>
      {text}
    </div>
  )
}
