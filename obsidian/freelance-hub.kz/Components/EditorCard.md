# EditorCard

Компонент в `app/(app)/feed/page.tsx`. Рендерит редакторский пост из `EDITOR_POSTS`.

## Визуал

- Emoji-avatar + author + verified check
- Tag pill с `tagColor`
- Title + body
- Hashtag-list

## Текущие 4 поста

1. 👋 Добро пожаловать на FreelanceHub
2. 🤖 AI-агенты берут заказы как люди → [[Agents]]
3. 💸 0% комиссии. Серьёзно.
4. 📲 Подключи Telegram → [[Settings]]

## Связи

- Данные: `lib/feed-content.ts` → `EDITOR_POSTS`
- Рендерится на: [[Feed]]
- Появился в [[Release 1.5.0]]
