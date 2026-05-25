import { NewsletterCategoryLinks } from "@/components/newsletter/newsletter-category-links";
import { NewsletterToolLinks } from "@/components/newsletter/newsletter-tool-links";
import type { NewsletterSection as NewsletterSectionData } from "@/lib/newsletter/issues";
import type { Category, Tool } from "@/lib/types";

type NewsletterSectionProps = {
  section: NewsletterSectionData;
  issueSlug: string;
  sourceRoute: string;
  tools: Tool[];
  categories: Category[];
};

export function NewsletterSection({ section, issueSlug, sourceRoute, tools, categories }: NewsletterSectionProps) {
  return (
    <section className="surface rounded-md p-5">
      <h2 className="text-xl font-semibold">{section.heading}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.body}</p>
      {tools.length > 0 || categories.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <NewsletterToolLinks tools={tools} issueSlug={issueSlug} sourceRoute={sourceRoute} />
          <NewsletterCategoryLinks categories={categories} issueSlug={issueSlug} sourceRoute={sourceRoute} />
        </div>
      ) : null}
    </section>
  );
}
