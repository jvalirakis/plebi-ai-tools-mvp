import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CategoryVisual, ToolIdentity } from "@/components/visual-identity";
import type { Category, Tool } from "@/lib/types";

type CategoryCardProps = Category & {
  toolCount: number;
  topTool?: Tool;
  topScore: number;
};

export function CategoryCard({ slug, name, description, subcategories, signal, toolCount, topTool, topScore }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="surface group flex h-full flex-col rounded-md p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <CategoryVisual category={{ slug, name }} size="sm" />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <div className="mt-auto space-y-4">
        <div className="flex flex-wrap gap-2">
          {subcategories.slice(0, 3).map((subcategory) => (
            <span key={subcategory} className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">
              {subcategory}
            </span>
          ))}
        </div>
        <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-md bg-background/60 px-3 py-2">
            <p className="text-xs text-muted-foreground">Tracked tools</p>
            <p className="font-mono text-xl font-semibold tabular-nums">{toolCount}</p>
          </div>
          <div className="min-w-0 rounded-md border border-border bg-background px-3 py-2 transition group-hover:border-primary/30">
            <p className="text-xs text-muted-foreground">Leader</p>
            {topTool ? (
              <div className="mt-2 flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <ToolIdentity tool={topTool} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{topTool.name}</p>
                    <p className="text-xs text-muted-foreground">{topTool.subcategory}</p>
                  </div>
                </div>
                <p className="shrink-0 font-mono text-sm font-semibold tabular-nums text-primary">{topScore}%</p>
              </div>
            ) : (
              <p className="mt-1 text-sm font-medium">Pending</p>
            )}
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{signal}</p>
      </div>
    </Link>
  );
}
