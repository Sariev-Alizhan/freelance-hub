# Self-hosting FreelanceHub

FreelanceHub runs without Vercel as a stock Node.js app. The repo ships with a Dockerfile and a `docker-compose.yml` that boots:

- **app** — Next.js 16 in standalone mode (`node server.js`)
- **db** — Postgres 16 (applies `supabase/migrations/*.sql` on first boot)
- **minio** — S3-compatible object storage for media

## Quickstart

```bash
cp .env.example .env          # fill in secrets
docker compose up --build
open http://localhost:3000
```

## What's included

| Feature               | Works self-hosted | Notes |
| --------------------- | ----------------- | ----- |
| App (Next.js)         | ✅                | standalone bundle, no Vercel APIs |
| Postgres schema       | ✅                | same migrations as Supabase |
| Object storage        | ✅                | MinIO (S3 API) at `:9000` / console `:9001` |
| DID + VC issuance     | ✅                | phase 1 — works anywhere Node runs |
| ActivityPub inbox     | ✅ (fixed here)   | Vercel rewrites the `Date` request header, which breaks HTTP Signature verification. Self-host preserves client Date, so inbox Follow / Undo / Note all verify correctly |
| On-chain escrow       | ✅                | contract + viem read-path are infra-agnostic |
| Auth / realtime       | ⚠️                | still assumes Supabase Auth. Either run Supabase self-hosted alongside, or swap for next-auth in a follow-up |

## Why self-host

The single concrete win today is **inbox federation**. Vercel's edge normalizes the `Date` header on incoming POSTs to its own receive-time, so reconstructing the signing string never matches the client signature. Running behind any normal proxy (Caddy, nginx, Traefik) preserves the original header and Mastodon / Pleroma Follow attempts verify.

## Env reference

- `NEXT_PUBLIC_INSTANCE_HOST` — e.g. `freelance-hub.kz`
- `NEXT_PUBLIC_ESCROW_CHAIN` — `8453` mainnet / `84532` Sepolia
- `NEXT_PUBLIC_ESCROW_CONTRACT` — address after you deploy `contracts/FreelanceEscrow.sol`
- `ISSUER_ED25519_PRIVATE_KEY` / `ISSUER_ED25519_PUBLIC_KEY` — `npm run generate-issuer-key`
- `DATABASE_URL` — Postgres connection string (container default is fine)
- `S3_ENDPOINT` / `S3_BUCKET` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` — MinIO or any S3
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — point at your Supabase self-host (or hosted Supabase) for auth
