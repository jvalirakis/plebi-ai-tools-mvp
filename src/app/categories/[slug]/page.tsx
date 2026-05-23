import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolCard } from "@/components/tool-card";
import { getCategories, getCategoryBySlug, getRankedTools } from "@/lib/repository";
import { evidenceLabels, freshnessLabels, getCategoryRefreshLabel, rankingDisclaimer, statusClass } from "@/lib/status";
import type { Tool } from "@/lib/types";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

type RankedTool = Tool & { score: number };

function pickBy(tools: RankedTool[], score: (tool: RankedTool) => number) {
  return tools.slice().sort((a, b) => score(b) - score(a))[0];
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  return {
    title: category ? `${category.name} Rankings | Plebi` : "Category | Plebi"
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const rankedTools = await getRankedTools(category.slug);
  const refreshLabel = getCategoryRefreshLabel(rankedTools);
  const categoryLabels = [
    { label: "Best overall", tool: rankedTools[0] },
    { label: "Best value", tool: pickBy(rankedTools, (tool) => tool.metrics.value) },
    { label: "Best for teams", tool: pickBy(rankedTools, (tool) => tool.metrics.usability + tool.metrics.adoption + (tool.stage === "Established" ? 8 : 0)) },
    { label: "Best for beginners", tool: pickBy(rankedTools, (tool) => tool.metrics.usability) },
    {
      label: "Best enterprise-ready",
      tool: pickBy(rankedTools, (tool) => tool.metrics.reliability + tool.metrics.adoption + (tool.stage === "Established" ? 10 : 0))
    }
  ].filter((item): item is { label: string; tool: RankedTool } => Boolean(item.tool));

  return (
    <div className="space-y-6">
      <section className="surface rounded-md p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {category.subcategories.map((subcategory) => (
            <span key={subcategory} className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">
              {subcategory}
            </span>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <Link href="/" className="text-sm text-primary">
              Directory
            </Link>
            <h1 className="mt-3 text-4xl font-semibold">{category.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{category.description}</p>
            <p className="mt-5 inline-flex rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              Last refreshed: {refreshLabel}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">Market signal</p>
            <p className="mt-2 text-sm leading-6">{category.signal}</p>
            <p className="mt-4 text-xs text-muted-foreground">Benchmark emphasis</p>
            <p className="mt-2 text-sm leading-6">{category.benchmark}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {categoryLabels.map((item) => (
          <Link
            key={item.label}
            href={`/tools/${item.tool.slug}`}
            className="surface focus-ring rounded-md p-4 transition hover:border-primary"
          >
            <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-base font-semibold">{item.tool.name}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.tool.bestFor}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-md border px-2 py-1 text-xs ${statusClass(item.tool.freshnessStatus)}`}>
                {freshnessLabels[item.tool.freshnessStatus]}
              </span>
              <span className={`rounded-md border px-2 py-1 text-xs ${statusClass(item.tool.evidenceStatus)}`}>
                {evidenceLabels[item.tool.evidenceStatus]}
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="surface overflow-hidden rounded-md">
        <div className="border-b border-border px-4 py-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-base font-semibold">Rank Table</h2>
            <p className="max-w-4xl text-xs leading-5 text-muted-foreground">{rankingDisclaimer}</p>
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
              {rankedTools.map((tool, index) => (
                <tr key={tool.slug}>
                  <td className="px-4 py-3 font-mono tabular-nums">#{index + 1}</td>
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
      </section>

      <section className="grid gap-4">
        {rankedTools.map((tool, index) => (
          <ToolCard key={tool.slug} tool={tool} rank={index + 1} />
        ))}
      </section>
    </div>
  );
}
