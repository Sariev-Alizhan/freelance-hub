# React Compiler

Включён в Next.js 16. Мемоизирует компоненты и хуки **автоматически** — не надо писать `useMemo`/`useCallback` руками в большинстве случаев.

## Когда ломается

Компилятор делает static analysis. Если deps в `useCallback` **не совпадают** с тем что реально читается в теле — skip.

Плохо:
```tsx
const f = useCallback(() => fetch(user.id), [user?.id])
// deps: user?.id  vs  body: user.id  → пропуск
```

Хорошо:
```tsx
const userId = user?.id
const f = useCallback(() => fetch(userId), [userId])
```

## Где лечили

- [[ProfileContext]]
- [[Notifications]]
- [[Dashboard]] `/goals`

Все в [[Release 1.3.0]].

## Связанные концепты

- [[Rules of Hooks]]
- [[React hooks purity]]
- [[TDZ]]
