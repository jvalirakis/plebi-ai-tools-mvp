import { ChevronRight } from "lucide-react";
import { TrackableLink } from "@/components/analytics/trackable-link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length < 2) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="overflow-hidden text-xs text-muted-foreground">
      <ol className="flex min-w-0 flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const labelClassName = "inline-flex max-w-[14rem] truncate rounded-md px-2 py-1 sm:max-w-[18rem]";

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {isCurrent || !item.href ? (
                <span aria-current={isCurrent ? "page" : undefined} className={`${labelClassName} text-foreground`}>
                  {item.label}
                </span>
              ) : (
                <TrackableLink
                  href={item.href}
                  eventName="breadcrumb_clicked"
                  eventPayload={{ cta_name: item.label, route: item.href, link_type: "breadcrumb", destination_type: "internal" }}
                  className={`${labelClassName} transition hover:bg-muted hover:text-foreground`}
                >
                  {item.label}
                </TrackableLink>
              )}
              {!isCurrent ? <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
