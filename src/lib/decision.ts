import { metricLabels } from "@/lib/scoring";
import { evidenceLabels, freshnessLabels } from "@/lib/status";
import type { Category, MetricKey, Tool } from "@/lib/types";

export type DecisionSummary = {
  mainStrength: string;
  mainCaution: string;
  notIdealFor: string[];
};

export type EvidenceCallout = {
  title: string;
  copy: string;
};

const metricCautionByKey: Record<MetricKey, string> = {
  capability: "Teams that need the deepest specialist capability should compare it against category alternatives before committing.",
  usability: "Teams that need very low-training onboarding or simple rollout from day one should validate the workflow fit first.",
  reliability: "Mission-critical, regulated, or high-volume workflows should review reliability evidence before using this rank as a deciding signal.",
  value: "Budget-sensitive teams should compare pricing and value signals against lower-cost alternatives in the category.",
  adoption: "Teams that require broad ecosystem adoption, integrations, or peer validation should inspect the source breakdown first."
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
  const hasLimitedEvidence =
    tool.freshnessStatus === "seed_only" ||
    tool.freshnessStatus === "needs_review" ||
    tool.freshnessStatus === "stale" ||
    tool.evidenceStatus === "manual_seed" ||
    tool.evidenceStatus === "insufficient_evidence";
  const verificationCaution =
    hasLimitedEvidence
      ? `This profile is marked ${freshnessLabels[tool.freshnessStatus].toLowerCase()} and ${evidenceLabels[
          tool.evidenceStatus
        ].toLowerCase()}; use it as shortlist context until fresher source evidence is reviewed.`
      : "";
  const metricCaution = weakestMetric
    ? `${metricCautionByKey[weakestMetric.key]} ${weakestMetric.label} is the lowest structured metric here at ${weakestMetric.score}%.`
    : "Review the source breakdown before making a final decision.";
  const notIdealFor = [
    hasLimitedEvidence ? "Final vendor selection where current, independently verified evidence is required before procurement." : "",
    weakestMetric ? metricCautionByKey[weakestMetric.key] : "",
    `Use cases outside ${categoryContext} or ${tool.subcategory}, where different evaluation criteria may matter more.`
  ].filter(Boolean);

  return {
    mainStrength: strongestMetric
      ? `${strongestMetric.label} is the strongest structured signal at ${strongestMetric.score}%.`
      : "Structured metric strength is not available yet.",
    mainCaution: verificationCaution || metricCaution,
    notIdealFor
  };
}

export function getEvidenceCallout(tool: Pick<Tool, "freshnessStatus" | "evidenceStatus">): EvidenceCallout {
  const freshness = freshnessLabels[tool.freshnessStatus].toLowerCase();
  const evidence = evidenceLabels[tool.evidenceStatus].toLowerCase();

  if (tool.freshnessStatus === "seed_only" || tool.evidenceStatus === "manual_seed") {
    return {
      title: "Seed-only profile",
      copy: `This profile is marked ${freshness} and ${evidence}. Treat the rank as directional until source observations are reviewed.`
    };
  }

  if (tool.evidenceStatus === "partially_verified") {
    return {
      title: "Partially verified profile",
      copy: `Some evidence supports this profile, but it is still ${evidence}. Review the strongest sources and confidence levels before deciding.`
    };
  }

  if (tool.evidenceStatus === "source_verified") {
    return {
      title: "Source verified profile",
      copy:
        tool.freshnessStatus === "current"
          ? `This profile is marked ${freshness} and ${evidence} in the current dataset. Source details remain available below for inspection.`
          : `Source evidence is marked verified, but freshness is ${freshness}. Check observed dates before treating this as current market consensus.`
    };
  }

  return {
    title: "Needs source verification",
    copy: `This profile is marked ${freshness} with ${evidence}. Check the source breakdown and observed dates before using it as current market consensus.`
  };
}

export function shouldShowEvidenceCallout(tool: Pick<Tool, "freshnessStatus" | "evidenceStatus">) {
  return tool.freshnessStatus !== "current" || tool.evidenceStatus !== "source_verified";
}
