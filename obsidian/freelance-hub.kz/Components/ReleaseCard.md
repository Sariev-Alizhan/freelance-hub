# ReleaseCard

Компонент в `app/(app)/feed/page.tsx`. Рендерит запись из `FEED_RELEASES` (`lib/feed-content.ts`).

## Визуал

- Version pill + date
- Emoji + title
- Summary
- Bulleted highlights (4 шт)

## Связи

- Данные: `lib/feed-content.ts` → `FEED_RELEASES`
- Типы: `FeedRelease`
- Рендерится на: [[Feed]]
- Записи: [[Release 1.1.0]], [[Release 1.2.0]], [[Release 1.3.0]], [[Release 1.4.0]], [[Release 1.5.0]]
- Сам компонент появился в [[Release 1.5.0]]
