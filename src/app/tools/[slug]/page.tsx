import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricBars } from "@/components/metric-bars";
import { PollWidget } from "@/components/poll-widget";
import { ScoreRing } from "@/components/score-ring";
import { SourceObservations } from "@/components/source-observations";
import { ToolCard } from "@/components/tool-card";
import { getEvidenceQualitySummary } from "@/lib/evidence";
import { getCategories, getRelatedTools, getToolBySlug, getTools } from "@/lib/repository";
import { getConfidenceLevel, getMetricModel, getRankExplanation, getScoreBreakdown } from "@/lib/scoring";
import { evidenceLabels, freshnessLabels, statusClass } from "@/lib/status";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  return {
    title: tool ? `${tool.name} Score | Plebi` : "Tool | Plebi"
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const [categories, relatedTools] = await Promise.all([getCategories(), getRelatedTools(tool.slug)]);
  const category = categories.find((item) => item.slug === tool.categorySlug);
  const breakdown = getScoreBreakdown(tool);
  const confidence = getConfidenceLevel(tool);
  const evidenceQuality = getEvidenceQualitySummary(tool);
  const metricModel = Math.round(getMetricModel(tool.metrics));

  return (
    <div className="space-y-7">
      <section className="surface rounded-md p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {category ? (
                <Link href={`/categories/${category.slug}`} className="chip rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-primary">
                  {category.name}
                </Link>
              ) : null}
              <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{tool.subcategory}</span>
              <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{tool.stage}</span>
              <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">Confidence {confidence}%</span>
              <span className={`rounded-md border px-2 py-1 text-xs ${statusClass(tool.freshnessStatus)}`}>
                {freshnessLabels[tool.freshnessStatus]}
              </span>
              <span className={`rounded-md border px-2 py-1 text-xs ${statusClass(tool.evidenceStatus)}`}>
                {evidenceLabels[tool.evidenceStatus]}
              </span>
            </div>
            <h1 className="text-4xl font-semibold sm:text-5xl">{tool.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{tool.tagline}</p>
            <div className="mt-5 max-w-3xl rounded-md border border-border bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Best for</p>
              <p className="mt-1 text-sm leading-6">{tool.bestFor}</p>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{tool.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={tool.website}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Visit website
                <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                href="/compare"
                className="focus-ring inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
              >
                Compare alternatives
              </Link>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-5">
            <ScoreRing score={breakdown.finalScore} size="lg" />
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Pricing</span>
                <span className="text-right font-medium">{tool.pricing}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Founded</span>
                <span className="font-mono tabular-nums">{tool.founded}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-mono tabular-nums">{confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface rounded-md p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Plebi Score breakdown</h2>
            <MetricBars metrics={breakdown} includeSignals />
            <div className="mt-6 rounded-md border border-border bg-background p-4">
              <p className="text-sm font-semibold">Why this rank?</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{getRankExplanation(tool)}</p>
            </div>
          </div>
          <div className="grid content-start gap-3">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Metric model</p>
              <p className="mt-1 font-mono text-lg tabular-nums">{metricModel}%</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Source signal</p>
              <p className="mt-1 font-mono text-lg tabular-nums">{breakdown.sourceSignal}%</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Community sentiment</p>
              <p className="mt-1 font-mono text-lg tabular-nums">{breakdown.pollSentiment}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface rounded-md p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Evidence quality</h2>
            <p className="text-sm text-muted-foreground">Manual and source-backed observations currently attached to this tool.</p>
          </div>
          <span className={`inline-flex rounded-md border px-2 py-1 text-xs ${statusClass(tool.evidenceStatus)}`}>
            {evidenceQuality.evidenceStatusLabel}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Sources</p>
            <p className="mt-1 font-mono text-lg tabular-nums">{evidenceQuality.sourceCount}</p>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Highest confidence</p>
            <p className="mt-1 text-sm font-medium">
              {evidenceQuality.highestConfidenceObservation
                ? `${evidenceQuality.highestConfidenceObservation.sourceName} (${(evidenceQuality.highestConfidenceObservation.confidence * 100).toFixed(0)}%)`
                : "No source yet"}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Last observed</p>
            <p className="mt-1 font-mono text-sm tabular-nums">{evidenceQuality.lastObservedAt ?? "No observations"}</p>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Evidence status</p>
            <p className="mt-1 text-sm font-medium">{evidenceQuality.evidenceStatusLabel}</p>
          </div>
        </div>
      </section>

      <section className="surface rounded-md p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Source breakdown</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              View evidence behind the score by source, confidence, weight, and observation date.
            </p>
          </div>
          <span className="font-mono text-sm text-muted-foreground tabular-nums">{breakdown.sourceSignal}% signal</span>
        </div>
        <SourceObservations observations={tool.observations} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <PollWidget poll={tool.poll} />
        <div className="surface rounded-md p-5">
          <h2 className="text-xl font-semibold">Compare in context</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Place {tool.name} beside category alternatives to inspect metric tradeoffs, pricing, source signal, and poll sentiment.
          </p>
          <Link
            href="/compare"
            className="focus-ring mt-5 inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Open compare
          </Link>
        </div>
      </section>

      <section className="surface overflow-hidden rounded-md">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold">Score History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tool.scoreSnapshots.map((snapshot) => (
                <tr key={snapshot.id}>
                  <td className="px-4 py-3 font-mono tabular-nums">{snapshot.snapshotDate}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{snapshot.score}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{snapshot.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!tool.scoreSnapshots.length ? (
          <div className="border-t border-border px-4 py-8 text-sm text-muted-foreground">
            No score snapshots are available yet. Recalculated admin snapshots will appear here after evidence review.
          </div>
        ) : null}
      </section>

      {relatedTools.length ? (
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Category Alternatives</h2>
              <p className="mt-1 text-sm text-muted-foreground">Other tools in this category worth comparing before a decision.</p>
            </div>
            <Link href="/compare" className="text-sm font-medium text-primary">
              Compare all
            </Link>
          </div>
          <div className="grid gap-4">
            {relatedTools.map((relatedTool) => (
              <ToolCard key={relatedTool.slug} tool={relatedTool} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
