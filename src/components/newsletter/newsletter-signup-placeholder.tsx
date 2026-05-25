"use client";

import { Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics/track";

type NewsletterSignupPlaceholderProps = {
  sourceRoute: string;
};

export function NewsletterSignupPlaceholder({ sourceRoute }: NewsletterSignupPlaceholderProps) {
  function handleClick() {
    trackEvent("newsletter_signup_placeholder_clicked", {
      route: sourceRoute,
      source_route: sourceRoute,
      cta_name: "newsletter_signup_placeholder",
      destination_type: "none"
    });
  }

  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-primary">
          <Mail className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Email brief coming later</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            The archive is public now. Email delivery is intentionally not connected in this phase, so no address is collected here.
          </p>
          <button
            type="button"
            onClick={handleClick}
            className="focus-ring mt-3 inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary"
          >
            Note interest
          </button>
        </div>
      </div>
    </div>
  );
}
