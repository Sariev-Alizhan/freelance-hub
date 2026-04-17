# Supabase PostgrestBuilder

**Query builder ленивый.** Цепочка `.from(...).update(...).eq(...)` **не фаерится** пока ты её не `await`нул или не `.then()`-нул.

## Симптом

Код *выглядит* как будто делает UPDATE, но БД не трогается. Никаких ошибок.

## Как ловить

- Нет INSERT/UPDATE в Supabase logs
- Realtime subscribers не получают event
- Состояние на UI не обновляется

## Где уже было больно

- [[MessengerPage]] — [[Red unread badge]] держался из-за этого. [[Release 1.4.0]]
- [[Notifications]] — аналогичный баг в 4 местах того же файла

## Правило

```ts
// плохо: dead chain
db.from('messages').update({ is_read: true }).eq(...)

// хорошо
await db.from('messages').update({ is_read: true }).eq(...)
// или fire-and-forget:
db.from('messages').update({ is_read: true }).eq(...).then(() => {})
```
