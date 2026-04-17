# Feed

`app/(app)/feed/page.tsx` — главная после логина.

## Содержит

- Stories bar сверху
- Интерливит: user posts + news + [[ReleaseCard]] + [[EditorCard]]
- Курируемый контент из `lib/feed-content.ts`

## Порядок карточек

Pinned `update` + `EDITOR_POSTS[0]` + `FEED_RELEASES[0]` → дальше новости, каждые 4 — следующая курированная.

## Связи

- Рендерит: [[ReleaseCard]], [[EditorCard]]
- Использует: [[ProfileContext]]
- Куда попадают: [[Auth Callback]], [[Onboarding]] → сюда
- Landed here in [[Release 1.5.0]]
