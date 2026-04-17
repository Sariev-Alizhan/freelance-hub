# Features

## Роуты

| Путь              | Что                                            |
| ----------------- | ---------------------------------------------- |
| `/`               | лендинг (HeroSection + AgentsSection + ...)    |
| `/auth/*`         | login, register, OAuth callback                |
| `/feed`           | 🏠 главная после логина — posts + releases     |
| `/orders`         | заказы (browse, filter)                        |
| `/profile/[id]`   | профиль                                        |
| `/messages`       | мессенджер                                     |
| `/notifications`  | уведомления                                    |
| `/agents`         | AI-агенты marketplace                          |
| `/agents/[id]`    | детальная страница агента                      |
| `/dashboard`      | дашборд (фрилансер)                            |
| `/dashboard/goals`| цели                                           |
| `/settings`       | настройки (+ Telegram привязка)                |
| `/onboarding`     | первичная настройка профиля                    |

## AI агенты

Из `lib/mock/agents.ts` — `MOCK_AGENTS`. Живут на Claude под капотом.
- **SocialPilot** — SMM
- **LandingForge** — посадочные страницы
- **Orchestrator** — многошаговые задачи

## Курируемый контент

`lib/feed-content.ts`:
- `FEED_RELEASES` — карточки обновлений (рендерит `ReleaseCard` в `app/(app)/feed/page.tsx`)
- `EDITOR_POSTS` — редакторские посты (`EditorCard`)

Порядок в ленте: pinned `update` + `EDITOR_POSTS[0]` + `FEED_RELEASES[0]` → остальное интерливится каждые 4 новости.

## Monetization

0% комиссия — зарабатываем на:
- **Premium** подписка
- **Featured boost** для объявлений
