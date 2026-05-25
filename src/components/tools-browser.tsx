"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyStateVisual } from "@/components/visual-identity";
import { ToolCard } from "@/components/tool-card";
import {
  getAvailablePricingTypes,
  getCategoryName,
  getLastVerifiedValue,
  getPricingType,
  matchesToolSearch,
  pricingTypeLabels,
  sortRankedTools,
  type PricingType,
  type RankedTool,
  type ToolSort
} from "@/lib/directory-filters";
import type { Category } from "@/lib/types";

type ToolsBrowserProps = {
  categories: Category[];
  rankedTools: RankedTool[];
};

type StatusFilter<T extends string> = T | "all";
type ToolsSort = ToolSort | "category";

const sortOptions: Array<{ value: ToolsSort; label: string }> = [
  { value: "score_desc", label: "Plebi Score high to low" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "category", label: "Category" },
  { value: "last_verified", label: "Last verified" },
  { value: "evidence_quality", label: "Evidence quality" },
  { value: "best_value", label: "Best value" }
];

function fieldClass() {
  return "focus-ring h-10 w-full rounded-md border border-border bg-background px-3 text-sm";
}

function sortTools(tools: RankedTool[], sort: ToolsSort, categories: Category[]) {
  if (sort === "category") {
    return tools
      .slice()
      .sort((a, b) => getCategoryName(a, categories).localeCompare(getCategoryName(b, categories)) || a.name.localeCompare(b.name));
  }

  if (sort === "last_verified") {
    return tools
      .slice()
      .sort((a, b) => getLastVerifiedValue(b) - getLastVerifiedValue(a) || b.score - a.score || a.name.localeCompare(b.name));
  }

  return sortRankedTools(tools, sort);
}

export function ToolsBrowser({ categories, rankedTools }: ToolsBrowserProps) {
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState("all");
  const [pricingType, setPricingType] = useState<StatusFilter<PricingType>>("all");
  const [sort, setSort] = useState<ToolsSort>("score_desc");
  const pricingTypes = useMemo(() => getAvailablePricingTypes(rankedTools), [rankedTools]);
  const filteredTools = useMemo(
    () =>
      sortTools(
        rankedTools.filter((tool) => {
          const categoryName = getCategoryName(tool, categories);
          const matchesSearch = matchesToolSearch(tool, query, categoryName);
          const matchesCategory = categorySlug === "all" || tool.categorySlug === categorySlug;
          const matchesPricing = pricingType === "all" || getPricingType(tool.pricing) === pricingType;

          return matchesSearch && matchesCategory && matchesPricing;
        }),
        sort,
        categories
      ),
    [categories, categorySlug, pricingType, query, rankedTools, sort]
  );
  const hasActiveFilters = Boolean(query.trim() || categorySlug !== "all" || pricingType !== "all" || sort !== "score_desc");

  function clearFilters() {
    setQuery("");
    setCategorySlug("all");
    setPricingType("all");
    setSort("score_desc");
  }

  if (!rankedTools.length) {
    return (
      <section className="surface flex gap-4 rounded-md p-8">
        <EmptyStateVisual kind="search" />
        <div>
          <p className="text-sm font-medium">No tools available yet</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Add tool records and source observations before the public tools directory can show curated options.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="tools-directory-heading">
      <div className="surface rounded-md p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 id="tools-directory-heading" className="text-lg font-semibold">
              All curated tools
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono tabular-nums">{filteredTools.length}</span> of {rankedTools.length} tools shown
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_220px_220px]">
          <label className="relative block">
            <span className="sr-only">Search AI tools</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tool name, use case, pricing, fit..."
              className="focus-ring h-10 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Category
            <select value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)} className={fieldClass()}>
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Pricing
            <select value={pricingType} onChange={(event) => setPricingType(event.target.value as StatusFilter<PricingType>)} className={fieldClass()}>
              <option value="all">All pricing</option>
              {pricingTypes.map((type) => (
                <option key={type} value={type}>
                  {pricingTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Sort
            <select value={sort} onChange={(event) => setSort(event.target.value as ToolsSort)} className={fieldClass()}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filteredTools.length ? (
        <div className="grid gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="surface flex gap-4 rounded-md p-8">
          <EmptyStateVisual kind="search" />
          <div>
            <p className="text-sm font-medium">No tools match these filters</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Try clearing one or more filters, or browse by category instead.</p>
            <button type="button" onClick={clearFilters} className="focus-ring mt-4 inline-flex h-10 items-center rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary">
              Clear filters
            </button>
          </div>
        </div>
      )}

      <div className="surface rounded-md p-5">
        <p className="text-sm font-medium">Want to compare options?</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Open the compare page to inspect fit, pricing context, evidence status, freshness, and score tradeoffs side by side.
        </p>
        <Link href="/compare" className="mt-4 inline-flex text-sm font-medium text-primary">
          Open compare page
        </Link>
      </div>
    </section>
  );
}
