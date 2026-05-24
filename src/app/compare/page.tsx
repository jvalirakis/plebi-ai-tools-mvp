import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CompareWorkbench } from "@/components/compare-workbench";
import { getCategories, getTools } from "@/lib/repository";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Compare AI Tools",
  description: "Compare AI tools side by side across Plebi Score inputs, pricing, fit, freshness and source-backed confidence.",
  path: "/compare"
});

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const [categories, tools] = await Promise.all([getCategories(), getTools()]);

  return (
    <div className="space-y-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
      <section className="surface rounded-md p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Decision workbench</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Compare AI Tools</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Evaluate leaders side by side across Plebi Score inputs, pricing, fit, and source-backed confidence.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Start from a category shortlist or the full tools directory, then compare up to four options before deciding what to trial.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/tools"
                className="focus-ring inline-flex h-10 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Browse all tools
              </Link>
              <Link
                href="/#categories"
                className="focus-ring inline-flex h-10 items-center rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary"
              >
                Explore categories
              </Link>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">Available tools</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{tools.length}</p>
          </div>
        </div>
      </section>
      <CompareWorkbench categories={categories} tools={tools} />
    </div>
  );
}
