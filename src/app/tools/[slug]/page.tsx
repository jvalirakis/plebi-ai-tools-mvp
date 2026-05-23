import { AlertTriangle, ExternalLink, GitCompareArrows } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricBars } from "@/components/metric-bars";
import { PollWidget } from "@/components/poll-widget";
import { ScoreRing } from "@/components/score-ring";
import { SourceObservations } from "@/components/source-observations";
import { ToolCard } from "@/components/tool-card";
import { getDecisionSummary, shouldShowEvidenceCallout } from "@/lib/decision";
import { getEvidenceQualitySummary } from "@/lib/evidence";
import { getCategories, getRankedTools, getToolBySlug, getTools } from "@/lib/repository";
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
    title: tool ? `${tool.name} Decision Page | Plebi` : "Tool | Plebi"
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const [categories, categoryTools] = await Promise.all([getCategories(), getRankedTools(tool.categorySlug)]);
  const category = categories.find((item) => item.slug === tool.categorySlug);
  const categoryLeader = categoryTools[0];
  const alternatives = categoryTools.filter((item) => item.slug !== tool.slug).slice(0, 4);
  const comparisonTarget = categoryLeader?.slug === tool.slug ? alternatives[0] : categoryLeader;
  const breakdown = getScoreBreakdown(tool);
  const confidence = getConfidenceLevel(tool);
  const evidenceQuality = getEvidenceQualitySummary(tool);
  const decision = getDecisionSummary(tool, category);
  const metricModel = Math.round(getMetricModel(tool.metrics));

  return (
    <div className="space-y-7">
      <section className="surface rounded-md p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
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
            <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground">{tool.summary}</p>
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
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare with category leader
              </Link>
            </div>
          </div>

          <aside className="rounded-md border border-border bg-background p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Decision summary</p>
                <h2 className="mt-2 text-lg font-semibold">Should this be on your shortlist?</h2>
              </div>
              <ScoreRing score={breakdown.finalScore} size="sm" />
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Best for</p>
                <p className="mt-1 leading-6">{tool.bestFor}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <p className="text-xs text-muted-foreground">Evidence</p>
                  <p className="mt-1 text-sm font-medium">{evidenceLabels[tool.evidenceStatus]}</p>
                </div>
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <p className="text-xs text-muted-foreground">Freshness</p>
                  <p className="mt-1 text-sm font-medium">{freshnessLabels[tool.freshnessStatus]}</p>
                </div>
              </div>
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Main strength</p>
                <p className="mt-1 leading-6">{decision.mainStrength}</p>
              </div>
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Main caution</p>
                <p className="mt-1 leading-6">{decision.mainCaution}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {shouldShowEvidenceCallout(tool) ? (
        <section className="rounded-md border border-warning/30 bg-warning/10 p-4 text-warning">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Evidence status needs review</p>
              <p className="mt-1 text-sm leading-6">
                This page is marked {freshnessLabels[tool.freshnessStatus].toLowerCase()} and {evidenceLabels[
                  tool.evidenceStatus
                ].toLowerCase()}. Treat the ranking as a transparent dataset signal until fresher source observations are reviewed.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface rounded-md p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">Summary</p>
          <h2 className="mt-2 text-xl font-semibold">Fit profile</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{tool.summary}</p>
        </div>
        <div className="surface rounded-md p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">Best for</p>
          <h2 className="mt-2 text-xl font-semibold">Strongest use case</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{tool.bestFor}</p>
        </div>
        <div className="surface rounded-md p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">Not ideal for</p>
          <h2 className="mt-2 text-xl font-semibold">Use caution when</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {decision.notIdealFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="surface rounded-md p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-semibold">Plebi Score breakdown</h2>
          <MetricBars metrics={breakdown} includeSignals />
          <div className="mt-6 rounded-md border border-border bg-background p-4">
            <p className="text-sm font-semibold">Why this rank?</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{getRankExplanation(tool)}</p>
          </div>
        </div>

        <div className="surface rounded-md p-5">
          <h2 className="text-xl font-semibold">Pricing summary</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-muted-foreground">Pricing</span>
              <span className="text-right font-medium">{tool.pricing}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-muted-foreground">Founded</span>
              <span className="font-mono tabular-nums">{tool.founded}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-muted-foreground">Metric model</span>
              <span className="font-mono tabular-nums">{metricModel}%</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-muted-foreground">Source signal</span>
              <span className="font-mono tabular-nums">{breakdown.sourceSignal}%</span>
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
          <h2 className="text-xl font-semibold">Compare before deciding</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Compare {tool.name}
            {comparisonTarget ? ` with ${comparisonTarget.name}` : " with category alternatives"} to inspect metric tradeoffs, pricing, source signal,
            and poll sentiment side by side.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/compare"
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <GitCompareArrows className="h-4 w-4" />
              {comparisonTarget ? `Compare with ${comparisonTarget.name}` : "Compare category alternatives"}
            </Link>
            {comparisonTarget ? (
              <Link
                href={`/tools/${comparisonTarget.slug}`}
                className="focus-ring inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
              >
                View {comparisonTarget.name}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {alternatives.length ? (
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Alternatives in this category</h2>
              <p className="mt-1 text-sm text-muted-foreground">Other tools in {category?.name ?? tool.categorySlug} worth comparing before a decision.</p>
            </div>
            <Link href="/compare" className="text-sm font-medium text-primary">
              Compare all
            </Link>
          </div>
          <div className="grid gap-4">
            {alternatives.map((alternative) => (
              <ToolCard key={alternative.slug} tool={alternative} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
