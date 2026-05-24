"use client";

import { useEffect } from "react";
import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";

type AnalyticsPageEventProps = {
  eventName: AnalyticsEventName;
  payload?: AnalyticsPayload;
};

export function AnalyticsPageEvent({ eventName, payload }: AnalyticsPageEventProps) {
  useEffect(() => {
    trackEvent(eventName, payload);
  }, [eventName, payload]);

  return null;
}
