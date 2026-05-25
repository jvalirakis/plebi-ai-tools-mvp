import { ArrowRight, GitCompareArrows, ListFilter, Search } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { ToolsBrowser } from "@/components/tools-browser";
import { CategoryVisual } from "@/components/visual-identity";
import { getCategories, getRankedTools } from "@/lib/repository";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createItemListJsonLd } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "AI Tools",
  description: "Browse curated AI tools by category, use case, pricing context, and practical fit.",
  path: "/tools"
});

export default async function ToolsPage() {
  const [categories, rankedTools] = await Promise.all([getCategories(), getRankedTools()]);
  const featuredCategories = categories.slice().sort((a, b) => b.toolCount - a.toolCount || a.name.localeCompare(b.name)).slice(0, 6);

  return (
    <div className="space-y-8">
      <JsonLd
        data={createItemListJsonLd({
          name: "Plebi AI tools",
          path: "/tools",
          description: "Curated AI tools by category, use case, pricing context, and practical fit.",
          items: rankedTools.map((tool) => ({
            name: tool.name,
            path: `/tools/${tool.slug}`
          }))
        })}
      />

      <section className="surface rounded-md p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm font-medium text-primary">Curated tools directory</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">AI Tools</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Browse curated AI tools by category, use case, and practical fit. Each tool page highlights what it is good for, where it may not fit,
              and what to check before using it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/compare"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare tools
              </Link>
              <a href="#tools-directory-heading" className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary">
                Browse all tools
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Start here</p>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
              <p>Use search when you know a tool, use category filters for discovery, and compare shortlisted options before deciding.</p>
              <p>Review each tool&apos;s evidence, freshness, pricing note, and data caution before adopting it in a workflow.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Search by fit", copy: "Find tools by name, category, pricing context, summary, or best-for guidance.", icon: Search },
          { label: "Filter by category", copy: "Move from broad discovery to category-specific shortlists.", icon: ListFilter },
          { label: "Compare before buying", copy: "Use compare to inspect score inputs, freshness, evidence status, and pricing context side by side.", icon: GitCompareArrows }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="surface rounded-md p-5">
              <Icon className="mb-4 h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
            </div>
          );
        })}
      </section>

      <section className="surface rounded-md p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Browse by category</p>
            <h2 className="mt-2 text-xl font-semibold">Good starting points</h2>
          </div>
          <Link href="/" className="text-sm font-medium text-primary">
            View home directory
          </Link>
        </div>
        {featuredCategories.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCategories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="focus-ring rounded-md border border-border bg-background p-4 transition hover:border-primary">
                <div className="flex items-center gap-3">
                  <CategoryVisual category={category} size="sm" />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground tabular-nums">{category.toolCount} tools</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">No categories are available yet.</p>
        )}
      </section>

      <ToolsBrowser categories={categories} rankedTools={rankedTools} />
    </div>
  );
}
