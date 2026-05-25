import { BarChart3, Database, GitCompareArrows, Layers3, Newspaper, Search } from "lucide-react";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { href: "/", label: "Home", icon: Database },
  { href: "/tools", label: "Tools", icon: Search },
  { href: "/#categories", label: "Categories", icon: Layers3 },
  { href: "/newsletter", label: "Brief", icon: Newspaper },
  { href: "/compare", label: "Compare", icon: GitCompareArrows }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <TrackableLink
          href="/"
          eventName="nav_link_clicked"
          eventPayload={{ cta_name: "brand", route: "/", link_type: "primary_nav", destination_type: "internal" }}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-semibold leading-tight">Plebi</span>
            <span className="block text-xs text-muted-foreground">AI tools intelligence</span>
          </span>
        </TrackableLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <TrackableLink
                key={item.href}
                href={item.href}
                eventName="nav_link_clicked"
                eventPayload={{ cta_name: item.label, route: item.href, link_type: "primary_nav", destination_type: "internal" }}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </TrackableLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <TrackableLink
            href="/compare"
            eventName="compare_cta_clicked"
            eventPayload={{ cta_name: "header_compare_tools", route: "/compare", source_route: "header", destination_type: "internal" }}
            className="focus-ring hidden h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:inline-flex"
          >
            Compare tools
          </TrackableLink>
          <ThemeToggle />
        </div>
      </div>
      <nav className="overflow-x-auto border-t border-border px-4 py-2 sm:px-6 md:hidden" aria-label="Primary">
        <div className="mx-auto flex max-w-7xl gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <TrackableLink
                key={item.href}
                href={item.href}
                eventName="nav_link_clicked"
                eventPayload={{ cta_name: item.label, route: item.href, link_type: "mobile_nav", destination_type: "internal" }}
                className="focus-ring inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </TrackableLink>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
