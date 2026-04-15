# FreelanceHub — Pre-Deploy Checklist

**Target domain:** https://www.freelance-hub.kz  
**Stack:** Next.js 16, Supabase, Anthropic Claude, Vercel  
**Status:** RC1 — ready for production deploy after steps below

---

## STEP 1 — Supabase SQL Migrations

Open **Supabase Dashboard → SQL Editor** and run each file **in this exact order**.  
Copy-paste each file's contents and click Run.

| # | File | What it does |
|---|------|--------------|
| 1 | `supabase/schema.sql` | Base tables (users, profiles, orders) |
| 2 | `supabase/fix_rls.sql` | Row-level security fixes |
| 3 | `supabase/messages_schema.sql` | Chat/messenger tables |
| 4 | `supabase/notifications_schema.sql` | Push notification tables |
| 5 | `supabase/favorites_schema.sql` | Saved freelancers |
| 6 | `supabase/reviews_schema.sql` | Order reviews |
| 7 | `supabase/analytics_functions.sql` | Analytics RPC functions |
| 8 | `supabase/v1.4_migrations.sql` | v1.4 enhancements |
| 9 | `supabase/v1.5_migrations.sql` | v1.5 enhancements |
| 10 | `supabase/v2.0_agent_jobs.sql` | AI Agents system |
| 11 | `supabase/v3.0_creator_portal.sql` | Creator portal |
| 12 | `supabase/v4.0_ecosystem.sql` | Ecosystem features |
| 13 | `supabase/portfolio_storage.sql` | Portfolio storage bucket |
| 14 | `supabase/saved_searches.sql` | Saved search feature |
| 15 | `supabase/notifications.sql` | Notification preferences |
| 16 | `supabase/premium_waitlist.sql` | Premium waitlist |
| 17 | `supabase/avatars_storage.sql` | Avatar storage bucket |
| 18 | `supabase/push_subscriptions.sql` | Web push subscriptions |
| 19 | `supabase/security_fixes.sql` | Security patches |
| 20 | `supabase/chat_fixes.sql` | Messenger bug fixes |
| 21 | `supabase/fix_messages_rls.sql` | Messages RLS fix |
| 22 | `supabase/fix_messages_rls_v2.sql` | Messages RLS fix v2 |
| 23 | `supabase/fix_rpc_functions.sql` | RPC function patches |
| 24 | `supabase/payment_receipts_storage.sql` | Payment receipts bucket |
| 25 | `supabase/referrals.sql` | Referral system |
| 26 | `supabase/featured_boost.sql` | Featured listing boost |
| 27 | `supabase/milestone_tracker.sql` | Order milestone tracking |
| 28 | `supabase/telegram.sql` | Telegram integration |
| 29 | `supabase/vote_system.sql` | Feature voting |
| 30 | `supabase/order_reviews.sql` | Order review system |
| 31 | `supabase/escrow.sql` | Escrow payment tables |
| 32 | `supabase/v5_security.sql` | Security events + abuse strikes |
| 33 | `supabase/v6_profile_pro.sql` | Pro profile fields, work experience, documents |

> If any migration fails with "already exists", it's safe to skip — the table/column is already there.

---

## STEP 2 — Supabase Storage Buckets

Go to **Supabase Dashboard → Storage → New Bucket** and create:

| Bucket name | Public? | Notes |
|-------------|---------|-------|
| `resumes` | No (private) | PDF resumes, max 10 MB |
| `portfolio` | Yes (public) | Portfolio images/files |
| `avatars` | Yes (public) | Profile photos |
| `payment-receipts` | No (private) | Kaspi/card payment screenshots |

For **resumes** bucket, set allowed MIME types:  
`application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, image/png`

---

## STEP 3 — Vercel Environment Variables

Go to **Vercel Dashboard → Project → Settings → Environment Variables**  
Add all variables below for **Production** environment.

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL        = (your project URL from supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_ANON_KEY   = (anon key from Settings → API)
SUPABASE_SERVICE_ROLE_KEY       = (service_role key — keep secret, never NEXT_PUBLIC_)
```

### Anthropic
```
ANTHROPIC_API_KEY               = (from console.anthropic.com → API Keys)
```

### Site
```
NEXT_PUBLIC_SITE_URL            = https://www.freelance-hub.kz
ADMIN_EMAIL                     = raimzhan1907@gmail.com
NEXT_PUBLIC_ADMIN_EMAIL         = raimzhan1907@gmail.com
```

### Telegram Bot
```
TELEGRAM_BOT_TOKEN              = (from @BotFather)
TELEGRAM_ADMIN_CHAT_ID          = (your chat ID — send /start to bot, then check getUpdates)
```

### Web Push (VAPID)
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY    = (already in .env.local — copy from there)
VAPID_PRIVATE_KEY               = (already in .env.local — copy from there)
VAPID_EMAIL                     = admin@freelance-hub.kz
PUSH_INTERNAL_SECRET            = (already in .env.local — copy from there)
```

### Card Payments
```
NEXT_PUBLIC_PAYMENT_CARD_NUMBER = 4400 4303 1167 6685
NEXT_PUBLIC_PAYMENT_CARD_HOLDER = Алижан С.
```

### LemonSqueezy (if using subscription billing)
```
LS_API_KEY                      = (from app.lemonsqueezy.com → Settings → API)
LS_STORE_ID                     = (from Settings → Stores)
LS_WEBHOOK_SECRET               = (from Settings → Webhooks → Signing Secret)
LS_VARIANT_MONTHLY              = (Variant ID from product page)
LS_VARIANT_QUARTERLY            = (Variant ID)
LS_VARIANT_ANNUAL               = (Variant ID)
ADMIN_WEBHOOK_SECRET            = (any random 64-char hex string)
```

> You can generate a random secret with: `openssl rand -hex 32`

---

## STEP 4 — Register Telegram Webhook

After deploy is live at `https://www.freelance-hub.kz`, run this once:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://www.freelance-hub.kz/api/telegram/webhook"
```

Replace `<YOUR_BOT_TOKEN>` with your actual token.  
Verify it worked:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```
Should show `"url": "https://www.freelance-hub.kz/api/telegram/webhook"`.

---

## STEP 5 — Deploy to Vercel

### Option A — Via GitHub (recommended)
1. Push this repo to GitHub (if not already there)
2. Import project in Vercel Dashboard → "New Project" → select repo
3. Framework: **Next.js** (auto-detected)
4. Root directory: `.` (default)
5. Click **Deploy**

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## STEP 6 — Post-Deploy Verification

Check these URLs are working after deploy:

| URL | Expected |
|-----|----------|
| `https://www.freelance-hub.kz` | Homepage loads |
| `https://www.freelance-hub.kz/modules` | AI Modules page |
| `https://www.freelance-hub.kz/rp-dev` | RP Game Dev page |
| `https://www.freelance-hub.kz/freelancers` | Freelancers list |
| `https://www.freelance-hub.kz/orders` | Orders list |
| `https://www.freelance-hub.kz/agents` | AI Agents page |
| `https://www.freelance-hub.kz/premium` | Premium page |
| `https://www.freelance-hub.kz/admin` | Admin panel (login with `raimzhan1907@gmail.com`) |
| `https://www.freelance-hub.kz/api/health` | Should return 200 (if this route exists) |
| `https://www.freelance-hub.kz/sitemap.xml` | Shows all pages |

---

## STEP 7 — Apply for Startup Programs (Free Credits)

These cost nothing and can save you thousands monthly:

### Priority 1 — Apply This Week
1. **Vercel Startup Program**  
   URL: https://vercel.com/contact/startup  
   What you get: $1,000–$3,000 in credits  
   Mention: AI-powered freelance marketplace for CIS market, 5,000+ users

2. **Supabase Startup Program**  
   URL: https://supabase.com/blog/supabase-oss-startup-program  
   What you get: $300/mo credits for 1 year  
   Mention: database-heavy marketplace with real-time chat

3. **Anthropic API Credits (for Startups)**  
   URL: https://www.anthropic.com/startups  
   What you get: Free API credits  
   Mention: built on Claude for AI job matching, contract generation, agent orchestration

### Priority 2 — Apply This Month
4. **QazTech Ventures** (perfect fit for CIS market)  
   URL: https://qaztech.vc  
   What you get: potential investment, no equity required at early stage  
   Mention: freelance marketplace for Kazakhstan/CIS with AI, 5,000+ users, $20K MRR target

5. **Google for Startups** (Cloud credits)  
   URL: https://cloud.google.com/startup  
   What you get: $3,000–$100K in GCP credits

6. **Microsoft for Startups**  
   URL: https://startups.microsoft.com  
   What you get: $5,000 in Azure credits + GitHub Copilot

---

## STEP 8 — Free PR & Media Exposure

Post about the launch here (all free):

| Platform | What to post | When |
|----------|-------------|------|
| **Product Hunt** | Full launch post with screenshots | Launch day |
| **Hacker News** (Show HN) | "Show HN: AI freelance marketplace for CIS market" | Launch day |
| **Reddit r/freelance** | Story post about solving CIS freelancer problems | +1 day |
| **Reddit r/Kazakhstan** | Local community announcement | +1 day |
| **VC.ru** | Article about the product in Russian | +2 days |
| **Habr.com** | Technical article about the AI stack | +3 days |
| **Startups.kz** | Submit to Kazakhstan startup directory | +1 week |
| **Telegram channels** | Post in KZ/RU freelance/startup TG channels | Ongoing |

---

## Summary — What I Did vs What You Do

### Already done in code (no action needed from you):
- All security hardening (rate limiting, XSS/SQL injection protection, CSP headers)
- AI Modules page (`/modules`)
- RP Game Dev landing (`/rp-dev`)
- Board Room admin meetings
- War Room (funding, PR, ideas)
- AI Strategy meeting
- Profile Pro (resume, portfolio links, work experience)
- Sitemap updated with all new pages
- Footer updated with new links

### You must do manually:
1. Run SQL migrations (Step 1)
2. Create Storage buckets (Step 2)  
3. Add environment variables to Vercel (Step 3)
4. Register Telegram webhook (Step 4)
5. Deploy (Step 5)
6. Verify everything works (Step 6)
7. Apply for startup programs (Step 7)
8. Start PR/media push (Step 8)
