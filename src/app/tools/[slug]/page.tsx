import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricBars } from "@/components/metric-bars";
import { PollWidget } from "@/components/poll-widget";
import { ScoreRing } from "@/components/score-ring";
import { SourceObservations } from "@/components/source-observations";
import { ToolCard } from "@/components/tool-card";
import { getCategories, getRelatedTools, getToolBySlug, getTools } from "@/lib/repository";
import { getConfidenceLevel, getScoreBreakdown } from "@/lib/scoring";

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

  return (
    <div className="space-y-6">
      <section className="surface rounded-md p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
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
            </div>
            <h1 className="text-4xl font-semibold">{tool.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{tool.tagline}</p>
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
                Compare
              </Link>
            </div>
          </div>
          <div className="flex justify-start lg:justify-center">
            <ScoreRing score={breakdown.finalScore} size="lg" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="surface rounded-md p-5">
          <h2 className="mb-4 text-xl font-semibold">Score Breakdown</h2>
          <MetricBars metrics={breakdown} includeSignals />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Pricing</p>
              <p className="mt-1 text-sm font-medium">{tool.pricing}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Founded</p>
              <p className="mt-1 font-mono text-sm tabular-nums">{tool.founded}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Observations</p>
              <p className="mt-1 font-mono text-sm tabular-nums">{tool.observations.length}</p>
            </div>
          </div>
        </div>
        <PollWidget poll={tool.poll} />
      </section>

      <section className="surface rounded-md p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Source Observations</h2>
          <span className="font-mono text-sm text-muted-foreground tabular-nums">{breakdown.sourceSignal}% signal</span>
        </div>
        <SourceObservations observations={tool.observations} />
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
                  <td className="px-4 py-3 font-mono tabular-nums">{snapshot.capturedAt}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{snapshot.score}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{snapshot.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {relatedTools.length ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Category Alternatives</h2>
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
