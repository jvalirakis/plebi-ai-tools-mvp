import { isAnalyticsEventName, sanitizeAnalyticsPayload, type AnalyticsEventName, type AnalyticsPayload } from "@/lib/analytics/events";

type AnalyticsAdapter = {
  track: (eventName: AnalyticsEventName, payload: AnalyticsPayload) => void;
};

declare global {
  interface Window {
    plebiAnalytics?: AnalyticsAdapter;
  }
}

export function trackEvent(eventName: AnalyticsEventName, payload?: AnalyticsPayload) {
  if (!isAnalyticsEventName(eventName) || typeof window === "undefined") {
    return;
  }

  const sanitizedPayload = sanitizeAnalyticsPayload(payload);

  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") {
    console.info("[Plebi analytics]", eventName, sanitizedPayload);
  }

  window.plebiAnalytics?.track(eventName, sanitizedPayload);
}
