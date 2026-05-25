import { metricLabels } from "@/lib/scoring";
import { evidenceLabels, freshnessLabels } from "@/lib/status";
import type { Category, MetricKey, Tool } from "@/lib/types";

export type ToolDecisionContent = {
  quickVerdict: string;
  practicalUseCases: string[];
  keyStrengths: string[];
  limitations: string[];
  howToChoose: string[];
  pricingNote: string;
  dataPrivacyCaution: string;
};

export type TrustField = {
  label: string;
  value: string;
  href?: string;
  helper?: string;
};

export type CategoryDecisionContent = {
  intro: string;
  usefulFor: string[];
  commonUseCases: string[];
  howToChoose: string[];
};

export type CompareAttribute = {
  label: string;
  value: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric"
});

const metricCautionByKey: Record<MetricKey, string> = {
  capability: "Consider alternatives if your use case needs deeper specialist capability than this profile currently shows.",
  usability: "Consider alternatives if rollout speed, onboarding simplicity, or low-training adoption is the deciding factor.",
  reliability: "Consider alternatives for mission-critical or regulated workflows until reliability evidence is reviewed.",
  value: "Consider alternatives if budget control or lower-cost plans are more important than this tool's other strengths.",
  adoption: "Consider alternatives if broad ecosystem adoption, integrations, or peer validation are required."
};

export function formatListValue(values: string[], fallback = "Not available yet") {
  const cleanValues = values.map((value) => value.trim()).filter(Boolean);
  return cleanValues.length ? cleanValues.join(", ") : fallback;
}

export function formatCategoryLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

export function formatBooleanAsLabel(value: boolean | null | undefined, trueLabel: string, falseLabel: string, unknownLabel = "Not available yet") {
  if (typeof value !== "boolean") {
    return unknownLabel;
  }

  return value ? trueLabel : falseLabel;
}

export function formatDateLabel(value: string | null | undefined, fallback = "Not available yet") {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
}

export function getOfficialWebsiteHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Official website";
  }
}

export function getPricingTypeSummary(pricing: string) {
  const normalizedPricing = pricing.toLowerCase();

  if (!pricing.trim()) {
    return "No pricing note available yet";
  }

  if (normalizedPricing.includes("free")) {
    return "Free tier listed";
  }

  if (normalizedPricing.includes("enterprise")) {
    return "Enterprise plan listed";
  }

  if (normalizedPricing.includes("usage") || normalizedPricing.includes("api")) {
    return "Usage-based option listed";
  }

  if (normalizedPricing.includes("bundled")) {
    return "Bundled access listed";
  }

  return "Pricing listed";
}

function rankMetrics(tool: Pick<Tool, "metrics">) {
  return (Object.keys(metricLabels) as MetricKey[])
    .map((key) => ({ key, label: metricLabels[key], score: tool.metrics[key] }))
    .sort((a, b) => b.score - a.score);
}

function getLatestToolDate(tool: Pick<Tool, "lastVerifiedAt" | "observations" | "scoreSnapshots">) {
  const dates = [
    tool.lastVerifiedAt,
    ...tool.observations.map((observation) => observation.observedAt),
    ...tool.scoreSnapshots.map((snapshot) => snapshot.snapshotDate || snapshot.capturedAt)
  ]
    .map((value) => (value ? new Date(value) : null))
    .filter((date): date is Date => date instanceof Date && !Number.isNaN(date.getTime()));

  if (!dates.length) {
    return null;
  }

  return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString();
}

function getEvidenceCaution(tool: Pick<Tool, "freshnessStatus" | "evidenceStatus">) {
  const freshness = freshnessLabels[tool.freshnessStatus].toLowerCase();
  const evidence = evidenceLabels[tool.evidenceStatus].toLowerCase();

  if (tool.freshnessStatus === "current" && tool.evidenceStatus === "source_verified") {
    return "Source and freshness labels are positive in this dataset, but the source breakdown should still be reviewed before procurement.";
  }

  return `This profile is marked ${freshness} and ${evidence}; use it as shortlist context until the underlying evidence is reviewed.`;
}

export function getToolDecisionSections(tool: Tool, category?: Category): ToolDecisionContent {
  const categoryName = category?.name ?? formatCategoryLabel(tool.categorySlug);
  const metrics = rankMetrics(tool);
  const strongestMetrics = metrics.slice(0, 2);
  const weakestMetric = metrics.at(-1);
  const sourceCount = tool.observations.length;
  const dataPrivacyCaution =
    "No specific data caution has been added yet. Review the official privacy and data-processing terms before sending sensitive or regulated data.";

  return {
    quickVerdict: `Good fit for: ${tool.bestFor || tool.summary || `${tool.subcategory} workflows in ${categoryName}`}.`,
    practicalUseCases: [
      tool.bestFor,
      tool.summary,
      `May be useful for ${tool.subcategory.toLowerCase()} evaluation inside the ${categoryName} category.`,
      `Compare against nearby ${categoryName} alternatives before committing to a workflow.`
    ].filter(Boolean),
    keyStrengths: [
      ...strongestMetrics.map((metric) => `${metric.label}: ${metric.score}% structured signal.`),
      sourceCount
        ? `${sourceCount} source observation${sourceCount === 1 ? "" : "s"} available for evidence inspection.`
        : "No source observations have been added yet.",
      `${evidenceLabels[tool.evidenceStatus]} evidence status and ${freshnessLabels[tool.freshnessStatus].toLowerCase()} freshness label.`
    ],
    limitations: [
      weakestMetric ? `${metricCautionByKey[weakestMetric.key]} ${weakestMetric.label} is the lowest structured metric at ${weakestMetric.score}%.` : "",
      getEvidenceCaution(tool),
      dataPrivacyCaution
    ].filter(Boolean),
    howToChoose: [
      "Start with the fit statement and practical use cases, not the score alone.",
      `Compare ${tool.name} with category alternatives on pricing, evidence status, freshness, and score breakdown.`,
      "Open the source breakdown to inspect observed dates, confidence, source weight, evidence URL, and notes.",
      "Check current pricing and privacy terms on the official website before buying or sharing sensitive data."
    ],
    pricingNote: tool.pricing ? `${tool.pricing}. Check current pricing on the official site before buying.` : "No pricing note available yet.",
    dataPrivacyCaution
  };
}

export function getToolTrustFields(tool: Tool, category?: Category): TrustField[] {
  const latestDate = getLatestToolDate(tool);

  return [
    {
      label: "Official website",
      value: getOfficialWebsiteHost(tool.website),
      href: tool.website || undefined
    },
    {
      label: "Category",
      value: category?.name ?? formatCategoryLabel(tool.categorySlug)
    },
    {
      label: "Pricing",
      value: tool.pricing || "No pricing note available yet",
      helper: tool.pricing ? "Check current pricing on the official site." : undefined
    },
    {
      label: "Last updated",
      value: formatDateLabel(latestDate, "No verified or observed date available yet")
    },
    {
      label: "Evidence",
      value: evidenceLabels[tool.evidenceStatus]
    },
    {
      label: "Freshness",
      value: freshnessLabels[tool.freshnessStatus]
    },
    {
      label: "Source note",
      value: tool.observations.length ? `${tool.observations.length} source signal${tool.observations.length === 1 ? "" : "s"} attached.` : "No source observations added yet."
    },
    {
      label: "Data & privacy",
      value: "No specific data caution has been added yet.",
      helper: "Review official privacy and data-processing terms before sending sensitive data."
    }
  ];
}

export function getCategoryDecisionContent(category: Category): CategoryDecisionContent {
  const categoryName = category.name;
  const subcategoryList = formatListValue(category.subcategories);

  return {
    intro: category.description || `Use this category to compare AI tools for ${categoryName.toLowerCase()} workflows.`,
    usefulFor: [
      category.signal,
      `Shortlisting ${categoryName} tools by fit, pricing, freshness, and evidence quality.`,
      `Comparing tools across ${subcategoryList}.`
    ].filter(Boolean),
    commonUseCases: category.subcategories.length
      ? category.subcategories.map((subcategory) => `${subcategory} evaluation and vendor shortlisting.`)
      : [`Comparing ${categoryName.toLowerCase()} tools before selecting a workflow.`],
    howToChoose: [
      "Start with the stated fit and use case rather than the rank alone.",
      "Inspect freshness and evidence badges before treating a ranking as current market consensus.",
      "Compare pricing notes, source confidence, and score breakdowns for shortlisted tools.",
      category.benchmark ? `Use the category benchmark emphasis as a review lens: ${category.benchmark}` : "Review source observations before committing."
    ]
  };
}

export function getCompareAttributes(tool: Tool, categories: Category[]): CompareAttribute[] {
  const category = categories.find((item) => item.slug === tool.categorySlug);

  return [
    { label: "Category", value: category?.name ?? formatCategoryLabel(tool.categorySlug) },
    { label: "Use case", value: tool.subcategory || "Not available yet" },
    { label: "Best for", value: tool.bestFor || "Not available yet" },
    { label: "Pricing", value: tool.pricing || "No pricing note available yet" },
    { label: "Evidence", value: evidenceLabels[tool.evidenceStatus] },
    { label: "Freshness", value: freshnessLabels[tool.freshnessStatus] },
    { label: "Source signals", value: tool.observations.length ? String(tool.observations.length) : "No source observations added yet" },
    { label: "Data caution", value: "No specific data caution has been added yet." }
  ];
}
