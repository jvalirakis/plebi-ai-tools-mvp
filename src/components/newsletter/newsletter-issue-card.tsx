import { ArrowUpRight, CalendarDays } from "lucide-react";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { formatIssueDate, type NewsletterIssue } from "@/lib/newsletter/issues";

type NewsletterIssueCardProps = {
  issue: NewsletterIssue;
  sourceRoute: string;
  compact?: boolean;
};

export function NewsletterIssueCard({ issue, sourceRoute, compact = false }: NewsletterIssueCardProps) {
  return (
    <article className="surface rounded-md p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-lg hover:shadow-black/5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="chip inline-flex items-center gap-1 rounded-md px-2 py-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatIssueDate(issue.issueDate)}
        </span>
        <span className="chip rounded-md px-2 py-1">Editorial brief</span>
      </div>
      <TrackableLink
        href={`/newsletter/${issue.slug}`}
        eventName="newsletter_issue_card_clicked"
        eventPayload={{
          issue_slug: issue.slug,
          route: `/newsletter/${issue.slug}`,
          source_route: sourceRoute,
          destination_type: "internal"
        }}
        className="group inline-flex items-start gap-2"
      >
        <h3 className={`${compact ? "text-lg" : "text-xl"} font-semibold`}>{issue.title}</h3>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
      </TrackableLink>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{issue.subtitle}</p>
      {!compact ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{issue.summary}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="chip rounded-md px-2 py-1">{issue.featuredToolSlugs.length} linked tools</span>
        <span className="chip rounded-md px-2 py-1">{issue.featuredCategorySlugs.length} categories</span>
      </div>
    </article>
  );
}
