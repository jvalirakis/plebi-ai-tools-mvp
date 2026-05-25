# Production Release Checklist

Release date: 2026-05-25

This checklist prepares the Phase 9.x stack for production release. It is release documentation and validation only; it does not introduce new product features.

## Pre-Merge Checklist

- Review stacked PR order before merging.
- Confirm each PR has passed its documented validation.
- Confirm no schema, required env var, external API, paid service, or binary asset changes were introduced unless explicitly documented.
- Confirm no fake ratings, prices, reviews, benchmark claims, awards, popularity claims, or compliance claims were added.
- Confirm public routes do not return 404/500 unexpectedly.
- Confirm `pnpm audit:content:write` reports 0 errors and 0 warnings.
- Confirm `pnpm analytics:validate` passes.
- Confirm `pnpm build` passes.
- Confirm sitemap and robots files exclude admin/API/private routes.
- Confirm analytics debug logging is absent or false for production.

## Stacked PR Merge Order

Merge bottom-up in stack order:

1. PR #12 Phase 9.1
2. PR #13 Phase 9.2
3. PR #14 Phase 9.3
4. PR #15 Phase 9.4
5. PR #16 Phase 9.5
6. PR #17 Phase 9.6
7. PR #18 Phase 9.7
8. PR #19 Phase 9.8

Do not merge a top PR before its base PRs. After each merge, update or rebase the next PR if GitHub reports conflicts or generated files change. Rerun validation after any conflict resolution or regenerated report file changes.

## Local Validation Checklist

Run:

```bash
pnpm install
pnpm analytics:validate
pnpm audit:content:write
pnpm tsc --noEmit
pnpm lint
pnpm build
```

Or run the release wrapper:

```bash
pnpm release:check
```

## Local Smoke Test Checklist

Start the built app locally and verify:

- `/`
- `/tools`
- `/categories/image-generation`
- `/compare`
- `/tools/google-gemini-image`
- `/sitemap.xml`
- `/robots.txt`

Each route should return HTTP 200.

## Production / Vercel Checklist

- Confirm the Vercel project is linked to `jvalirakis/plebi-ai-tools-mvp`.
- Confirm the intended production branch is selected.
- Confirm the build command is `pnpm build` unless Vercel auto-detection overrides it correctly.
- Confirm the install command is default or intentionally configured.
- Confirm framework output is detected as Next.js.
- Set `NEXT_PUBLIC_SITE_URL` to the production domain if canonical URLs should not use the fallback Vercel URL.
- Keep `NEXT_PUBLIC_ANALYTICS_DEBUG` absent or `false` in production.
- Confirm no secret or service-role env vars are exposed with a `NEXT_PUBLIC_` prefix.
- Confirm deployment protection and preview deployment settings are understood.
- Test a preview deployment before promoting or merging to production.
- Test the production deployment after merge.

## Post-Deploy Smoke Checklist

- Homepage loads.
- `/tools` loads.
- `/categories/image-generation` loads.
- `/tools/google-gemini-image` loads.
- `/compare` loads.
- `/sitemap.xml` loads and contains public pages.
- `/robots.txt` loads and points to the sitemap.
- Canonical URLs use the production domain.
- Open Graph metadata exists in page source.
- JSON-LD exists and avoids fake offers, ratings, reviews, prices, and compliance claims.
- Breadcrumbs render and navigate.
- Official website external links open safely.
- Filters work on `/tools` and category pages.
- Sorting works on `/tools` and category pages.
- Compare page loads and tool selection works.
- Analytics debug is not logging in production.
- No console errors appear on major public pages.

## Share-Ready Checklist

Before sharing the public URL, confirm:

- Title and description are clean.
- Homepage hero is understandable.
- No placeholder copy appears in visible public areas.
- No obvious dead CTAs are present.
- No fake claims are present.
- No admin/private links are visible in the primary public journey.
- Mobile layout is acceptable.
- Top user journey 1 works: homepage -> tools -> tool detail.
- Top user journey 2 works: homepage -> category -> tool detail.
- Top user journey 3 works: tools -> compare.
