import { metricLabels } from "@/lib/scoring";
import { evidenceLabels, freshnessLabels } from "@/lib/status";
import type { Category, MetricKey, Tool } from "@/lib/types";

export type DecisionSummary = {
  mainStrength: string;
  mainCaution: string;
  notIdealFor: string[];
};

function rankMetrics(tool: Pick<Tool, "metrics">) {
  return (Object.keys(metricLabels) as MetricKey[])
    .map((key) => ({ key, label: metricLabels[key], score: tool.metrics[key] }))
    .sort((a, b) => b.score - a.score);
}

export function getDecisionSummary(tool: Tool, category?: Category): DecisionSummary {
  const metrics = rankMetrics(tool);
  const strongestMetric = metrics[0];
  const weakestMetric = metrics.at(-1);
  const categoryContext = category?.name ?? tool.categorySlug;
  const verificationCaution =
    tool.freshnessStatus !== "current" || tool.evidenceStatus !== "source_verified"
      ? `This profile is marked ${freshnessLabels[tool.freshnessStatus].toLowerCase()} and ${evidenceLabels[
          tool.evidenceStatus
        ].toLowerCase()}, so verify the latest product fit before treating it as market consensus.`
      : "";
  const metricCaution = weakestMetric
    ? `${weakestMetric.label} is the lowest structured metric in this profile at ${weakestMetric.score}%.`
    : "Review the source breakdown before making a final decision.";
  const notIdealFor = [
    verificationCaution ? "Teams that need fully current, source-verified market consensus before shortlisting." : "",
    `Workflows outside ${categoryContext} or ${tool.subcategory} evaluation contexts.`,
    weakestMetric ? `Buyers optimizing primarily for ${weakestMetric.label.toLowerCase()} without comparing alternatives.` : ""
  ].filter(Boolean);

  return {
    mainStrength: strongestMetric
      ? `${strongestMetric.label} is the strongest structured signal at ${strongestMetric.score}%.`
      : "Structured metric strength is not available yet.",
    mainCaution: verificationCaution || metricCaution,
    notIdealFor
  };
}

export function shouldShowEvidenceCallout(tool: Pick<Tool, "freshnessStatus" | "evidenceStatus">) {
  return tool.freshnessStatus !== "current" || tool.evidenceStatus === "manual_seed" || tool.evidenceStatus === "insufficient_evidence";
}
