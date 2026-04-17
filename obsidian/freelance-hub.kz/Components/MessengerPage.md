# MessengerPage

`components/messages/MessengerPage.tsx` — главный компонент [[Messenger]].

## Critical fix: [[Red unread badge]]

```tsx
db.from('messages')
  .update({ is_read: true })
  .eq('conversation_id', activeId)
  .neq('sender_id', user.id)
  .eq('is_read', false)
  .then(() => {})        // ← без этого chain был dead code
```

Root cause: [[Supabase PostgrestBuilder]] — ленивый, не фаерится без термина. См. [[Release 1.4.0]].

## Реакции

6 быстрых + «+» → полный emoji picker (78dvh bottom sheet), long-press → action sheet. См. [[Release 1.1.0]].

## Связи

- Page: [[Messenger]]
- Скрывает [[BottomNav]] внутри открытого чата
