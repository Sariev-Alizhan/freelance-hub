# AgentsSection

`components/landing/AgentsSection.tsx` — превью-блок AI-агентов на лендинге.

## Содержимое

- Badge «New · AI Agent Marketplace»
- 4 features (Zap, Clock, DollarSign, Bot)
- 3 preview cards первых доступных агентов из `MOCK_AGENTS`
- CTA → [[Agents]]

## Изменения

- [[Release 1.5.0]]: убраны fake-цены `$0 / $22000 / $35000`, заменены нейтральным «AI-ассистент / Доступен»

## Tech debt

- `as Record<string, typeof CONTENT.en>` каст — см. [[Backlog]]

## Связи

- Данные: `lib/mock/agents.ts` (`MOCK_AGENTS`)
- Соседний блок: [[HeroSection]]
