"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ToolCard } from "@/components/tool-card";
import { evidenceLabels, freshnessLabels, rankingDisclaimer, statusClass } from "@/lib/status";
import type { Tool } from "@/lib/types";

type RankedTool = Tool & { score: number };
type RankingFilter = "all" | "source_verified" | "needs_review" | "seed_only" | "current";

type CategoryRankingsProps = {
  rankedTools: RankedTool[];
};

const filters: Array<{ id: RankingFilter; label: string }> = [
  { id: "all", label: "All tools" },
  { id: "source_verified", label: "Source verified" },
  { id: "needs_review", label: "Needs review" },
  { id: "seed_only", label: "Seed only" },
  { id: "current", label: "Current" }
];

function matchesFilter(tool: RankedTool, filter: RankingFilter) {
  switch (filter) {
    case "source_verified":
      return tool.evidenceStatus === "source_verified";
    case "needs_review":
      return tool.freshnessStatus === "needs_review";
    case "seed_only":
      return tool.freshnessStatus === "seed_only";
    case "current":
      return tool.freshnessStatus === "current";
    case "all":
    default:
      return true;
  }
}

export function CategoryRankings({ rankedTools }: CategoryRankingsProps) {
  const [activeFilter, setActiveFilter] = useState<RankingFilter>("all");
  const rankedEntries = useMemo(() => rankedTools.map((tool, index) => ({ tool, rank: index + 1 })), [rankedTools]);
  const filterCounts = useMemo(
    () =>
      filters.reduce<Record<RankingFilter, number>>(
        (counts, filter) => ({
          ...counts,
          [filter.id]: rankedTools.filter((tool) => matchesFilter(tool, filter.id)).length
        }),
        { all: 0, source_verified: 0, needs_review: 0, seed_only: 0, current: 0 }
      ),
    [rankedTools]
  );
  const filteredEntries = rankedEntries.filter((entry) => matchesFilter(entry.tool, activeFilter));

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
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-base font-semibold">Ranked recommendations</h2>
            <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground">{rankingDisclaimer}</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`focus-ring inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-medium transition ${
                  activeFilter === filter.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {filter.label}
                <span className="font-mono tabular-nums opacity-75">{filterCounts[filter.id]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="surface overflow-hidden rounded-md">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Best for</th>
                <th className="px-4 py-3 text-right font-medium">Plebi Score</th>
                <th className="px-4 py-3 font-medium">Freshness</th>
                <th className="px-4 py-3 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map(({ tool, rank }) => (
                <tr key={tool.slug} className="transition hover:bg-muted/40">
                  <td className="w-20 px-4 py-4 font-mono text-xs tabular-nums text-muted-foreground">#{rank}</td>
                  <td className="min-w-56 px-4 py-4">
                    <Link href={`/tools/${tool.slug}`} className="hover:text-primary">
                      <span className="font-medium">{tool.name}</span>
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{tool.subcategory} / {tool.pricing}</p>
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
                  <p className="font-mono text-xs text-muted-foreground">#{rank}</p>
                  <h3 className="mt-1 text-base font-semibold">{tool.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{tool.subcategory} / {tool.pricing}</p>
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
          <div className="border-t border-border px-4 py-8 text-sm text-muted-foreground">No tools match this evidence filter.</div>
        ) : null}
      </section>

      <section className="grid gap-4">
        {filteredEntries.map(({ tool, rank }) => (
          <ToolCard key={tool.slug} tool={tool} rank={rank} />
        ))}
      </section>
    </div>
  );
}
