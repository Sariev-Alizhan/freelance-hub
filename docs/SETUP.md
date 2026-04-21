# FreelanceHub — Developer Setup

Welcome. This guide gets you from zero to running the app locally.

## Prerequisites

- **Node.js 20+** (LTS). Check: `node -v`
- **npm 10+** (ships with Node)
- **Git**
- A code editor (VS Code recommended)

Optional but useful:
- **Vercel CLI** — `npm i -g vercel` (for deploys, env pulls, logs)
- **Supabase CLI** — already a devDep, accessible via `npx supabase`

## 1. Clone

```bash
git clone https://github.com/Sariev-Alizhan/freelance-hub.git
cd freelance-hub
npm install
```

## 2. Environment variables

Copy the template:

```bash
cp .env.example .env.local
```

Then fill in the values. Ask Alizhan for these — they are **not** in the repo:

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (server only) |
| `ANTHROPIC_API_KEY` | For AI features (resume, order helpers) |
| `CRON_SECRET` | Any long random string — gates cron routes |
| `TELEGRAM_WEBHOOK_SECRET` | Only needed if touching the Telegram bot |

The DID / escrow keys (`ISSUER_ED25519_*`, `NEXT_PUBLIC_ESCROW_*`) are **only needed if you work on the Web3 flows**. Skip for pure design/UI work.

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

Hot reload is on — save a file, the page updates.

## 4. Tech stack quick reference

- **Next.js 16.2.3** — App Router. **Read `AGENTS.md`**: this version has breaking changes vs. what LLMs and older tutorials assume.
- **React 19.2.4** — new hooks rules (`react-hooks/set-state-in-effect`)
- **Tailwind CSS v4** — config via `@tailwindcss/postcss`
- **shadcn/ui** — components under `components/ui/`
- **Base UI** (`@base-ui/react`) — for primitives shadcn doesn't cover
- **Framer Motion** — animations
- **Supabase** — auth + Postgres + RLS
- **Vercel** — hosting, deploy on push to `main`

## 5. Project structure

```
app/                       Next.js App Router
  (app)/                     main app routes (logged-in)
  (auth)/                    login / register
  api/                       route handlers
components/
  ui/                        shadcn primitives
  layout/                    header, footer, nav
  orders/                    order-related UI
  profile/                   profile-related UI
  ...
lib/
  context/                   React contexts (theme, language, role)
  i18n/
    dict.ts                    translation dictionary (ru / kz / en)
    server.ts                  getServerT() for server components
  hooks/                     reusable hooks
  supabase/                  client/server helpers
public/                    static assets
styles/                    globals
```

## 6. Workflow

**Never push directly to `main`** — it auto-deploys to production.

1. Create a branch:
   ```bash
   git checkout -b design/new-header
   ```
2. Make changes, commit:
   ```bash
   git add <files>
   git commit -m "design: redesign header"
   ```
3. Push and open a PR:
   ```bash
   git push -u origin design/new-header
   ```
4. Vercel auto-builds a **preview URL** for each PR — share it with Alizhan for review.
5. After review + merge, `main` deploys to production.

## 7. i18n (translations)

All UI strings live in `lib/i18n/dict.ts` under three langs: `ru`, `kz`, `en`.

- In client components: `const { t } = useLang(); <p>{t.someKey}</p>`
- In server components: `const t = await getServerT(); <h1>{t.someKey}</h1>`
- To add a string: add the same key to **all three** language blocks in `dict.ts`.

## 8. Theming

- Dark/light mode via `lib/context/ThemeContext.tsx`
- Uses CSS variables (design tokens) — edit `app/globals.css` for color changes
- Anti-FOUC script in `app/layout.tsx` reads `fh-theme-mode` from localStorage before React hydrates

## 9. Common commands

```bash
npm run dev           # dev server
npm run build         # production build
npm run lint          # eslint
npx tsc --noEmit      # type check
```

## 10. Deploy

Deployment is automatic:
- Push to `main` → prod (`freelance-hub.kz`)
- Open a PR → preview URL on vercel.app

Manual deploy (if needed, after `npm i -g vercel`):
```bash
vercel                # preview
vercel --prod         # production
```

## 11. Asking for help

- Ping Alizhan in Telegram / WhatsApp
- Production logs: `npx vercel logs` (requires Vercel CLI + team access)
- Supabase dashboard for DB / auth debugging
