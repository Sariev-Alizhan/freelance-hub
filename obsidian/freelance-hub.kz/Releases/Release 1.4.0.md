# Release 1.4.0 — 2026-04-17 🔔

**Красный бейдж непрочитанных больше не висит.**

## Root cause

[[Supabase PostgrestBuilder]] — ленивый. `.update(...).eq(...)` без `.then()`/`await` не фаерился. Realtime event не летел → `useUnreadMessages` не сбрасывал бейдж.

## Исправлено в

- [[MessengerPage]] — при входе в чат + на каждое входящее сообщение
- [[Notifications]] — 4 места auto-mark-read

## Инцидент

[[Red unread badge]]

## Commit

`eec2257`
