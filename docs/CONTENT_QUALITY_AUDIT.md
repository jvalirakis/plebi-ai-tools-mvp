# Content Quality Audit

Audit date: 2026-05-25

## Scope

- Static seed data in `src/lib/seed.ts`
- Static newsletter issue data in `src/lib/newsletter/issues.ts`
- Static editorial RSS source data in `src/lib/editorial/sources.ts`
- Supabase seed insert data in `supabase/seed.sql`
- Content fallbacks in `src/lib/content.ts`
- Tool filtering and sorting helpers in `src/lib/directory-filters.ts`
- JSON-LD helpers in `src/lib/seo/structured-data.ts`
- Sitemap coverage in `src/app/sitemap.ts`

## Checks Performed

- Duplicate tool and category slugs
- Duplicate newsletter issue slugs
- Missing names, slugs, summaries, taglines, subcategories, pricing notes, and best-for notes
- Missing newsletter titles, summaries, issue dates, or invalid linked tool/category slugs
- Duplicate editorial source names/feed URLs and invalid editorial source URLs
- Invalid tool website URLs
- Tools mapped to missing categories
- Empty categories
- Pricing type normalization coverage
- Search/filter/compare fallback fields
- Metadata description length risk
- Sitemap inclusion for `/tools`
- Sitemap inclusion for `/newsletter` and published newsletter issues
- Sitemap inclusion for `/signals`
- JSON-LD safety for offers, ratings, reviews, and visible supported fields
- Compliance-like or unsupported superlative wording in static and SQL seed content

## Summary

- Categories checked: 8
- Tools checked: 43
- Newsletter issues checked: 3
- Editorial sources checked: 8
- Active editorial sources: 8
- Errors: 0
- Warnings: 0
- Info findings: 10

The generated machine-readable report is available at `docs/content-quality-audit.json`.
The generated markdown output is available at `docs/content-quality-audit.generated.md`.

## Fixes Applied

- Replaced unsupported seed summary wording such as "Best for" / "Best fit" / "Best when" with safer "Good fit" phrasing in `src/lib/seed.ts`.
- Applied the same safer wording to `supabase/seed.sql` so Supabase seed content stays aligned with static fallback data.
- Replaced "Top matches by current Plebi ranking" with "Highest-ranked matches in this dataset" to avoid overstating current market consensus.
- Updated README wording so the Supabase seed instructions do not refer to an outdated fixed tool count.
- Added `pnpm audit:content` and `pnpm audit:content:write` scripts.
- Extended the audit to cover static newsletter issue slugs, required issue metadata, linked tool/category slugs, and sitemap coverage.
- Extended the audit to cover static editorial RSS sources and `/signals` sitemap coverage.

## Future Improvements

- Practical use cases and alternatives are still derived from existing tool/category context rather than stored as dedicated fields.
- Most profiles remain seed-only or needs-review by design until verified evidence intake expands.
- Pricing notes remain broad plan/context labels; users should still check current pricing on official sites.

## JSON-LD Safety

The audit confirms that current structured data avoids fake offers, aggregate ratings, reviews, prices, and compliance claims. Tool detail JSON-LD uses visible/supported fields only: name, description, URL, application category, and operating system. Newsletter issue JSON-LD uses visible/supported fields only: headline, description, issue dates, URL, and main entity page.

## Validation

- `pnpm audit:content:write`: passed
- `pnpm tsc --noEmit`: passed
- `pnpm lint`: passed
- `pnpm build`: passed

HTTP smoke tests all returned `200` for:

- `/`
- `/tools`
- `/categories/image-generation`
- `/compare`
- `/tools/google-gemini-image`
- `/newsletter`
- `/newsletter/ai-tool-starter-stack`
- `/sitemap.xml`
- `/robots.txt`

## No-Fake-Claims Confirmation

No fake ratings, prices, reviews, benchmark claims, usage statistics, awards, or compliance claims were added. No schema, environment variable, external API, crawling, paid service, or binary asset changes were made.
