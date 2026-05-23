import { evidenceLabels, freshnessLabels } from "@/lib/status";
import type { Category, EvidenceStatus, FreshnessStatus, Tool } from "@/lib/types";

export type RankedTool = Tool & { score: number };

export type PricingType = "free_freemium" | "paid" | "enterprise" | "open_source" | "usage_based" | "other";

export type ToolSort = "score_desc" | "evidence_quality" | "last_verified" | "best_value" | "name_asc";

export type ScoreRange = "all" | "90_100" | "80_89" | "70_79" | "under_70";

export const pricingTypeLabels: Record<PricingType, string> = {
  free_freemium: "Free / freemium",
  paid: "Paid plans",
  enterprise: "Enterprise",
  open_source: "Open source",
  usage_based: "Usage based",
  other: "Other"
};

export const sortLabels: Record<ToolSort, string> = {
  score_desc: "Plebi Score high to low",
  evidence_quality: "Evidence quality",
  last_verified: "Last verified",
  best_value: "Best value",
  name_asc: "Name A-Z"
};

export const scoreRangeLabels: Record<ScoreRange, string> = {
  all: "All scores",
  "90_100": "90-100",
  "80_89": "80-89",
  "70_79": "70-79",
  under_70: "Under 70"
};

const evidenceQualityRank: Record<EvidenceStatus, number> = {
  source_verified: 4,
  partially_verified: 3,
  manual_seed: 2,
  insufficient_evidence: 1
};

export function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export function getCategoryName(tool: Pick<Tool, "categorySlug">, categories: Category[]) {
  return categories.find((category) => category.slug === tool.categorySlug)?.name ?? tool.categorySlug;
}

export function getPricingType(pricing: string): PricingType {
  const normalized = pricing.toLowerCase();

  if (normalized.includes("open") || normalized.includes("model")) {
    return "open_source";
  }

  if (normalized.includes("free")) {
    return "free_freemium";
  }

  if (normalized.includes("api") || normalized.includes("usage") || normalized.includes("credit")) {
    return "usage_based";
  }

  if (
    normalized.includes("enterprise") &&
    !/(pro|team|starter|business|plus|basic|creator|standard|individual|premium|professional|paid)/i.test(pricing)
  ) {
    return "enterprise";
  }

  if (
    normalized.includes("pro") ||
    normalized.includes("premium") ||
    normalized.includes("team") ||
    normalized.includes("paid") ||
    normalized.includes("starter") ||
    normalized.includes("business") ||
    normalized.includes("enterprise")
  ) {
    return "paid";
  }

  return "other";
}

export function getToolSearchText(tool: Tool, categoryName = "") {
  return [
    tool.name,
    categoryName,
    tool.categorySlug,
    tool.subcategory,
    tool.bestFor,
    tool.pricing,
    tool.summary,
    tool.freshnessStatus,
    freshnessLabels[tool.freshnessStatus],
    tool.evidenceStatus,
    evidenceLabels[tool.evidenceStatus]
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesToolSearch(tool: Tool, query: string, categoryName = "") {
  const normalizedQuery = normalizeQuery(query);
  return !normalizedQuery || getToolSearchText(tool, categoryName).includes(normalizedQuery);
}

export function getEvidenceQualityScore(tool: Tool) {
  const confidence = tool.observations.length
    ? tool.observations.reduce((total, observation) => total + observation.confidence, 0) / tool.observations.length
    : 0;
  const sourceDepth = Math.min(tool.observations.length, 6) / 6;

  return evidenceQualityRank[tool.evidenceStatus] * 100 + confidence * 50 + sourceDepth * 25;
}

export function getLastVerifiedValue(tool: Pick<Tool, "lastVerifiedAt">) {
  return tool.lastVerifiedAt ? new Date(`${tool.lastVerifiedAt}T00:00:00`).getTime() : 0;
}

export function matchesScoreRange(score: number, range: ScoreRange) {
  switch (range) {
    case "90_100":
      return score >= 90;
    case "80_89":
      return score >= 80 && score < 90;
    case "70_79":
      return score >= 70 && score < 80;
    case "under_70":
      return score < 70;
    case "all":
    default:
      return true;
  }
}

export function sortRankedTools(tools: RankedTool[], sort: ToolSort) {
  return tools.slice().sort((a, b) => {
    switch (sort) {
      case "evidence_quality":
        return getEvidenceQualityScore(b) - getEvidenceQualityScore(a) || b.score - a.score;
      case "last_verified":
        return getLastVerifiedValue(b) - getLastVerifiedValue(a) || b.score - a.score;
      case "best_value":
        return b.metrics.value - a.metrics.value || b.score - a.score;
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "score_desc":
      default:
        return b.score - a.score;
    }
  });
}

export function getAvailablePricingTypes(tools: Tool[]) {
  return Array.from(new Set(tools.map((tool) => getPricingType(tool.pricing))));
}

export function getAvailableSubcategories(tools: Tool[]) {
  return Array.from(new Set(tools.map((tool) => tool.subcategory))).sort((a, b) => a.localeCompare(b));
}

export const freshnessFilterOptions: Array<{ value: FreshnessStatus; label: string }> = [
  { value: "current", label: freshnessLabels.current },
  { value: "needs_review", label: freshnessLabels.needs_review },
  { value: "stale", label: freshnessLabels.stale },
  { value: "seed_only", label: freshnessLabels.seed_only }
];

export const evidenceFilterOptions: Array<{ value: EvidenceStatus; label: string }> = [
  { value: "source_verified", label: evidenceLabels.source_verified },
  { value: "partially_verified", label: evidenceLabels.partially_verified },
  { value: "manual_seed", label: evidenceLabels.manual_seed },
  { value: "insufficient_evidence", label: evidenceLabels.insufficient_evidence }
];

export const scoreRangeOptions: Array<{ value: ScoreRange; label: string }> = [
  { value: "all", label: scoreRangeLabels.all },
  { value: "90_100", label: scoreRangeLabels["90_100"] },
  { value: "80_89", label: scoreRangeLabels["80_89"] },
  { value: "70_79", label: scoreRangeLabels["70_79"] },
  { value: "under_70", label: scoreRangeLabels.under_70 }
];

export const sortOptions: Array<{ value: ToolSort; label: string }> = [
  { value: "score_desc", label: sortLabels.score_desc },
  { value: "evidence_quality", label: sortLabels.evidence_quality },
  { value: "last_verified", label: sortLabels.last_verified },
  { value: "best_value", label: sortLabels.best_value },
  { value: "name_asc", label: sortLabels.name_asc }
];
