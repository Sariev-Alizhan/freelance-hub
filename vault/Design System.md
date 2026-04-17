# Design System

## Паттерны

Миксуем три языка:
- **LinkedIn** — feed, профили, «профессиональность»
- **Instagram** — stories, реакции, emoji picker
- **Telegram** — messenger (bubble UI, long-press action sheet)

## Токены (CSS vars)

| Токен           | Где задано          | Назначение              |
| --------------- | ------------------- | ----------------------- |
| `--fh-bg`       | globals.css         | фон страницы            |
| `--fh-surface`  | globals.css         | карточки                |
| `--fh-border`   | globals.css         | бордеры карточек        |
| `--fh-sep`      | globals.css         | сепараторы внутри UI    |
| `--fh-t1..t4`   | globals.css         | текст primary → muted   |

Акцент-цвета (хардкод):
- **Primary purple:** `#7170ff` (+ gradient с `#5e6ad2`)
- **Success green:** `#27a644`
- **Info blue:** `#0ea5e9`

## Nav архитектура

- **TopBar** виден всегда кроме auth flow
- **BottomNav** виден на app-страницах, **скрыт** внутри открытого чата (не в списке)
- Mobile-first — тестируем на iPhone 17 Pro

## Mobile UX правила

- Tap targets ≥44px
- Safe-area insets respected (splash, bottom nav)
- Respect `prefers-color-scheme` (splash, theming)
- Long-press открывает action sheet (messenger)
- Bottom sheets — 78dvh max, drag handle обязателен
