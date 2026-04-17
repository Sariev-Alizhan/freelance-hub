# BottomNav hooks crash

**Статус:** closed in [[Release 1.3.0]]

## Симптом

Краш при переходе `/auth ↔ app` routes. React ругался на нарушение [[Rules of Hooks]].

## Root cause

В [[BottomNav]] `useCallback` был **после** `if (hidden) return null`. При переходе между hidden/visible состояниями количество вызванных хуков менялось.

## Fix

Перенесли все `useCallback` **выше** early return.

## Lesson

Любые хуки (`useState`, `useEffect`, `useCallback`, `useMemo`) — **всегда** до любого conditional return.
