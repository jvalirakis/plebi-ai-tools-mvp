import type { EvidenceStatus, FreshnessStatus, Tool } from "@/lib/types";

export const freshnessLabels: Record<FreshnessStatus, string> = {
  current: "Current",
  needs_review: "Needs review",
  stale: "Stale",
  seed_only: "Seed only"
};

export const evidenceLabels: Record<EvidenceStatus, string> = {
  source_verified: "Source verified",
  partially_verified: "Partially verified",
  manual_seed: "Manual seed",
  insufficient_evidence: "Insufficient evidence"
};

export function statusClass(status: FreshnessStatus | EvidenceStatus) {
  switch (status) {
    case "current":
    case "source_verified":
      return "border-success/30 bg-success/10 text-success";
    case "partially_verified":
      return "border-primary/30 bg-primary/10 text-primary";
    case "needs_review":
    case "stale":
    case "insufficient_evidence":
      return "border-warning/30 bg-warning/10 text-warning";
    case "seed_only":
    case "manual_seed":
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function getLatestObservationDate(tools: Tool[]) {
  const dates = tools.flatMap((tool) => tool.observations.map((observation) => observation.observedAt)).filter(Boolean).sort();
  return dates.at(-1) ?? null;
}

export function hasVerifiedEvidence(tools: Tool[]) {
  return tools.some((tool) => tool.evidenceStatus === "source_verified" || tool.evidenceStatus === "partially_verified");
}

export function getCategoryRefreshLabel(tools: Tool[]) {
  if (!tools.length || !hasVerifiedEvidence(tools)) {
    return "Seed dataset / needs verification";
  }

  const latestDate = getLatestObservationDate(tools);
  return latestDate ? `Last refreshed ${latestDate}` : "Needs verification";
}

export const rankingDisclaimer =
  "Plebi rankings are based on the latest verified source observations available in this dataset. Items marked Seed only or Needs review should not be treated as current market consensus.";
