# ProfileContext

`lib/context/ProfileContext.tsx` — глобальное состояние пользователя и профиля.

## Изменения в [[Release 1.3.0]]

```tsx
const userId = user?.id                    // локаль!
const fetchProfile = useCallback(..., [userId])   // deps матчат тело
```

Без этого [[React Compiler]] не мемоизировал — `user?.id` в deps против `user.id` в теле. Тот же фикс в [[Notifications]] и `dashboard/goals`.

## Использование

- [[BottomNav]] — показ current user
- [[Feed]], [[Messenger]], [[Profile]], ...
