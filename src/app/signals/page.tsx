import { Activity, GitCompareArrows, Newspaper } from "lucide-react";
import { AnalyticsPageEvent } from "@/components/analytics/analytics-page-event";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SignalsBrowser } from "@/components/signals-browser";
import { listActiveEditorialSources, listPublicEditorialItems } from "@/lib/editorial/repository";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "AI Signals",
  description: "Latest source-attributed AI tool and industry updates collected from curated feeds. No AI summaries are generated.",
  path: "/signals"
});

export default async function SignalsPage() {
  const [items, sources] = await Promise.all([listPublicEditorialItems(48), listActiveEditorialSources()]);

  return (
    <div className="space-y-8">
      <AnalyticsPageEvent eventName="signals_page_opened" payload={{ route: "/signals", result_count: items.length }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Signals" }]} />

      <section className="surface rounded-md p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="text-sm font-medium text-primary">No-AI source monitoring</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">AI Signals</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Source-provided AI/tool updates collected from curated RSS feeds. No AI summaries are generated in this phase, and Plebi does not
              fetch full article bodies.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackableLink
                href="/newsletter"
                eventName="nav_link_clicked"
                eventPayload={{ cta_name: "signals_browse_brief", route: "/newsletter", source_route: "/signals", destination_type: "internal" }}
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Newspaper className="h-4 w-4" />
                Read AI Brief
              </TrackableLink>
              <TrackableLink
                href="/compare"
                eventName="compare_cta_clicked"
                eventPayload={{ cta_name: "signals_compare_tools", route: "/compare", source_route: "/signals", destination_type: "internal" }}
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare tools
              </TrackableLink>
            </div>
          </div>
          <aside className="rounded-md border border-border bg-background p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-primary">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Source attribution first</p>
                <p className="text-xs text-muted-foreground">RSS titles, links, dates, and source excerpts only</p>
              </div>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Tracked sources</p>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{sources.length}</p>
              </div>
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Visible items</p>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{items.length}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SignalsBrowser items={items} sources={sources} />
    </div>
  );
}
