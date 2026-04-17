# Releases

Синхронизировано с `lib/feed-content.ts` (`FEED_RELEASES`). Источник истины там — эта заметка читается, но не редактируется руками.

## 1.5.0 — 2026-04-17 ✨

Лендинг почищен + лента по умолчанию.

- Убраны fake-цены с карточек AI-агентов
- ∞ Countries → Global Reach
- Redirect после логина: `/dashboard` → `/feed`
- Онбординг финиширует на `/feed`

## 1.4.0 — 2026-04-17 🔔

Красный бейдж непрочитанных больше не висит.

- **Root cause:** Supabase update builder не терминировался (`.then()` отсутствовал)
- Фикс в `MessengerPage.tsx:322, 343` и в `notifications/page.tsx` (4 места)

## 1.3.0 — 2026-04-16 🛡️

Стабильность: Rules of Hooks + React Compiler.

- BottomNav: `useCallback` до early return
- StoryViewer: `Date.now()` → `useState`, `goNext/Prev` → `useCallback` (TDZ)
- React Compiler разблокирован в `ProfileContext`, `notifications`, `goals`

## 1.2.0 — 2026-04-16 🎬

Splash screen + bottom nav в списке чатов.

## 1.1.0 — 2026-04-15 💬

Messenger: 6 quick reactions + emoji picker + long-press action sheet.
