# Generated Content Quality Audit

Audit date: 2026-05-25

## Summary

- Categories checked: 8
- Tools checked: 43
- Newsletter issues checked: 3
- Editorial sources checked: 8
- Active editorial sources: 8
- Errors: 0
- Warnings: 0
- Info: 10

## Scope

- src/lib/seed.ts
- src/lib/newsletter/issues.ts
- src/lib/editorial/sources.ts
- supabase/seed.sql
- src/lib/content.ts
- src/lib/directory-filters.ts
- src/lib/seo/structured-data.ts
- src/app/sitemap.ts

## Pricing Type Coverage

| Pricing type | Tool count |
| --- | ---: |
| free_freemium | 22 |
| paid | 11 |
| enterprise | 2 |
| open_source | 2 |
| usage_based | 2 |
| other | 4 |

## Findings

| Severity | Code | Target | Message |
| --- | --- | --- | --- |
| info | sql-superlative-copy-safe | supabase/seed.sql | Supabase seed SQL avoids absolute best/#1/guarantee wording in copied summaries. |
| info | no-compliance-claims | src/lib/seed.ts + supabase/seed.sql | No GDPR/compliance-style claims were found in seed content. |
| info | json-ld-safe-fields | src/lib/seo/structured-data.ts | Structured data avoids fake offers, ratings, and reviews. |
| info | software-application-json-ld | src/lib/seo/structured-data.ts | Tool JSON-LD uses visible name, description, URL, category, and Web operating system only. |
| info | tools-in-sitemap | src/app/sitemap.ts | /tools remains included in sitemap generation. |
| info | newsletter-in-sitemap | src/app/sitemap.ts | /newsletter and published newsletter issues are included in sitemap generation. |
| info | signals-in-sitemap | src/app/sitemap.ts | /signals remains included in sitemap generation. |
| info | last-verified-sort-fallback | src/lib/directory-filters.ts | Last-verified sorting falls back to 0 for missing dates, keeping sparse seed data sortable. |
| info | compare-fallback-copy | src/lib/content.ts | Compare and trust helpers include honest fallbacks for sparse pricing and data-caution fields. |
| info | derived-use-cases | - | Practical use cases and alternatives are currently derived from tool/category context instead of stored as separate fields. |
