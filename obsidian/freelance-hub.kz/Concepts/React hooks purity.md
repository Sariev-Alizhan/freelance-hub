# React hooks purity

`react-hooks/purity` — render должен быть **чистым**. Никаких `Date.now()`, `Math.random()`, `localStorage.getItem()` в теле компонента или `useRef(initialValue)` с импуром.

## Анти-паттерн

```tsx
const ref = useRef(Date.now())   // ← impure init
const delta = Date.now() - ref.current   // ← impure read
```

## Фикс

```tsx
const ref = useRef(0)
const [now, setNow] = useState<number | null>(null)

useEffect(() => { setNow(Date.now()) }, [story?.id])
```

## Инциденты

- [[StoryViewer TDZ]] — параллельно с TDZ лечили и purity-варнинги

## Связанные

- [[React Compiler]]
- [[Rules of Hooks]]
