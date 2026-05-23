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
  const filteredEntries = rankedEntries.filter((entry) => matchesFilter(entry.tool, activeFilter));

  return (
    <>
      <section className="surface overflow-hidden rounded-md">
        <div className="border-b border-border px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold">Rank Table</h2>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground">{rankingDisclaimer}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`focus-ring h-9 rounded-md border px-3 text-xs font-medium transition ${
                    activeFilter === filter.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Subcategory</th>
                <th className="px-4 py-3 font-medium">Plebi Score</th>
                <th className="px-4 py-3 font-medium">Freshness</th>
                <th className="px-4 py-3 font-medium">Evidence</th>
                <th className="px-4 py-3 font-medium">Pricing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map(({ tool, rank }) => (
                <tr key={tool.slug}>
                  <td className="px-4 py-3 font-mono tabular-nums">#{rank}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/tools/${tool.slug}`} className="hover:text-primary">
                      {tool.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tool.subcategory}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{tool.score}%</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-xs ${statusClass(tool.freshnessStatus)}`}>
                      {freshnessLabels[tool.freshnessStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-xs ${statusClass(tool.evidenceStatus)}`}>
                      {evidenceLabels[tool.evidenceStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tool.pricing}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </>
  );
}
