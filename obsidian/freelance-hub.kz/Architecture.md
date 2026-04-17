# Architecture

## Стек

- **Next.js 16.2.3** — App Router, Turbopack, [[React Compiler]] on
- **Supabase** — auth (OAuth + email OTP), Postgres, realtime, storage
- **Framer Motion** — анимации
- **Tailwind + CSS vars** — см. [[Design System]]
- **lucide-react** — иконки

## Структура

```
app/
  (auth)/auth/            — [[Auth Callback]], login, register
  (app)/                  — [[Feed]], [[Profile]], [[Messenger]], ...
components/
  layout/                 — [[BottomNav]], TopBar, Shell
  landing/                — [[HeroSection]], [[AgentsSection]]
  messages/               — [[MessengerPage]]
  stories/                — [[StoryViewer]]
lib/
  context/                — [[ProfileContext]], LanguageContext
  supabase/               — см. [[Supabase PostgrestBuilder]]
  feed-content.ts         — курируемые [[ReleaseCard]] + [[EditorCard]] данные
```

## Load-bearing правила

- [[Supabase PostgrestBuilder]] ленивый — всегда терминируем `await` или `.then()`
- [[React Compiler]] мемоизация ломается на несоответствии deps — см. заметку
- [[Rules of Hooks]] — hooks **до** любого early return
- После логина [[Auth Callback]] → [[Feed]] (не `/dashboard`)
