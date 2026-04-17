# Messenger

`/messages` — список чатов + открытый чат.

## Поведение

- В списке чатов [[BottomNav]] виден
- Внутри открытого чата [[BottomNav]] скрыт
- Реакции: 6 быстрых + «+» открывает полный emoji picker (см. [[Release 1.1.0]])
- Long-press на сообщение → action sheet (reply / forward / copy / delete)

## Компонент

Главный файл: [[MessengerPage]].

## Известные баги

- [[Red unread badge]] — починено в [[Release 1.4.0]]
- Root cause: [[Supabase PostgrestBuilder]]

## Связи

- Badge непрочитанных использует: `useUnreadMessages` hook
- Splash при переходе сюда: [[Release 1.2.0]]
