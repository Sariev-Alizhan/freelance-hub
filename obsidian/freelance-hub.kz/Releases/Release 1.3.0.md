# Release 1.3.0 — 2026-04-16 🛡️

**Стабильность: Rules of Hooks + React Compiler.**

## Изменения

- [[BottomNav]]: `useCallback` до early return → [[BottomNav hooks crash]] closed
- [[StoryViewer]]: `Date.now()` → `useState` ([[React hooks purity]]); `goNext/Prev` → `useCallback` ([[TDZ]]) → [[StoryViewer TDZ]] closed
- [[React Compiler]] мемоизация разблокирована в 3 местах:
  - [[ProfileContext]]
  - [[Notifications]]
  - [[Dashboard]] `/goals`
- Убраны мёртвые импорты и props (e.g. `isDark`)

## Commits

`e548204`, `8350a79`, `3552300`, `e3a6c6f`
