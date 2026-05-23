"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryCard } from "@/components/category-card";
import { ToolCard } from "@/components/tool-card";
import { EmptyStateVisual } from "@/components/visual-identity";
import { getCategoryName, getToolSearchText, type RankedTool } from "@/lib/directory-filters";
import type { Category, Tool } from "@/lib/types";

type DirectoryCategory = Category & {
  toolCount: number;
  topTool?: Tool;
  topScore: number;
};

type DirectorySearchProps = {
  categories: DirectoryCategory[];
  rankedTools: RankedTool[];
};

function getCategorySearchText(category: DirectoryCategory) {
  return [
    category.name,
    category.slug,
    category.description,
    category.subcategories.join(" "),
    category.signal,
    category.benchmark,
    category.topTool?.name ?? ""
  ]
    .join(" ")
    .toLowerCase();
}

export function DirectorySearch({ categories, rankedTools }: DirectorySearchProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const matchingTools = useMemo(
    () =>
      normalizedQuery
        ? rankedTools.filter((tool) => getToolSearchText(tool, getCategoryName(tool, categories)).includes(normalizedQuery)).slice(0, 8)
        : [],
    [categories, normalizedQuery, rankedTools]
  );
  const matchingCategories = useMemo(() => {
    if (!normalizedQuery) {
      return categories;
    }

    const matchedCategorySlugs = new Set(matchingTools.map((tool) => tool.categorySlug));
    return categories.filter((category) => getCategorySearchText(category).includes(normalizedQuery) || matchedCategorySlugs.has(category.slug));
  }, [categories, matchingTools, normalizedQuery]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Directory</h2>
          <p className="mt-1 text-sm text-muted-foreground">Search across tools, categories, pricing, fit, freshness, and evidence status.</p>
        </div>
        <div className="w-full lg:max-w-xl">
          <label className="relative block">
            <span className="sr-only">Search directory</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools, use cases, pricing, evidence..."
              className="focus-ring h-12 w-full rounded-md border border-border bg-card pl-10 pr-11 text-sm"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="focus-ring absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Clear directory search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            {normalizedQuery ? `${matchingTools.length} tool matches and ${matchingCategories.length} category matches` : `${rankedTools.length} tools across ${categories.length} categories`}
          </p>
        </div>
      </div>

      {normalizedQuery && matchingTools.length ? (
        <div className="mb-6 grid gap-4">
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-base font-semibold">Matching tools</h3>
            <p className="text-xs text-muted-foreground">Top matches by current Plebi ranking</p>
          </div>
          {matchingTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} compact />
          ))}
        </div>
      ) : null}

      {matchingCategories.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {matchingCategories.map((category) => (
            <CategoryCard key={category.slug} {...category} />
          ))}
        </div>
      ) : (
        <div className="surface rounded-md p-8">
          <div className="flex gap-4">
            <EmptyStateVisual kind="search" />
            <div>
              <p className="text-sm font-medium">No tools match these filters</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Try clearing one or more filters.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
