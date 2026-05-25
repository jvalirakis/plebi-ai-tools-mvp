"use client";

import { ExternalLink, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { TrackableExternalLink } from "@/components/analytics/trackable-external-link";
import { trackEvent } from "@/lib/analytics/track";
import type { EditorialItem, EditorialSource } from "@/lib/types";

type SignalsBrowserProps = {
  items: EditorialItem[];
  sources: EditorialSource[];
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No date supplied";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "No date supplied";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(parsedDate);
}

function searchText(item: EditorialItem) {
  return [item.originalTitle, item.sourceName, item.category ?? "", item.region ?? "", item.originalExcerpt ?? ""].join(" ").toLowerCase();
}

export function SignalsBrowser({ items, sources }: SignalsBrowserProps) {
  const [query, setQuery] = useState("");
  const [sourceName, setSourceName] = useState("all");
  const [category, setCategory] = useState("all");
  const normalizedQuery = query.trim().toLowerCase();
  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category).filter((value): value is string => Boolean(value)))).sort(), [items]);
  const sourceNames = useMemo(
    () => Array.from(new Set([...sources.map((source) => source.name), ...items.map((item) => item.sourceName)])).filter(Boolean).sort(),
    [items, sources]
  );
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesQuery = normalizedQuery ? searchText(item).includes(normalizedQuery) : true;
        const matchesSource = sourceName === "all" ? true : item.sourceName === sourceName;
        const matchesCategory = category === "all" ? true : item.category === category;
        return matchesQuery && matchesSource && matchesCategory;
      }),
    [category, items, normalizedQuery, sourceName]
  );

  function submitSearch() {
    trackEvent("signal_search_submitted", {
      route: "/signals",
      filter_name: "signals_search",
      filter_value: normalizedQuery ? "query_present" : "empty",
      result_count: filteredItems.length
    });
  }

  function updateSource(value: string) {
    setSourceName(value);
    trackEvent("signal_filter_changed", {
      route: "/signals",
      filter_name: "source",
      filter_value: value,
      result_count: filteredItems.length
    });
  }

  function updateCategory(value: string) {
    setCategory(value);
    trackEvent("signal_filter_changed", {
      route: "/signals",
      filter_name: "category",
      filter_value: value,
      result_count: filteredItems.length
    });
  }

  return (
    <section className="space-y-5">
      <div className="surface rounded-md p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Search AI signals</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onBlur={submitSearch}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitSearch();
                }
              }}
              placeholder="Search titles, sources, categories..."
              className="focus-ring h-11 w-full rounded-md border border-border bg-card pl-10 pr-10 text-sm"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  trackEvent("signal_filter_changed", {
                    route: "/signals",
                    filter_name: "clear_search",
                    filter_value: "signals",
                    result_count: items.length
                  });
                }}
                className="focus-ring absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Clear signals search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>

          <label className="block">
            <span className="sr-only">Filter by source</span>
            <select
              value={sourceName}
              onChange={(event) => updateSource(event.target.value)}
              className="focus-ring h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
            >
              <option value="all">All sources</option>
              {sourceNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(event) => updateCategory(event.target.value)}
              className="focus-ring h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((itemCategory) => (
                <option key={itemCategory} value={itemCategory}>
                  {itemCategory}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSourceName("all");
              setCategory("all");
              trackEvent("signal_filter_changed", {
                route: "/signals",
                filter_name: "clear_filters",
                filter_value: "signals",
                result_count: items.length
              });
            }}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary"
          >
            Clear filters
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {filteredItems.length} of {items.length} source-collected signals shown
        </p>
      </div>

      {filteredItems.length ? (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <article key={item.originalUrl} className="surface rounded-md p-5">
              <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="chip rounded-md px-2 py-1">{item.sourceName}</span>
                {item.category ? <span className="chip rounded-md px-2 py-1">{item.category}</span> : null}
                {item.region ? <span className="chip rounded-md px-2 py-1">{item.region}</span> : null}
                <span className="chip rounded-md px-2 py-1">{formatDate(item.publishedAt)}</span>
              </div>
              <h2 className="text-xl font-semibold">{item.originalTitle}</h2>
              {item.originalExcerpt ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.originalExcerpt}</p> : null}
              <div className="mt-4">
                <TrackableExternalLink
                  href={item.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  eventName="signal_source_link_clicked"
                  eventPayload={{
                    route: "/signals",
                    link_type: "source",
                    destination_type: "external",
                    cta_name: item.sourceName,
                    filter_value: item.category ?? "uncategorized"
                  }}
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-primary transition hover:border-primary"
                >
                  Read source
                  <ExternalLink className="h-4 w-4" />
                </TrackableExternalLink>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface rounded-md p-8 text-sm leading-6 text-muted-foreground">
          No AI signals match these filters yet. Try clearing filters, or run the protected RSS ingestion endpoint after configuring Supabase and
          `CRON_SECRET`.
        </div>
      )}
    </section>
  );
}
