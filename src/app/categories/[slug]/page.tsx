import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryRankings } from "@/components/category-rankings";
import { JsonLd } from "@/components/json-ld";
import { CategoryVisual, StatusBadge, ToolIdentity } from "@/components/visual-identity";
import { getCategories, getCategoryBySlug, getRankedTools } from "@/lib/repository";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createItemListJsonLd } from "@/lib/seo/structured-data";
import { getCategoryRefreshLabel } from "@/lib/status";
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

  if (!category) {
    return createPageMetadata({
      title: "Category not found",
      description: "This AI tools category could not be found.",
      path: `/categories/${slug}`,
      noIndex: true
    });
  }

  return createPageMetadata({
    title: `${category.name} AI Tools`,
    description: category.description,
    path: `/categories/${category.slug}`
  });
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
    <div className="space-y-7">
      <JsonLd
        data={createItemListJsonLd({
          name: `${category.name} AI tools`,
          path: `/categories/${category.slug}`,
          description: category.description,
          items: rankedTools.map((tool) => ({
            name: tool.name,
            path: `/tools/${tool.slug}`,
            description: tool.summary
          }))
        })}
      />
      <section className="surface rounded-md p-6 sm:p-8 lg:p-10">
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
            <div className="mt-3 flex items-center gap-4">
              <CategoryVisual category={category} size="lg" />
              <h1 className="text-4xl font-semibold sm:text-5xl">{category.name}</h1>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{category.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <p className="inline-flex rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                Last refreshed: {refreshLabel}
              </p>
              <p className="inline-flex rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                {rankedTools.length} ranked tools
              </p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">Market signal</p>
            <p className="mt-2 text-sm leading-6">{category.signal}</p>
            <p className="mt-4 text-xs text-muted-foreground">Benchmark emphasis</p>
            <p className="mt-2 text-sm leading-6">{category.benchmark}</p>
          </div>
        </div>
      </section>

      {categoryLabels.length ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {categoryLabels.map((item) => (
            <Link
              key={item.label}
              href={`/tools/${item.tool.slug}`}
              className="surface focus-ring rounded-md p-4 transition hover:border-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">{item.label}</p>
                <p className="font-mono text-sm font-semibold tabular-nums">{item.tool.score}%</p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <ToolIdentity tool={item.tool} size="sm" />
                <p className="text-base font-semibold">{item.tool.name}</p>
              </div>
              <div className="mt-3 rounded-md border border-border bg-background px-3 py-2">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Best for</p>
                <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.tool.bestFor}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={item.tool.freshnessStatus} />
                <StatusBadge status={item.tool.evidenceStatus} />
              </div>
            </Link>
          ))}
        </section>
      ) : null}

      <CategoryRankings rankedTools={rankedTools} categoryName={category.name} />
    </div>
  );
}
