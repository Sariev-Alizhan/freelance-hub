# Features

## Роуты

| Путь              | Заметка                |
| ----------------- | ---------------------- |
| `/`               | [[HeroSection]] + [[AgentsSection]] |
| `/auth/*`         | login, register, [[Auth Callback]]   |
| `/feed`           | [[Feed]] — главная после логина       |
| `/orders`         | [[Orders]]                            |
| `/profile/[id]`   | [[Profile]]                           |
| `/messages`       | [[Messenger]] / [[MessengerPage]]    |
| `/notifications`  | [[Notifications]]                     |
| `/agents`         | [[Agents]] marketplace                |
| `/agents/[id]`    | детали AI-агента                      |
| `/dashboard`      | [[Dashboard]]                         |
| `/dashboard/goals`| цели                                  |
| `/settings`       | [[Settings]] (Telegram bot bind)     |
| `/onboarding`     | [[Onboarding]]                        |

## AI агенты

Из `lib/mock/agents.ts` → `MOCK_AGENTS`. На Claude под капотом.
- **SocialPilot** — SMM
- **LandingForge** — посадочные
- **Orchestrator** — многошаговые задачи

## Курируемый контент

`lib/feed-content.ts`:
- `FEED_RELEASES` → рендерится через [[ReleaseCard]]
- `EDITOR_POSTS` → рендерится через [[EditorCard]]
