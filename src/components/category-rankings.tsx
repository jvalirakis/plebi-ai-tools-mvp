"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ToolCard } from "@/components/tool-card";
import {
  evidenceFilterOptions,
  freshnessFilterOptions,
  getAvailablePricingTypes,
  getAvailableSubcategories,
  getPricingType,
  matchesScoreRange,
  matchesToolSearch,
  pricingTypeLabels,
  scoreRangeOptions,
  sortOptions,
  sortRankedTools,
  type PricingType,
  type RankedTool,
  type ScoreRange,
  type ToolSort
} from "@/lib/directory-filters";
import { evidenceLabels, freshnessLabels, rankingDisclaimer, statusClass } from "@/lib/status";
import type { EvidenceStatus, FreshnessStatus } from "@/lib/types";

type CategoryRankingsProps = {
  rankedTools: RankedTool[];
  categoryName: string;
};

type StatusFilter<T extends string> = T | "all";

function selectClass() {
  return "focus-ring h-10 w-full rounded-md border border-border bg-background px-3 text-sm";
}

export function CategoryRankings({ rankedTools, categoryName }: CategoryRankingsProps) {
  const [query, setQuery] = useState("");
  const [freshness, setFreshness] = useState<StatusFilter<FreshnessStatus>>("all");
  const [evidence, setEvidence] = useState<StatusFilter<EvidenceStatus>>("all");
  const [pricingType, setPricingType] = useState<StatusFilter<PricingType>>("all");
  const [scoreRange, setScoreRange] = useState<ScoreRange>("all");
  const [subcategory, setSubcategory] = useState("all");
  const [sort, setSort] = useState<ToolSort>("score_desc");
  const originalRankBySlug = useMemo(() => new Map(rankedTools.map((tool, index) => [tool.slug, index + 1])), [rankedTools]);
  const pricingTypes = useMemo(() => getAvailablePricingTypes(rankedTools), [rankedTools]);
  const subcategories = useMemo(() => getAvailableSubcategories(rankedTools), [rankedTools]);
  const filteredTools = useMemo(
    () =>
      sortRankedTools(
        rankedTools.filter((tool) => {
          const matchesSearch = matchesToolSearch(tool, query, categoryName);
          const matchesFreshness = freshness === "all" || tool.freshnessStatus === freshness;
          const matchesEvidence = evidence === "all" || tool.evidenceStatus === evidence;
          const matchesPricing = pricingType === "all" || getPricingType(tool.pricing) === pricingType;
          const matchesSubcategory = subcategory === "all" || tool.subcategory === subcategory;
          const matchesScore = matchesScoreRange(tool.score, scoreRange);

          return matchesSearch && matchesFreshness && matchesEvidence && matchesPricing && matchesSubcategory && matchesScore;
        }),
        sort
      ),
    [categoryName, evidence, freshness, pricingType, query, rankedTools, scoreRange, sort, subcategory]
  );
  const filteredEntries = filteredTools.map((tool) => ({ tool, rank: originalRankBySlug.get(tool.slug) ?? 0 }));
  const hasActiveFilters = Boolean(
    query.trim() || freshness !== "all" || evidence !== "all" || pricingType !== "all" || scoreRange !== "all" || subcategory !== "all" || sort !== "score_desc"
  );

  function clearFilters() {
    setQuery("");
    setFreshness("all");
    setEvidence("all");
    setPricingType("all");
    setScoreRange("all");
    setSubcategory("all");
    setSort("score_desc");
  }

  if (!rankedTools.length) {
    return (
      <section className="surface rounded-md p-8">
        <p className="text-sm font-medium">No tools ranked yet</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          This category is ready for data intake. Add tools and source observations in the admin dashboard to populate ranked recommendations.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="sticky top-[65px] z-20 rounded-md border border-border bg-card/95 p-3 shadow-lg shadow-black/5 backdrop-blur-xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className="text-base font-semibold">Ranked recommendations</h2>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground">{rankingDisclaimer}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                <span className="font-mono tabular-nums">{filteredTools.length}</span> of {rankedTools.length} tools
              </span>
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
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
            <label className="relative block">
              <span className="sr-only">Search category tools</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools, use cases, pricing, evidence..."
                className="focus-ring h-10 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm"
              />
            </label>
            <label className="sr-only" htmlFor="category-sort">
              Sort tools
            </label>
            <select id="category-sort" value={sort} onChange={(event) => setSort(event.target.value as ToolSort)} className={selectClass()}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Freshness status
              <select value={freshness} onChange={(event) => setFreshness(event.target.value as StatusFilter<FreshnessStatus>)} className={selectClass()}>
                <option value="all">All freshness</option>
                {freshnessFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Evidence status
              <select value={evidence} onChange={(event) => setEvidence(event.target.value as StatusFilter<EvidenceStatus>)} className={selectClass()}>
                <option value="all">All evidence</option>
                {evidenceFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Pricing type
              <select value={pricingType} onChange={(event) => setPricingType(event.target.value as StatusFilter<PricingType>)} className={selectClass()}>
                <option value="all">All pricing</option>
                {pricingTypes.map((type) => (
                  <option key={type} value={type}>
                    {pricingTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Score range
              <select value={scoreRange} onChange={(event) => setScoreRange(event.target.value as ScoreRange)} className={selectClass()}>
                {scoreRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Subcategory
              <select value={subcategory} onChange={(event) => setSubcategory(event.target.value)} className={selectClass()}>
                <option value="all">All subcategories</option>
                {subcategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="surface overflow-hidden rounded-md">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Plebi rank</th>
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Best for</th>
                <th className="px-4 py-3 text-right font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Freshness</th>
                <th className="px-4 py-3 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map(({ tool, rank }) => (
                <tr key={tool.slug} className="transition hover:bg-muted/40">
                  <td className="w-24 px-4 py-4 font-mono text-xs tabular-nums text-muted-foreground">#{rank}</td>
                  <td className="min-w-56 px-4 py-4">
                    <Link href={`/tools/${tool.slug}`} className="hover:text-primary">
                      <span className="font-medium">{tool.name}</span>
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tool.subcategory} / {tool.pricing}
                    </p>
                  </td>
                  <td className="min-w-72 px-4 py-4 text-sm leading-6 text-muted-foreground">{tool.bestFor}</td>
                  <td className="px-4 py-4 text-right font-mono text-lg font-semibold tabular-nums">{tool.score}%</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-xs ${statusClass(tool.freshnessStatus)}`}>
                      {freshnessLabels[tool.freshnessStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-xs ${statusClass(tool.evidenceStatus)}`}>
                      {evidenceLabels[tool.evidenceStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-border md:hidden">
          {filteredEntries.map(({ tool, rank }) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="block p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">Plebi rank #{rank}</p>
                  <h3 className="mt-1 text-base font-semibold">{tool.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tool.subcategory} / {tool.pricing}
                  </p>
                </div>
                <p className="font-mono text-xl font-semibold tabular-nums">{tool.score}%</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{tool.bestFor}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-md border px-2 py-1 text-xs ${statusClass(tool.freshnessStatus)}`}>
                  {freshnessLabels[tool.freshnessStatus]}
                </span>
                <span className={`rounded-md border px-2 py-1 text-xs ${statusClass(tool.evidenceStatus)}`}>
                  {evidenceLabels[tool.evidenceStatus]}
                </span>
              </div>
            </Link>
          ))}
        </div>
        {!filteredEntries.length ? (
          <div className="border-t border-border px-4 py-8 text-sm text-muted-foreground">
            No tools match these filters. Try clearing one or more filters.
          </div>
        ) : null}
      </section>

      {filteredEntries.length ? (
        <section className="grid gap-4">
          {filteredEntries.map(({ tool, rank }) => (
            <ToolCard key={tool.slug} tool={tool} rank={rank} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
