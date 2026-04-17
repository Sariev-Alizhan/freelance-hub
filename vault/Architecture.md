# Architecture

## Стек

- **Next.js 16.2.3** — App Router, Turbopack, React Compiler включён
- **Supabase** — auth (OAuth + email OTP), Postgres, realtime, storage
- **Framer Motion** — анимации
- **Tailwind + CSS vars** — токены `--fh-*` для theming
- **lucide-react** — иконки

## Структура

```
app/
  (auth)/auth/           — логин, регистрация, OAuth callback
  (app)/                  — защищённые страницы (feed, profile, messages, ...)
  api/                    — роуты
components/
  layout/                 — TopBar, BottomNav, Shell
  landing/                — HeroSection, AgentsSection, ...
  messages/               — MessengerPage, ChatView, ...
  stories/                — StoriesBar, StoryViewer, CreateStoryModal
lib/
  context/                — ProfileContext, LanguageContext
  supabase/               — client / server helpers
  feed-content.ts         — курируемые релизы + editor-посты
supabase/
  migrations/             — SQL миграции
```

## Критически важно

- **Supabase `PostgrestBuilder` ленивый.** Цепочка `.from().update()...` не сработает пока не будет `await` или `.then()`. Дважды ловили баг с нежоторгнутым `is_read` апдейтом (красный бейдж непрочитанных).
- **React Compiler** мемоизирует автоматически. Если в deps стоит `user?.id`, а в body — `user.id`, компилятор пропускает. Фикс: `const userId = user?.id` + использовать `userId` везде.
- **Rules of Hooks:** `useCallback/useMemo` **до** любого `return null`. Ловили на BottomNav.
- **После логина → `/feed`** (раньше было `/dashboard`). Callback: `app/(auth)/auth/callback/route.ts`.
