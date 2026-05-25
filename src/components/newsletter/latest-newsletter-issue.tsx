import { ArrowRight, Newspaper } from "lucide-react";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { formatIssueDate, type NewsletterIssue } from "@/lib/newsletter/issues";

type LatestNewsletterIssueProps = {
  issue: NewsletterIssue | undefined;
};

export function LatestNewsletterIssue({ issue }: LatestNewsletterIssueProps) {
  if (!issue) {
    return null;
  }

  return (
    <section className="surface rounded-md p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
            <Newspaper className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Latest AI Brief</p>
            <h2 className="mt-2 text-xl font-semibold">{issue.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{issue.summary}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">{formatIssueDate(issue.issueDate)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <TrackableLink
            href={`/newsletter/${issue.slug}`}
            eventName="newsletter_issue_card_clicked"
            eventPayload={{ issue_slug: issue.slug, route: `/newsletter/${issue.slug}`, source_route: "/", cta_name: "home_latest_brief", destination_type: "internal" }}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Read brief
            <ArrowRight className="h-4 w-4" />
          </TrackableLink>
          <TrackableLink
            href="/newsletter"
            eventName="nav_link_clicked"
            eventPayload={{ route: "/newsletter", source_route: "/", cta_name: "home_view_all_briefs", destination_type: "internal" }}
            className="focus-ring inline-flex h-10 items-center rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary"
          >
            View all briefs
          </TrackableLink>
        </div>
      </div>
    </section>
  );
}
