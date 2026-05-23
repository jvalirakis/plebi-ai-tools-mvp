import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { MetricBars } from "@/components/metric-bars";
import { ScoreRing } from "@/components/score-ring";
import { StatusBadge, ToolIdentity } from "@/components/visual-identity";
import { getConfidenceLevel, getRankExplanation, getScoreBreakdown } from "@/lib/scoring";
import type { Tool } from "@/lib/types";

type ToolCardProps = {
  tool: Tool;
  rank?: number;
  compact?: boolean;
};

export function ToolCard({ tool, rank, compact = false }: ToolCardProps) {
  const breakdown = getScoreBreakdown(tool);
  const confidence = getConfidenceLevel(tool);

  return (
    <article className="surface rounded-md p-5 transition hover:border-primary/70">
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            {rank ? <span className="chip rounded-md px-2 py-1 font-mono text-xs">#{rank}</span> : null}
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{tool.subcategory}</span>
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{tool.stage}</span>
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">
              Confidence {confidence}%
            </span>
            <StatusBadge status={tool.freshnessStatus} />
            <StatusBadge status={tool.evidenceStatus} />
          </div>
          <div className="flex items-start gap-3">
            <ToolIdentity tool={tool} size={compact ? "sm" : "md"} />
            <div className="min-w-0">
              <Link href={`/tools/${tool.slug}`} className="group inline-flex items-center gap-2">
                <h3 className="text-xl font-semibold">{tool.name}</h3>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </Link>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{tool.tagline}</p>
            </div>
          </div>
          <div className="mt-4 max-w-3xl rounded-md border border-border bg-background px-3 py-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Best for</p>
            <p className="mt-1 text-sm leading-6">{tool.bestFor}</p>
          </div>
          {!compact ? (
            <p className="mt-3 max-w-3xl rounded-md border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">Why this rank? </span>
              {getRankExplanation(tool)}
            </p>
          ) : null}
          {!compact ? (
            <div className="mt-4 max-w-2xl">
              <MetricBars metrics={tool.metrics} />
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-start md:justify-end">
          <ScoreRing score={breakdown.finalScore} size={compact ? "sm" : "md"} />
        </div>
      </div>
    </article>
  );
}
