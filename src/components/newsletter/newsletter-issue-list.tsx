import { NewsletterIssueCard } from "@/components/newsletter/newsletter-issue-card";
import type { NewsletterIssue } from "@/lib/newsletter/issues";

type NewsletterIssueListProps = {
  issues: NewsletterIssue[];
  sourceRoute: string;
};

export function NewsletterIssueList({ issues, sourceRoute }: NewsletterIssueListProps) {
  if (!issues.length) {
    return (
      <div className="surface rounded-md p-8 text-sm leading-6 text-muted-foreground">
        No published AI Brief issues are available yet. New editorial briefs will appear here once they are curated.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {issues.map((issue) => (
        <NewsletterIssueCard key={issue.slug} issue={issue} sourceRoute={sourceRoute} />
      ))}
    </div>
  );
}
