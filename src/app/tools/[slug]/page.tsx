import { AlertTriangle, ExternalLink, GitCompareArrows } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { MetricBars } from "@/components/metric-bars";
import { PollWidget } from "@/components/poll-widget";
import { ScoreRing } from "@/components/score-ring";
import { SourceObservations } from "@/components/source-observations";
import { ToolCard } from "@/components/tool-card";
import { CategoryVisual, StatusBadge, ToolIdentity } from "@/components/visual-identity";
import { getToolDecisionSections, getToolTrustFields } from "@/lib/content";
import { getDecisionSummary, getEvidenceCallout, shouldShowEvidenceCallout } from "@/lib/decision";
import { getEvidenceQualitySummary } from "@/lib/evidence";
import { getCategories, getRankedTools, getToolBySlug, getTools } from "@/lib/repository";
import { getConfidenceLevel, getMetricModel, getRankExplanation, getScoreBreakdown } from "@/lib/scoring";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbListJsonLd, createToolJsonLd } from "@/lib/seo/structured-data";
import { evidenceLabels, freshnessLabels } from "@/lib/status";

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

  if (!tool) {
    return createPageMetadata({
      title: "Tool not found",
      description: "This AI tool profile could not be found.",
      path: `/tools/${slug}`,
      noIndex: true
    });
  }

  return createPageMetadata({
    title: tool.name,
    description: tool.summary || tool.tagline,
    path: `/tools/${tool.slug}`
  });
}

function getSafeExternalUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:" ? parsedUrl.toString() : undefined;
  } catch {
    return undefined;
  }
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
  const decisionContent = getToolDecisionSections(tool, category);
  const trustFields = getToolTrustFields(tool, category);
  const evidenceCallout = getEvidenceCallout(tool);
  const lastVerifiedOrObserved = tool.lastVerifiedAt ?? evidenceQuality.lastObservedAt ?? "Not verified";
  const metricModel = Math.round(getMetricModel(tool.metrics));
  const officialWebsite = getSafeExternalUrl(tool.website);

  return (
    <div className="space-y-7">
      <JsonLd
        data={[
          createBreadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: tool.name, path: `/tools/${tool.slug}` }
          ]),
          createToolJsonLd(tool, category)
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: tool.name }]} />
      <section className="surface rounded-md p-5 sm:p-6 lg:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {category ? (
                <Link href={`/categories/${category.slug}`} className="chip rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-primary">
                  {category.name}
                </Link>
              ) : null}
              <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{tool.subcategory}</span>
              <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{tool.stage}</span>
              <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">Confidence {confidence}%</span>
              <StatusBadge status={tool.freshnessStatus} />
              <StatusBadge status={tool.evidenceStatus} />
            </div>
            <div className="flex items-start gap-4">
              <ToolIdentity tool={tool} size="lg" />
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold sm:text-4xl">{tool.name}</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{tool.tagline}</p>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{tool.summary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {officialWebsite ? (
                <a
                  href={officialWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Visit official website
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
              <Link
                href="/compare"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare tools
              </Link>
              <Link
                href="/tools"
                className="focus-ring inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
              >
                View all tools
              </Link>
              {category ? (
                <Link
                  href={`/categories/${category.slug}`}
                  className="focus-ring inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
                >
                  Browse this category
                </Link>
              ) : null}
            </div>
          </div>

          <aside className="rounded-md border border-border bg-background p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Quick verdict</p>
                <h2 className="mt-2 text-lg font-semibold">Shortlist fit</h2>
              </div>
              <ScoreRing score={breakdown.finalScore} size="sm" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Signals</p>
                <p className="mt-1 font-mono tabular-nums">{tool.observations.length}</p>
              </div>
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Last verified / observed</p>
                <p className="mt-1 font-mono text-xs tabular-nums">{lastVerifiedOrObserved}</p>
              </div>
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Evidence</p>
                <p className="mt-1 text-sm font-medium">{evidenceLabels[tool.evidenceStatus]}</p>
              </div>
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Freshness</p>
                <p className="mt-1 text-sm font-medium">{freshnessLabels[tool.freshnessStatus]}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Best for</p>
                <p className="mt-1 leading-6">{tool.bestFor}</p>
              </div>
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs text-muted-foreground">Verdict</p>
                <p className="mt-1 leading-6">{decisionContent.quickVerdict}</p>
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
              <p className="text-sm font-semibold">{evidenceCallout.title}</p>
              <p className="mt-1 text-sm leading-6">{evidenceCallout.copy}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface rounded-md p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Summary</p>
            <div className="mt-2 flex items-center gap-3">
              {category ? <CategoryVisual category={category} size="sm" /> : null}
              <h2 className="text-xl font-semibold">Fit profile</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{tool.summary}</p>
          </div>
          <div className="surface rounded-md p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Practical use cases</p>
            <h2 className="mt-2 text-xl font-semibold">May be useful for</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {decisionContent.practicalUseCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="surface rounded-md p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Key strengths</p>
            <h2 className="mt-2 text-xl font-semibold">Strong signals</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {decisionContent.keyStrengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="surface rounded-md p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Limitations / caveats</p>
            <h2 className="mt-2 text-xl font-semibold">Consider alternatives if</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {decisionContent.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="surface rounded-md p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">Trust & caution</p>
          <h2 className="mt-2 text-xl font-semibold">Review before deciding</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {trustFields.map((field) => (
              <div key={field.label} className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                {field.href ? (
                  <a href={field.href} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-medium text-primary">
                    {field.value}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="mt-1 leading-6">{field.value}</p>
                )}
                {field.helper ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{field.helper}</p> : null}
              </div>
            ))}
          </div>
        </aside>
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
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{decisionContent.pricingNote}</p>
        </div>
      </section>

      <section className="surface rounded-md p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Evidence quality</h2>
            <p className="text-sm text-muted-foreground">Manual and source-backed observations currently attached to this tool.</p>
          </div>
          <StatusBadge status={tool.evidenceStatus} label={evidenceQuality.evidenceStatusLabel} />
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

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="surface rounded-md p-5">
          <h2 className="text-xl font-semibold">How to choose</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {decisionContent.howToChoose.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="surface rounded-md p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">Related category</p>
          <h2 className="mt-2 text-xl font-semibold">{category?.name ?? tool.categorySlug}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use the category page to compare nearby tools with the same freshness, evidence, pricing, and score context.
          </p>
          {category ? (
            <Link href={`/categories/${category.slug}`} className="mt-4 inline-flex text-sm font-medium text-primary">
              View {category.name}
            </Link>
          ) : null}
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
      ) : (
        <section className="surface rounded-md p-5">
          <h2 className="text-xl font-semibold">Alternatives in this category</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Alternatives have not been curated yet for this profile.</p>
        </section>
      )}
    </div>
  );
}
