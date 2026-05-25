# Plebi AI Tools MVP

Plebi is an AI tools intelligence and ranking platform with transparent scores, source observations, user polls, comparison workflows, and an admin surface.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready database and auth clients
- Vercel-ready deployment

## Local Development

```bash
pnpm install
pnpm dev
```

Create `.env.local` from `.env.example` when connecting Supabase.

## Supabase

The UI reads from Supabase when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured and table rows exist. Empty states safely fall back to deterministic data in `src/lib/seed.ts`.

Apply `supabase/schema.sql`, then run `supabase/seed.sql` to load the MVP dataset: the current curated tool set, 8 categories, sources, observations, score snapshots, and polls. Poll votes insert into `poll_votes`; enable Supabase anonymous sign-ins if public voting should work without a separate sign-in flow.

## Content Quality Audit

Run the seed/content audit before future data edits:

```bash
pnpm audit:content
```

Use `pnpm audit:content:write` to refresh `docs/content-quality-audit.json` and `docs/content-quality-audit.generated.md`.

Severity meanings:

- `error`: publish-blocking data integrity issue, such as duplicate slugs or invalid core URLs.
- `warning`: non-blocking content gap that should be reviewed before treating rankings as source-verified.
- `info`: documented fallback, safety check, or intentional derived-content behavior.

## Analytics Instrumentation

Plebi includes a small privacy-first analytics wrapper for product interaction events. It is provider-agnostic and no-op by default: no cookies, no fingerprinting, no user IDs, and no personal data are collected.

Optional local debug logging:

```bash
NEXT_PUBLIC_ANALYTICS_DEBUG=true pnpm dev
```

When enabled, sanitized events are logged in the browser console. Run `pnpm analytics:validate` to verify event-name and payload sanitization rules. See `docs/ANALYTICS_EVENTS.md` for the event catalog, allowed payload fields, forbidden fields, and future adapter guidance.
