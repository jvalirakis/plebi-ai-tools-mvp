import type { MetricBreakdown, MetricKey, ScoreBreakdown, SourceObservation, Tool } from "@/lib/types";
import { evidenceLabels, freshnessLabels } from "@/lib/status";

export const metricLabels: Record<MetricKey, string> = {
  capability: "Capability",
  usability: "Usability",
  reliability: "Reliability",
  value: "Value",
  adoption: "Adoption"
};

export const metricWeights: Record<MetricKey, number> = {
  capability: 0.25,
  usability: 0.18,
  reliability: 0.18,
  value: 0.16,
  adoption: 0.13
};

export const scoreFormula = [
  { label: "Metric model", weight: 70 },
  { label: "Source signal", weight: 20 },
  { label: "User poll", weight: 10 }
];

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getPollSentiment(tool: Pick<Tool, "poll">) {
  const total = tool.poll.votesFor + tool.poll.votesAgainst;
  if (!total) {
    return 50;
  }

  return clampScore((tool.poll.votesFor / total) * 100);
}

export function getSourceSignal(observations: SourceObservation[]) {
  if (!observations.length) {
    return 50;
  }

  const weighted = observations.reduce(
    (acc, observation) => {
      const weight = observation.confidence;
      return {
        score: acc.score + observation.score * weight,
        weight: acc.weight + weight
      };
    },
    { score: 0, weight: 0 }
  );

  return clampScore(weighted.score / weighted.weight);
}

export function getMetricModel(metrics: MetricBreakdown) {
  const weightedScore = (Object.keys(metricWeights) as MetricKey[]).reduce(
    (total, key) => total + metrics[key] * metricWeights[key],
    0
  );

  return weightedScore / Object.values(metricWeights).reduce((total, weight) => total + weight, 0);
}

export function getScoreBreakdown(tool: Tool): ScoreBreakdown {
  const metricModel = getMetricModel(tool.metrics);
  const sourceSignal = getSourceSignal(tool.observations);
  const pollSentiment = getPollSentiment(tool);
  const finalScore = clampScore(metricModel * 0.7 + sourceSignal * 0.2 + pollSentiment * 0.1);

  return {
    ...tool.metrics,
    sourceSignal,
    pollSentiment,
    finalScore
  };
}

export function getTopMetric(metrics: MetricBreakdown) {
  return (Object.keys(metrics) as MetricKey[])
    .map((key) => ({ key, label: metricLabels[key], score: metrics[key] }))
    .sort((a, b) => b.score - a.score)[0];
}

export function getRankExplanation(tool: Tool) {
  const breakdown = getScoreBreakdown(tool);
  const topMetric = getTopMetric(tool.metrics);
  const statusNote =
    tool.freshnessStatus === "current" && tool.evidenceStatus === "source_verified"
      ? "This ranking is marked current and source verified in the dataset."
      : `This placement is marked ${freshnessLabels[tool.freshnessStatus].toLowerCase()} and ${evidenceLabels[
          tool.evidenceStatus
        ].toLowerCase()}, so treat it as a transparent dataset signal rather than current market consensus.`;

  return `${tool.name} appears here because ${topMetric.label.toLowerCase()} is its strongest structured metric at ${topMetric.score}%, supported by a ${breakdown.sourceSignal}% source signal and ${breakdown.pollSentiment}% community sentiment. ${statusNote}`;
}

export function getConfidenceLevel(tool: Tool) {
  const observationConfidence = tool.observations.length
    ? tool.observations.reduce((total, observation) => total + observation.confidence, 0) / tool.observations.length
    : 0.5;
  const pollDepth = Math.min(1, (tool.poll.votesFor + tool.poll.votesAgainst) / 5000);

  return clampScore((observationConfidence * 0.72 + pollDepth * 0.28) * 100);
}

export function getScoreTone(score: number) {
  if (score >= 88) {
    return "text-success";
  }

  if (score >= 78) {
    return "text-primary";
  }

  if (score >= 68) {
    return "text-warning";
  }

  return "text-muted-foreground";
}
