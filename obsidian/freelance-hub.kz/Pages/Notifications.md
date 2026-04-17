# Notifications

`app/(app)/notifications/page.tsx` — центр уведомлений.

## Поведение

При входе авто-помечает всё прочитанным. Использует те же [[Supabase PostgrestBuilder]] паттерны что и [[MessengerPage]].

## Связи

- [[Red unread badge]] — аналогичный баг был здесь, пофикшен в [[Release 1.4.0]]
- [[React Compiler]] разблокирован: `userId = user?.id` локаль → см. [[Release 1.3.0]]
