# Red unread badge

**Статус:** closed in [[Release 1.4.0]]

## Симптом

После входа в чат и выхода обратно на [[Feed]] красный кружок непрочитанных на иконке [[Messenger]] не сбрасывался. Казалось что ещё есть непрочитанные, хотя все прочитаны.

## Root cause

[[Supabase PostgrestBuilder]] — UPDATE-цепочка в [[MessengerPage]] и [[Notifications]] не имела терминатора (`await` / `.then()`). Query не отправлялся → `is_read` оставался `false` → realtime не триггерил `useUnreadMessages`.

## Fix

`.then(() => {})` в `MessengerPage.tsx:322, 343` и в 4 местах `notifications/page.tsx`.

## Уроки

- Lint-правило про «unused expression» пропускает thenable builders — легко словить снова
- Любой UPDATE в Supabase — явно терминируй
