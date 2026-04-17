# Design System

Миксуем **LinkedIn** (профили, feed), **Instagram** (stories, реакции) и **Telegram** (messenger bubbles, long-press).

## Токены

| Var              | Назначение           |
| ---------------- | -------------------- |
| `--fh-bg`        | фон страницы         |
| `--fh-surface`   | карточки             |
| `--fh-border`    | бордеры              |
| `--fh-sep`       | сепараторы           |
| `--fh-t1..t4`    | текст primary → muted |

Акценты: `#7170ff` (primary), `#27a644` (success), `#0ea5e9` (info).

## Navigation

- **TopBar** — всегда кроме auth
- **[[BottomNav]]** — на app-страницах, **скрыт внутри открытого чата** ([[MessengerPage]] list — виден, chat — нет). См. [[Release 1.2.0]].

## Mobile

- Tap targets ≥44px
- Safe-area insets respected (splash, bottom nav)
- `prefers-color-scheme` respected
- См. [[Mobile-first UX]]
