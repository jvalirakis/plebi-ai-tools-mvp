import { evidenceLabels, freshnessLabels } from "@/lib/status";
import type { SourceObservation, Tool } from "@/lib/types";

export type EvidenceQualitySummary = {
  sourceCount: number;
  highestConfidenceObservation: SourceObservation | null;
  lastObservedAt: string | null;
  evidenceStatusLabel: string;
};

export function getEvidenceQualitySummary(tool: Pick<Tool, "observations" | "evidenceStatus">): EvidenceQualitySummary {
  const sourceIds = new Set(tool.observations.map((observation) => observation.sourceId));
  const highestConfidenceObservation = tool.observations
    .slice()
    .sort((a, b) => b.confidence - a.confidence || b.score - a.score)[0] ?? null;
  const lastObservedAt = tool.observations
    .map((observation) => observation.observedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return {
    sourceCount: sourceIds.size,
    highestConfidenceObservation,
    lastObservedAt,
    evidenceStatusLabel: evidenceLabels[tool.evidenceStatus]
  };
}

export function daysSinceDate(date: string | null, now = new Date()) {
  if (!date) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return Math.floor((now.getTime() - parsed.getTime()) / 86_400_000);
}

export function getVerificationAgeLabel(date: string | null, now = new Date()) {
  const days = daysSinceDate(date, now);

  if (days === null) {
    return "No verification date";
  }

  if (days >= 90) {
    return "90+ days since verification";
  }

  if (days >= 60) {
    return "60+ days since verification";
  }

  if (days >= 30) {
    return "30+ days since verification";
  }

  return `${days} days since verification`;
}

export function getReviewReasons(tool: Pick<Tool, "freshnessStatus" | "evidenceStatus" | "lastVerifiedAt">, now = new Date()) {
  const reasons: string[] = [];

  if (tool.freshnessStatus === "seed_only" || tool.freshnessStatus === "needs_review" || tool.freshnessStatus === "stale") {
    reasons.push(freshnessLabels[tool.freshnessStatus]);
  }

  if (tool.evidenceStatus === "insufficient_evidence") {
    reasons.push(evidenceLabels.insufficient_evidence);
  }

  const verificationDays = daysSinceDate(tool.lastVerifiedAt, now);

  if (verificationDays === null) {
    reasons.push("No verification date");
  } else if (verificationDays >= 90) {
    reasons.push("90+ days");
  } else if (verificationDays >= 60) {
    reasons.push("60+ days");
  } else if (verificationDays >= 30) {
    reasons.push("30+ days");
  }

  return Array.from(new Set(reasons));
}
