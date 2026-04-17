# Onboarding

`app/(app)/onboarding/page.tsx` — первичная настройка после регистрации.

## Финиш

```ts
router.push('/feed?onboarding=1')
```

Обе роли (freelancer / client) попадают на [[Feed]]. До [[Release 1.5.0]] фрилансер шёл на `/dashboard`, клиент — на `/orders`.

## Связи

- Предыдущий шаг: регистрация → [[Auth Callback]]
- Следующий: [[Feed]]
