import { ArrowRight, BarChart3, ShieldCheck, TrendingUp } from "lucide-react";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { DirectorySearch } from "@/components/directory-search";
import { JsonLd } from "@/components/json-ld";
import { ScoreRing } from "@/components/score-ring";
import { ToolCard } from "@/components/tool-card";
import { getCategories, getRankedTools } from "@/lib/repository";
import { scoreFormula } from "@/lib/scoring";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createItemListJsonLd } from "@/lib/seo/structured-data";
import { rankingDisclaimer } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Plebi | AI tools, categories and comparisons",
  description: "Discover, compare and understand practical AI tools through curated categories, tool pages and clear comparisons.",
  path: "/",
  absoluteTitle: true
});

export default async function HomePage() {
  const [categories, rankedTools] = await Promise.all([getCategories(), getRankedTools()]);
  const topTools = rankedTools.slice(0, 5);
  const averageTopScore = topTools.length ? Math.round(topTools.reduce((total, tool) => total + tool.score, 0) / topTools.length) : 0;
  const observationCount = rankedTools.reduce((total, tool) => total + tool.observations.length, 0);

  return (
    <div className="space-y-10">
      <JsonLd
        data={createItemListJsonLd({
          name: "Plebi AI tools directory",
          path: "/",
          description: "Curated AI tool rankings, categories and decision pages.",
          items: rankedTools.slice(0, 10).map((tool) => ({
            name: tool.name,
            path: `/tools/${tool.slug}`,
            description: tool.summary
          }))
        })}
      />
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="surface rounded-md p-6 sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{rankedTools.length} AI tools</span>
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{categories.length} categories</span>
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">Transparent scoring</span>
            <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{observationCount} evidence signals</span>
          </div>
          <p className="mb-3 text-sm font-medium text-primary">AI tools intelligence</p>
          <h1 className="max-w-4xl break-words text-3xl font-semibold leading-tight sm:text-5xl">
            AI tool rankings with evidence behind every score.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Plebi ranks AI tools by combining structured metrics, source observations, pricing signals and community votes into one transparent score.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <TrackableLink
              href="/tools"
              eventName="nav_link_clicked"
              eventPayload={{ cta_name: "home_browse_ai_tools", route: "/tools", source_route: "/", destination_type: "internal" }}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Browse AI tools
              <ArrowRight className="h-4 w-4" />
            </TrackableLink>
            <TrackableLink
              href="/#categories"
              eventName="nav_link_clicked"
              eventPayload={{ cta_name: "home_explore_categories", route: "/", source_route: "/", destination_type: "internal" }}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
            >
              Explore categories
            </TrackableLink>
            <TrackableLink
              href="/compare"
              eventName="compare_cta_clicked"
              eventPayload={{ cta_name: "home_compare_tools", route: "/compare", source_route: "/", destination_type: "internal" }}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
            >
              Compare tools
            </TrackableLink>
          </div>
        </div>

        <div className="surface rounded-md p-6 lg:p-7">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Top cohort average</p>
              <h2 className="mt-1 text-2xl font-semibold">How Plebi Score works</h2>
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
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The model blends structured product metrics with normalized source observations and live community voting, so each ranking can be inspected instead of taken on trust.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Ranking Inputs", value: "5", detail: "source types", icon: ShieldCheck },
          { label: "Evidence Signals", value: String(observationCount), detail: "source observations", icon: BarChart3 },
          { label: "Poll System", value: "Live", detail: "community voting enabled", icon: TrendingUp }
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

      <DirectorySearch categories={categories} rankedTools={rankedTools} />

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Market Leaders</h2>
            <p className="mt-1 text-sm text-muted-foreground">Highest Plebi Scores across the tracked directory, with freshness and evidence labels.</p>
            <p className="mt-2 max-w-4xl text-xs leading-5 text-muted-foreground">{rankingDisclaimer}</p>
          </div>
          <TrackableLink
            href="/compare"
            eventName="compare_cta_clicked"
            eventPayload={{ cta_name: "home_market_leaders_compare_all", route: "/compare", source_route: "/", destination_type: "internal" }}
            className="hidden text-sm font-medium text-primary sm:inline"
          >
            Compare all
          </TrackableLink>
        </div>
        {topTools.length ? (
          <div className="grid gap-4">
            {topTools.map((tool, index) => (
              <ToolCard key={tool.slug} tool={tool} rank={index + 1} compact={index > 1} analyticsSourceRoute="/" />
            ))}
          </div>
        ) : (
          <div className="surface rounded-md p-8 text-sm leading-6 text-muted-foreground">
            No ranked tools are available yet. Once tool and source records are loaded, Plebi will surface market leaders here.
          </div>
        )}
      </section>
    </div>
  );
}
