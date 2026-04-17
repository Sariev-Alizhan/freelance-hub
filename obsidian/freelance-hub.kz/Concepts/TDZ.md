# TDZ (Temporal Dead Zone)

Переменные/функции объявленные через `const`/`let` недоступны **до** строки объявления. [[React Compiler]] ловит и этот класс проблем.

## Анти-паттерн

```tsx
useEffect(() => {
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goPrev()   // ← TDZ: goPrev ещё не объявлен
  })
}, [])

const goPrev = useCallback(() => ..., [])
```

## Фикс

Хойстим `goPrev`/`goNext` как `useCallback` **выше** эффекта:

```tsx
const goPrev = useCallback(() => ..., [])
const goNext = useCallback(() => ..., [])

useEffect(() => {
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goPrev()
  })
}, [goPrev])
```

## Инцидент

- [[StoryViewer TDZ]] → [[Release 1.3.0]]

## Связанные

- [[Rules of Hooks]]
- [[React Compiler]]
