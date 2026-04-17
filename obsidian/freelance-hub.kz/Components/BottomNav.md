# BottomNav

`components/layout/BottomNav.tsx` — нижняя навигация на app-страницах.

## Видимость

- Виден: [[Feed]], [[Orders]], [[Agents]], [[Messenger]] (в списке), [[Profile]], [[Notifications]], [[Settings]]
- Скрыт: auth flow, внутри открытого чата (см. [[Release 1.2.0]])

## Известный инцидент

[[BottomNav hooks crash]] — падал на переходе `/auth ↔ app`. Починено в [[Release 1.3.0]].

## Связи

- Правило: [[Rules of Hooks]]
- Использует: [[ProfileContext]] (current user pin)
