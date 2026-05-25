# Editorial RSS Ingestion

Phase 10.2 adds a no-AI ingestion foundation for AI/tool/source signals.

## Principle

- No AI APIs.
- No OpenAI calls.
- No generated summaries.
- No rewriting.
- No full article scraping.
- No arbitrary crawling.
- No paid services.

Plebi stores and displays only source-provided RSS fields: title, link, published date, source name, and RSS description/excerpt when available.

## Source Registry

Static source definitions live in `src/lib/editorial/sources.ts`. The Supabase migration seeds matching rows into `editorial_sources`.

Active feeds currently include verified RSS/Atom URLs for:

- OpenAI News
- Google AI Blog
- Google DeepMind Blog
- arXiv cs.AI
- The Verge AI
- TechCrunch AI
- MIT Technology Review AI
- VentureBeat AI

If a source does not have a verified RSS/Atom URL, do not add it as active. Add future candidates only after validating the feed URL.

## Database Tables

The migration `supabase/migrations/20260525_add_editorial_ingestion.sql` adds:

- `editorial_sources`
- `editorial_items`

Public reads are allowed for active sources and `candidate` / `selected` items. Inserts are handled by the server-side ingestion route with the Supabase service role key.

## Ingestion Endpoint

Protected endpoint:

```text
/api/cron/ingest-editorial-sources
```

Required request header:

```text
Authorization: Bearer $CRON_SECRET
```

Optional query parameters for local validation:

- `maxSources`
- `maxItems`
- `dryRun=1`

Example:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://your-domain.example/api/cron/ingest-editorial-sources?maxSources=1&maxItems=2&dryRun=1"
```

The endpoint returns:

```json
{
  "sourcesChecked": 1,
  "itemsSeen": 2,
  "itemsInserted": 0,
  "duplicatesSkipped": 0,
  "storageMode": "dry_run",
  "sourceErrors": []
}
```

## Deduplication

Items are deduplicated by:

- `original_url`
- fallback `content_hash` from source name, title, and link

The database also enforces `unique(original_url)`, so repeated daily runs do not create duplicate rows for the same source URL.

## Vercel Cron

`vercel.json` schedules the ingestion endpoint once daily:

```json
{
  "path": "/api/cron/ingest-editorial-sources",
  "schedule": "0 6 * * *"
}
```

This cadence is Hobby-safe. Do not increase the schedule without reviewing Vercel plan limits.

## Environment Variables

Required for production ingestion:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

Never prefix `SUPABASE_SERVICE_ROLE_KEY` or `CRON_SECRET` with `NEXT_PUBLIC`.

## Public Display

`/signals` shows source-attributed RSS items. It intentionally labels the page as no-AI/source-collected and does not present items as Plebi recommendations or editorial summaries.

## Validation

Run:

```bash
pnpm release:check
```

After starting the built app locally:

```bash
pnpm smoke:routes
```

Endpoint checks:

```bash
curl -i http://127.0.0.1:3001/api/cron/ingest-editorial-sources
curl -i -H "Authorization: Bearer wrong" http://127.0.0.1:3001/api/cron/ingest-editorial-sources
curl -i -H "Authorization: Bearer $CRON_SECRET" "http://127.0.0.1:3001/api/cron/ingest-editorial-sources?maxSources=1&maxItems=2&dryRun=1"
```

## Limitations

- No AI summarization or ranking of signals.
- No newsletter issue builder.
- No admin moderation UI for editorial items yet.
- No full article text ingestion.
- RSS descriptions vary by source quality and may be absent.
