import { ArrowRight, GitCompareArrows, Newspaper } from "lucide-react";
import { AnalyticsPageEvent } from "@/components/analytics/analytics-page-event";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { NewsletterIssueList } from "@/components/newsletter/newsletter-issue-list";
import { NewsletterSignupPlaceholder } from "@/components/newsletter/newsletter-signup-placeholder";
import { getPublishedNewsletterIssues } from "@/lib/newsletter/issues";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbListJsonLd, createItemListJsonLd } from "@/lib/seo/structured-data";

export const metadata = createPageMetadata({
  title: "Plebi AI Brief",
  description: "Curated AI tools intelligence, practical recommendations, and category signals.",
  path: "/newsletter"
});

export const dynamic = "force-static";

export default function NewsletterPage() {
  const issues = getPublishedNewsletterIssues();

  return (
    <div className="space-y-8">
      <JsonLd
        data={[
          createBreadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Plebi AI Brief", path: "/newsletter" }
          ]),
          createItemListJsonLd({
            name: "Plebi AI Brief archive",
            path: "/newsletter",
            description: "Curated AI tools intelligence, practical recommendations, and category signals.",
            items: issues.map((issue) => ({
              name: issue.title,
              path: `/newsletter/${issue.slug}`,
              description: issue.summary
            }))
          })
        ]}
      />
      <AnalyticsPageEvent eventName="newsletter_archive_opened" payload={{ route: "/newsletter", result_count: issues.length }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Plebi AI Brief" }]} />

      <section className="surface rounded-md p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="text-sm font-medium text-primary">Editorial intelligence</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Plebi AI Brief</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Curated AI tools intelligence, practical recommendations, and category signals for professionals comparing what to try, what to
              watch, and what to treat with caution.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackableLink
                href="/tools"
                eventName="nav_link_clicked"
                eventPayload={{ cta_name: "newsletter_browse_tools", route: "/tools", source_route: "/newsletter", destination_type: "internal" }}
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Browse tools
                <ArrowRight className="h-4 w-4" />
              </TrackableLink>
              <TrackableLink
                href="/compare"
                eventName="compare_cta_clicked"
                eventPayload={{ cta_name: "newsletter_compare_tools", route: "/compare", source_route: "/newsletter", destination_type: "internal" }}
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare tools
              </TrackableLink>
              <TrackableLink
                href="/signals"
                eventName="nav_link_clicked"
                eventPayload={{ cta_name: "newsletter_browse_signals", route: "/signals", source_route: "/newsletter", destination_type: "internal" }}
                className="focus-ring inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
              >
                Browse latest AI signals
              </TrackableLink>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-primary">
                <Newspaper className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Archive-first foundation</p>
                <p className="text-xs text-muted-foreground">No email sending in this phase</p>
              </div>
            </div>
            <NewsletterSignupPlaceholder sourceRoute="/newsletter" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Published issues</p>
            <h2 className="mt-2 text-2xl font-semibold">AI intelligence archive</h2>
          </div>
          <p className="font-mono text-sm text-muted-foreground tabular-nums">{issues.length} issues</p>
        </div>
        <NewsletterIssueList issues={issues} sourceRoute="/newsletter" />
      </section>
    </div>
  );
}
