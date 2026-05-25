import { ArrowRight, GitCompareArrows } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalyticsPageEvent } from "@/components/analytics/analytics-page-event";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { NewsletterCategoryLinks } from "@/components/newsletter/newsletter-category-links";
import { NewsletterSection } from "@/components/newsletter/newsletter-section";
import { NewsletterSignupPlaceholder } from "@/components/newsletter/newsletter-signup-placeholder";
import { NewsletterToolLinks } from "@/components/newsletter/newsletter-tool-links";
import { formatIssueDate, getNewsletterIssueBySlug, getPublishedNewsletterIssues } from "@/lib/newsletter/issues";
import { getCategories, getTools } from "@/lib/repository";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbListJsonLd, createNewsletterArticleJsonLd } from "@/lib/seo/structured-data";
import type { Category, Tool } from "@/lib/types";

type NewsletterIssuePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return getPublishedNewsletterIssues().map((issue) => ({ slug: issue.slug }));
}

export async function generateMetadata({ params }: NewsletterIssuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const issue = getNewsletterIssueBySlug(slug);

  if (!issue) {
    return createPageMetadata({
      title: "Newsletter issue not found",
      description: "This Plebi AI Brief issue could not be found.",
      path: `/newsletter/${slug}`,
      noIndex: true
    });
  }

  return createPageMetadata({
    title: issue.title,
    description: issue.summary,
    path: `/newsletter/${issue.slug}`,
    type: "article"
  });
}

function bySlug<T extends { slug: string }>(items: T[]) {
  return new Map(items.map((item) => [item.slug, item]));
}

function resolveBySlug<T extends { slug: string }>(slugs: string[] | undefined, records: Map<string, T>) {
  return (slugs ?? []).map((slug) => records.get(slug)).filter((record): record is T => Boolean(record));
}

export default async function NewsletterIssuePage({ params }: NewsletterIssuePageProps) {
  const { slug } = await params;
  const issue = getNewsletterIssueBySlug(slug);

  if (!issue) {
    notFound();
  }

  const [tools, categories] = await Promise.all([getTools(), getCategories()]);
  const toolsBySlug = bySlug<Tool>(tools);
  const categoriesBySlug = bySlug<Category>(categories);
  const featuredTools = resolveBySlug(issue.featuredToolSlugs, toolsBySlug);
  const featuredCategories = resolveBySlug(issue.featuredCategorySlugs, categoriesBySlug);
  const sourceRoute = `/newsletter/${issue.slug}`;

  return (
    <div className="space-y-7">
      <JsonLd
        data={[
          createBreadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Plebi AI Brief", path: "/newsletter" },
            { name: issue.title, path: sourceRoute }
          ]),
          createNewsletterArticleJsonLd(issue)
        ]}
      />
      <AnalyticsPageEvent eventName="newsletter_issue_viewed" payload={{ issue_slug: issue.slug, route: sourceRoute }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Plebi AI Brief", href: "/newsletter" }, { label: issue.title }]} />

      <section className="surface rounded-md p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="text-sm font-medium text-primary">Plebi AI Brief</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{issue.title}</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{issue.subtitle}</p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{issue.intro}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{formatIssueDate(issue.issueDate)}</span>
              <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{featuredTools.length} linked tools</span>
              <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">{featuredCategories.length} categories</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackableLink
                href="/tools"
                eventName="nav_link_clicked"
                eventPayload={{ issue_slug: issue.slug, cta_name: "issue_browse_tools", route: "/tools", source_route: sourceRoute, destination_type: "internal" }}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Browse tools
                <ArrowRight className="h-4 w-4" />
              </TrackableLink>
              <TrackableLink
                href="/compare"
                eventName="compare_cta_clicked"
                eventPayload={{ issue_slug: issue.slug, cta_name: "issue_compare_tools", route: "/compare", source_route: sourceRoute, destination_type: "internal" }}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary"
              >
                <GitCompareArrows className="h-4 w-4" />
                Compare tools
              </TrackableLink>
              <TrackableLink
                href="/signals"
                eventName="nav_link_clicked"
                eventPayload={{ issue_slug: issue.slug, cta_name: "issue_browse_signals", route: "/signals", source_route: sourceRoute, destination_type: "internal" }}
                className="focus-ring inline-flex h-10 items-center rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary"
              >
                Browse latest AI signals
              </TrackableLink>
            </div>
          </div>
          <aside className="rounded-md border border-border bg-background p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Executive summary</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {issue.executiveSummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {issue.sections.map((section) => (
            <NewsletterSection
              key={section.heading}
              section={section}
              issueSlug={issue.slug}
              sourceRoute={sourceRoute}
              tools={resolveBySlug(section.toolSlugs, toolsBySlug)}
              categories={resolveBySlug(section.categorySlugs, categoriesBySlug)}
            />
          ))}
        </div>

        <aside className="space-y-4">
          <section className="surface rounded-md p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Linked tools</p>
            <h2 className="mt-2 text-xl font-semibold">Tools in this brief</h2>
            <div className="mt-4">
              <NewsletterToolLinks tools={featuredTools} issueSlug={issue.slug} sourceRoute={sourceRoute} />
            </div>
          </section>
          <section className="surface rounded-md p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Related categories</p>
            <h2 className="mt-2 text-xl font-semibold">Browse the context</h2>
            <div className="mt-4">
              <NewsletterCategoryLinks categories={featuredCategories} issueSlug={issue.slug} sourceRoute={sourceRoute} />
            </div>
          </section>
          <NewsletterSignupPlaceholder sourceRoute={sourceRoute} />
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Practical recommendations", items: issue.recommendations },
          { label: "What to try from this issue", items: issue.whatToTry },
          { label: "What to watch", items: issue.whatToWatch },
          { label: "Hype check", items: issue.hypeCheck }
        ].map((group) => (
          <div key={group.label} className="surface rounded-md p-5">
            <h2 className="text-base font-semibold">{group.label}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="surface rounded-md p-5">
        <p className="text-xs font-medium uppercase text-muted-foreground">Source / curation note</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{issue.curationNote}</p>
      </section>
    </div>
  );
}
