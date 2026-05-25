import { TrackableLink } from "@/components/analytics/trackable-link";
import { ToolIdentity } from "@/components/visual-identity";
import type { Tool } from "@/lib/types";

type NewsletterToolLinksProps = {
  tools: Tool[];
  issueSlug: string;
  sourceRoute: string;
};

export function NewsletterToolLinks({ tools, issueSlug, sourceRoute }: NewsletterToolLinksProps) {
  if (!tools.length) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {tools.map((tool) => (
        <TrackableLink
          key={tool.slug}
          href={`/tools/${tool.slug}`}
          eventName="newsletter_tool_link_clicked"
          eventPayload={{
            issue_slug: issueSlug,
            tool_slug: tool.slug,
            category_slug: tool.categorySlug,
            route: `/tools/${tool.slug}`,
            source_route: sourceRoute,
            destination_type: "internal"
          }}
          className="focus-ring rounded-md border border-border bg-background p-3 transition hover:border-primary"
        >
          <div className="flex items-center gap-3">
            <ToolIdentity tool={tool} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{tool.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{tool.subcategory}</p>
            </div>
          </div>
        </TrackableLink>
      ))}
    </div>
  );
}
