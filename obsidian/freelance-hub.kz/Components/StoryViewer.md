# StoryViewer

`components/stories/StoryViewer.tsx` — Instagram-style viewer историй.

## Инциденты

[[StoryViewer TDZ]] — `goNext`/`goPrev` использовались в `useEffect` до declaration. Починено в [[Release 1.3.0]].

## Изменения за [[Release 1.3.0]]

- `useRef(Date.now())` → `useRef(0)`, seed через useEffect (см. [[React hooks purity]])
- `Date.now()` в render body → `useState<number | null>`
- `goNext/Prev` hoisted как `useCallback` выше keyboard effect
- Убрали unused `isDark` prop

## Связи

- Правило: [[Rules of Hooks]], [[TDZ]], [[React Compiler]]
- Используется из: `StoriesBar` (открывается из [[Feed]])
