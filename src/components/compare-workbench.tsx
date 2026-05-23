"use client";

import { Check, GitCompareArrows, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MetricBars } from "@/components/metric-bars";
import { ScoreRing } from "@/components/score-ring";
import { EmptyStateVisual, StatusBadge, ToolIdentity } from "@/components/visual-identity";
import { getCategoryName, getToolSearchText } from "@/lib/directory-filters";
import { getScoreBreakdown } from "@/lib/scoring";
import type { Category, MetricKey, Tool } from "@/lib/types";

type CompareWorkbenchProps = {
  categories: Category[];
  tools: Tool[];
};

const comparisonRows: Array<{ key: MetricKey | "sourceSignal" | "pollSentiment"; label: string }> = [
  { key: "capability", label: "Capability" },
  { key: "usability", label: "Usability" },
  { key: "reliability", label: "Reliability" },
  { key: "value", label: "Value" },
  { key: "adoption", label: "Adoption" },
  { key: "sourceSignal", label: "Source Signal" },
  { key: "pollSentiment", label: "Poll Sentiment" }
];

export function CompareWorkbench({ categories, tools }: CompareWorkbenchProps) {
  const [addSearch, setAddSearch] = useState("");
  const rankedTools = useMemo(
    () =>
      tools
        .map((tool) => ({ tool, score: getScoreBreakdown(tool).finalScore }))
        .sort((a, b) => b.score - a.score)
        .map(({ tool }) => tool),
    [tools]
  );
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(rankedTools.slice(0, 3).map((tool) => tool.slug));

  const selectedTools = selectedSlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is Tool => Boolean(tool));
  const addableTools = useMemo(
    () =>
      rankedTools.filter((tool) => {
        const matchesSelection = !selectedSlugs.includes(tool.slug);
        const matchesSearch = !addSearch.trim() || getToolSearchText(tool, getCategoryName(tool, categories)).includes(addSearch.trim().toLowerCase());

        return matchesSelection && matchesSearch;
      }),
    [addSearch, categories, rankedTools, selectedSlugs]
  );

  if (!tools.length) {
    return (
      <section className="surface rounded-md p-8">
        <div className="flex gap-4">
          <EmptyStateVisual kind="compare" />
          <div>
            <p className="text-sm font-medium">No tools available to compare</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Add tool records and source observations before using the comparison workbench.
            </p>
          </div>
        </div>
      </section>
    );
  }

  function addTool(slug: string) {
    if (!slug || selectedSlugs.includes(slug) || selectedSlugs.length >= 4) {
      return;
    }

    setSelectedSlugs((current) => [...current, slug]);
  }

  function removeTool(slug: string) {
    setSelectedSlugs((current) => current.filter((selectedSlug) => selectedSlug !== slug));
  }

  return (
    <div className="space-y-6">
      <div className="surface sticky top-[65px] z-20 rounded-md bg-card/95 p-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <GitCompareArrows className="h-5 w-5 text-primary" />
              Comparison Set
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{selectedTools.length} tools selected</p>
          </div>
          <div className="grid w-full gap-2 sm:max-w-lg">
            <label className="relative block">
              <span className="sr-only">Search tools to compare</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={addSearch}
                onChange={(event) => setAddSearch(event.target.value)}
                placeholder="Search tools, category, pricing, fit..."
                className="focus-ring h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">{addableTools.length} available matches</span>
            <select
              className="focus-ring h-11 rounded-md border border-border bg-background px-3 text-sm"
              value=""
              onChange={(event) => addTool(event.target.value)}
            >
              <option value="">Select a tool</option>
              {addableTools.map((tool) => (
                <option key={tool.slug} value={tool.slug}>
                  {tool.name}
                </option>
              ))}
            </select>
            </label>
          </div>
        </div>
      </div>

      {selectedTools.length ? (
        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {selectedTools.map((tool) => {
          const breakdown = getScoreBreakdown(tool);
          return (
            <article key={tool.slug} className="surface rounded-md p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-lg hover:shadow-black/5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <ToolIdentity tool={tool} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{tool.subcategory}</p>
                    <Link href={`/tools/${tool.slug}`} className="mt-1 block truncate text-xl font-semibold hover:text-primary">
                      {tool.name}
                    </Link>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTool(tool.slug)}
                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-danger hover:text-danger"
                  aria-label={`Remove ${tool.name}`}
                  title={`Remove ${tool.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-5 flex justify-center">
                <ScoreRing score={breakdown.finalScore} />
              </div>
              <div className="mb-5 rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Best for</p>
                <p className="mt-1 line-clamp-3 text-sm leading-6">{tool.bestFor}</p>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                <StatusBadge status={tool.freshnessStatus} />
                <StatusBadge status={tool.evidenceStatus} />
              </div>
              <MetricBars metrics={breakdown} includeSignals />
            </article>
          );
        })}
        </div>
      ) : (
        <section className="surface rounded-md p-8">
          <div className="flex gap-4">
            <EmptyStateVisual kind="compare" />
            <div>
              <p className="text-sm font-medium">No comparison selected</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Select at least one tool to start the comparison.</p>
            </div>
          </div>
        </section>
      )}

      {selectedTools.length ? (
        <div className="surface overflow-hidden rounded-md">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold">Decision Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Metric</th>
                {selectedTools.map((tool) => (
                  <th key={tool.slug} className="px-4 py-3 font-medium">
                    {tool.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonRows.map((row) => {
                const rowValues = selectedTools.map((tool) => getScoreBreakdown(tool)[row.key]);
                const bestValue = Math.max(...rowValues);
                return (
                  <tr key={row.key}>
                    <td className="px-4 py-3 text-muted-foreground">{row.label}</td>
                    {selectedTools.map((tool) => {
                      const value = getScoreBreakdown(tool)[row.key];
                      return (
                        <td key={tool.slug} className="px-4 py-3">
                          <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                            {value}
                            {value === bestValue ? <Check className="h-4 w-4 text-success" /> : null}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td className="px-4 py-3 text-muted-foreground">Pricing</td>
                {selectedTools.map((tool) => (
                  <td key={tool.slug} className="px-4 py-3 text-muted-foreground">
                    {tool.pricing}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted-foreground">Best fit</td>
                {selectedTools.map((tool) => (
                  <td key={tool.slug} className="px-4 py-3 text-muted-foreground">
                    {tool.summary}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      ) : null}

      {selectedSlugs.length < 4 ? (
        <button
          type="button"
          onClick={() => addTool(addableTools[0]?.slug ?? "")}
          disabled={!addableTools.length}
          className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add next ranked tool
        </button>
      ) : null}
    </div>
  );
}
