import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolCard } from "@/components/tool-card";
import { getCategories, getCategoryBySlug, getRankedTools } from "@/lib/repository";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

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
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">Market signal</p>
            <p className="mt-2 text-sm leading-6">{category.signal}</p>
            <p className="mt-4 text-xs text-muted-foreground">Benchmark emphasis</p>
            <p className="mt-2 text-sm leading-6">{category.benchmark}</p>
          </div>
        </div>
      </section>

      <section className="surface overflow-hidden rounded-md">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold">Rank Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Subcategory</th>
                <th className="px-4 py-3 font-medium">Plebi Score</th>
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
