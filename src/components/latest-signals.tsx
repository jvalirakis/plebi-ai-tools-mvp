import { Activity, ArrowRight } from "lucide-react";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { TrackableExternalLink } from "@/components/analytics/trackable-external-link";
import type { EditorialItem } from "@/lib/types";

type LatestSignalsProps = {
  items: EditorialItem[];
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No date supplied";
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? "No date supplied" : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(parsedDate);
}

export function LatestSignals({ items }: LatestSignalsProps) {
  const latestItems = items.slice(0, 3);

  return (
    <section className="surface rounded-md p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-primary">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Latest AI signals</p>
              <h2 className="mt-1 text-xl font-semibold">Source-collected updates</h2>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Raw source-provided AI/tool updates from curated RSS feeds. No AI summaries are generated in this phase.
          </p>
        </div>
        <TrackableLink
          href="/signals"
          eventName="nav_link_clicked"
          eventPayload={{ cta_name: "home_view_ai_signals", route: "/signals", source_route: "/", destination_type: "internal" }}
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary"
        >
          Browse signals
          <ArrowRight className="h-4 w-4" />
        </TrackableLink>
      </div>

      {latestItems.length ? (
        <div className="grid gap-3 md:grid-cols-3">
          {latestItems.map((item) => (
            <TrackableExternalLink
              key={item.originalUrl}
              href={item.originalUrl}
              target="_blank"
              rel="noreferrer"
              eventName="signal_source_link_clicked"
              eventPayload={{ route: "/", source_route: "/", link_type: "source", destination_type: "external", cta_name: item.sourceName }}
              className="focus-ring rounded-md border border-border bg-background p-4 transition hover:border-primary"
            >
              <p className="text-xs text-muted-foreground">{item.sourceName}</p>
              <h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-6">{item.originalTitle}</h3>
              <p className="mt-3 font-mono text-xs text-muted-foreground">{formatDate(item.publishedAt)}</p>
            </TrackableExternalLink>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
          No RSS signals have been collected yet. Once the protected ingestion endpoint runs, recent source-attributed items will appear here.
        </div>
      )}
    </section>
  );
}
