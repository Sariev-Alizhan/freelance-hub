# Mobile-first UX

Основной девайс тестирования — iPhone 17 Pro. Всё проверяем на live-сайте, не local dev.

## Правила

- **Tap targets ≥44px** (Apple HIG минимум)
- **Safe-area insets** — `env(safe-area-inset-*)` для splash, [[BottomNav]], sticky header
- **`prefers-color-scheme`** — splash, [[Design System]] токены
- **Bottom sheets** — max 78dvh, drag handle обязателен (см. [[MessengerPage]] emoji picker)
- **Long-press → action sheet** — паттерн из Telegram

## Связанные

- [[Design System]]
- [[BottomNav]]
- [[MessengerPage]]
