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

The UI runs from deterministic seed data in `src/lib/seed.ts`. The production-ready schema lives in `supabase/schema.sql` and matches the MVP entities: categories, tools, sources, observations, score snapshots, polls, votes, and admin profiles.
