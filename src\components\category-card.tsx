import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Category, Tool } from "@/lib/types";

type CategoryCardProps = Category & {
  toolCount: number;
  topTool?: Tool;
  topScore: number;
};

export function CategoryCard({ slug, name, description, subcategories, signal, toolCount, topTool, topScore }: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} className="surface group flex h-full flex-col rounded-md p-5 transition hover:border-primary">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
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
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Tracked tools</p>
            <p className="font-mono text-xl font-semibold tabular-nums">{toolCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Leader</p>
            <p className="truncate text-sm font-medium">{topTool?.name ?? "Pending"}</p>
            <p className="font-mono text-xs text-primary">{topScore}%</p>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{signal}</p>
      </div>
    </Link>
  );
}
