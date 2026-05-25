export const analyticsEventNames = [
  "tool_card_clicked",
  "tool_detail_viewed",
  "tool_official_site_clicked",
  "tool_filter_changed",
  "tool_search_submitted",
  "tool_sort_changed",
  "category_opened",
  "category_tool_clicked",
  "compare_opened",
  "compare_cta_clicked",
  "breadcrumb_clicked",
  "nav_link_clicked",
  "empty_state_action_clicked",
  "external_link_clicked"
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsPayload = Partial<{
  tool_slug: string;
  category_slug: string;
  route: string;
  filter_name: string;
  filter_value: string;
  sort_key: string;
  cta_name: string;
  link_type: string;
  destination_type: string;
  result_count: number;
  source_route: string;
}>;

type PayloadField = keyof AnalyticsPayload;

const eventNameSet = new Set<string>(analyticsEventNames);
const allowedPayloadFields: PayloadField[] = [
  "tool_slug",
  "category_slug",
  "route",
  "filter_name",
  "filter_value",
  "sort_key",
  "cta_name",
  "link_type",
  "destination_type",
  "result_count",
  "source_route"
];
const routeFields = new Set<PayloadField>(["route", "source_route"]);
const slugFields = new Set<PayloadField>(["tool_slug", "category_slug"]);
const safeValuePattern = /[^a-zA-Z0-9 _./:#-]/g;

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return eventNameSet.has(value);
}

function sanitizeRoute(value: string) {
  const withoutQuery = value.split("?")[0]?.split("#")[0] ?? "";

  if (!withoutQuery) {
    return undefined;
  }

  if (withoutQuery.startsWith("/")) {
    return withoutQuery.slice(0, 120);
  }

  try {
    const url = new URL(value);
    return url.pathname.slice(0, 120);
  } catch {
    return undefined;
  }
}

function sanitizeSlug(value: string) {
  const clean = value.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean) ? clean : undefined;
}

function sanitizeLabel(value: string) {
  const clean = value.trim().replace(safeValuePattern, "").slice(0, 80);
  return clean || undefined;
}

export function sanitizeAnalyticsPayload(payload: Partial<Record<string, unknown>> = {}): AnalyticsPayload {
  const sanitized: AnalyticsPayload = {};

  for (const field of allowedPayloadFields) {
    const value = payload[field];

    if (field === "result_count") {
      if (typeof value === "number" && Number.isFinite(value)) {
        sanitized.result_count = Math.max(0, Math.round(value));
      }
      continue;
    }

    if (typeof value !== "string") {
      continue;
    }

    if (routeFields.has(field)) {
      const route = sanitizeRoute(value);
      if (route) {
        sanitized[field] = route;
      }
      continue;
    }

    if (slugFields.has(field)) {
      const slug = sanitizeSlug(value);
      if (slug) {
        sanitized[field] = slug;
      }
      continue;
    }

    const label = sanitizeLabel(value);
    if (label) {
      sanitized[field] = label;
    }
  }

  return sanitized;
}
