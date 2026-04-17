# Rules of Hooks

Все хуки — **до любого early return**. Иначе React не сможет сопоставить состояние между рендерами.

## Анти-паттерн

```tsx
function BottomNav() {
  if (hidden) return null           // ← early return
  const onClick = useCallback(...)  // ← хук ПОСЛЕ return → крэш
}
```

## Правильно

```tsx
function BottomNav() {
  const onClick = useCallback(...)
  if (hidden) return null
}
```

## Инциденты

- [[BottomNav hooks crash]] → [[Release 1.3.0]]

## Связанные

- [[React Compiler]] — усиливает соблюдение
- [[TDZ]] — отдельный класс проблем, тоже ловит компилятор
