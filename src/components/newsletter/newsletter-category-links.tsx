import { TrackableLink } from "@/components/analytics/trackable-link";
import { CategoryVisual } from "@/components/visual-identity";
import type { Category } from "@/lib/types";

type NewsletterCategoryLinksProps = {
  categories: Category[];
  issueSlug: string;
  sourceRoute: string;
};

export function NewsletterCategoryLinks({ categories, issueSlug, sourceRoute }: NewsletterCategoryLinksProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {categories.map((category) => (
        <TrackableLink
          key={category.slug}
          href={`/categories/${category.slug}`}
          eventName="newsletter_category_link_clicked"
          eventPayload={{
            issue_slug: issueSlug,
            category_slug: category.slug,
            route: `/categories/${category.slug}`,
            source_route: sourceRoute,
            destination_type: "internal"
          }}
          className="focus-ring rounded-md border border-border bg-background p-3 transition hover:border-primary"
        >
          <div className="flex items-center gap-3">
            <CategoryVisual category={category} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{category.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{category.subcategories[0] ?? "AI tools"}</p>
            </div>
          </div>
        </TrackableLink>
      ))}
    </div>
  );
}
