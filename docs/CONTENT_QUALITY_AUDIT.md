# Content Quality Audit

Audit date: 2026-05-24

## Scope

- Static seed data in `src/lib/seed.ts`
- Supabase seed insert data in `supabase/seed.sql`
- Content fallbacks in `src/lib/content.ts`
- Tool filtering and sorting helpers in `src/lib/directory-filters.ts`
- JSON-LD helpers in `src/lib/seo/structured-data.ts`
- Sitemap coverage in `src/app/sitemap.ts`

## Checks Performed

- Duplicate tool and category slugs
- Missing names, slugs, summaries, taglines, subcategories, pricing notes, and best-for notes
- Invalid tool website URLs
- Tools mapped to missing categories
- Empty categories
- Pricing type normalization coverage
- Search/filter/compare fallback fields
- Metadata description length risk
- Sitemap inclusion for `/tools`
- JSON-LD safety for offers, ratings, reviews, and visible supported fields
- Compliance-like or unsupported superlative wording in static and SQL seed content

## Summary

- Categories checked: 8
- Tools checked: 43
- Errors: 0
- Warnings: 0
- Info findings: 8

The generated machine-readable report is available at `docs/content-quality-audit.json`.
The generated markdown output is available at `docs/content-quality-audit.generated.md`.

## Fixes Applied

- Replaced unsupported seed summary wording such as "Best for" / "Best fit" / "Best when" with safer "Good fit" phrasing in `src/lib/seed.ts`.
- Applied the same safer wording to `supabase/seed.sql` so Supabase seed content stays aligned with static fallback data.
- Replaced "Top matches by current Plebi ranking" with "Highest-ranked matches in this dataset" to avoid overstating current market consensus.
- Updated README wording so the Supabase seed instructions do not refer to an outdated fixed tool count.
- Added `pnpm audit:content` and `pnpm audit:content:write` scripts.

## Future Improvements

- Practical use cases and alternatives are still derived from existing tool/category context rather than stored as dedicated fields.
- Most profiles remain seed-only or needs-review by design until verified evidence intake expands.
- Pricing notes remain broad plan/context labels; users should still check current pricing on official sites.

## JSON-LD Safety

The audit confirms that current structured data avoids fake offers, aggregate ratings, reviews, prices, and compliance claims. Tool detail JSON-LD uses visible/supported fields only: name, description, URL, application category, and operating system.

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
- `/sitemap.xml`
- `/robots.txt`

## No-Fake-Claims Confirmation

No fake ratings, prices, reviews, benchmark claims, usage statistics, awards, or compliance claims were added. No schema, environment variable, external API, crawling, paid service, or binary asset changes were made.
