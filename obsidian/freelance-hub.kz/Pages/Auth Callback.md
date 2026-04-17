# Auth Callback

`app/(auth)/auth/callback/route.ts` — OAuth/email redirect после успешной аутентификации.

## Поведение

```ts
const rawNext = url.searchParams.get('next') ?? '/feed'
const next    = /^\/[a-zA-Z0-9/_\-?=&#]*$/.test(rawNext) ? rawNext : '/feed'
```

Дефолт — [[Feed]]. До [[Release 1.5.0]] был `/dashboard`.

## Связи

- Кидает на: [[Feed]] (или `next` параметр, если валиден)
- Переход фиксился в [[Release 1.5.0]]
- См. также [[Onboarding]] — тоже редиректит на [[Feed]] после финиша
