"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";

type TrackableExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: AnalyticsEventName;
  eventPayload?: AnalyticsPayload;
};

export function TrackableExternalLink({ eventName, eventPayload, onClick, ...props }: TrackableExternalLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackEvent(eventName, eventPayload);
    onClick?.(event);
  }

  return <a {...props} onClick={handleClick} />;
}
