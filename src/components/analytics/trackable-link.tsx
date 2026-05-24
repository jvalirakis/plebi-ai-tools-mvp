"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";

type TrackableLinkProps = ComponentProps<typeof Link> & {
  eventName: AnalyticsEventName;
  eventPayload?: AnalyticsPayload;
};

export function TrackableLink({ eventName, eventPayload, onClick, ...props }: TrackableLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackEvent(eventName, eventPayload);
    onClick?.(event);
  }

  return <Link {...props} onClick={handleClick} />;
}
