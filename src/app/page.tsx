import { ArrowRight, BarChart3, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { CategoryCard } from "@/components/category-card";
import { ScoreRing } from "@/components/score-ring";
import { ToolCard } from "@/components/tool-card";
import { getCategories, getRankedTools } from "@/lib/repository";
import { scoreFormula } from "@/lib/scoring";

export default function HomePage() {
  const categories = getCategories();
  const rankedTools = getRankedTools();
  const topTools = rankedTools.slice(0, 5);
  const averageTopScore = Math.round(topTools.reduce((total, tool) => total + tool.score, 0) / topTools.length);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface rounded-md p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">40 seeded tools</span>
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">8 categories</span>
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">Transparent scoring</span>
          </div>
          <h1 className="max-w-4xl break-words text-3xl font-semibold leading-tight sm:text-5xl">
            AI tool rankings with evidence behind every score.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Plebi combines benchmark signals, operator review, trust checks, pricing audits, and user polls into a clear score for faster tool decisions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/compare"
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Compare leaders
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/categories/coding-dev"
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
            >
              View coding tools
            </Link>
          </div>
        </div>

        <div className="surface rounded-md p-6">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Top cohort average</p>
              <h2 className="mt-1 text-2xl font-semibold">Plebi Score</h2>
            </div>
            <ScoreRing score={averageTopScore} />
          </div>
          <div className="grid gap-3">
            {scoreFormula.map((item) => (
              <div key={item.label} className="rounded-md border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono tabular-nums">{item.weight}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${item.weight}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Ranking Inputs", value: "5", detail: "source types", icon: ShieldCheck },
          { label: "Score Snapshots", value: "80", detail: "seeded records", icon: BarChart3 },
          { label: "Poll Depth", value: "52k+", detail: "sample votes", icon: TrendingUp }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="surface rounded-md p-5">
              <Icon className="mb-4 h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 font-mono text-3xl font-semibold tabular-nums">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">Browse ranked markets by workflow and buying context.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} {...category} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Market Leaders</h2>
            <p className="mt-1 text-sm text-muted-foreground">Highest current Plebi Scores across the seeded directory.</p>
          </div>
          <Link href="/compare" className="hidden text-sm font-medium text-primary sm:inline">
            Compare all
          </Link>
        </div>
        <div className="grid gap-4">
          {topTools.map((tool, index) => (
            <ToolCard key={tool.slug} tool={tool} rank={index + 1} compact={index > 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
