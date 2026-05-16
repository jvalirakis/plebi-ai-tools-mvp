export type MetricKey = "capability" | "usability" | "reliability" | "value" | "adoption";

export type MetricBreakdown = Record<MetricKey, number>;

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  subcategories: string[];
  signal: string;
  benchmark: string;
};

export type Source = {
  id: string;
  name: string;
  type: "benchmark" | "review" | "community" | "pricing" | "security";
  url: string;
  weight: number;
  credibility: number;
};

export type SourceObservation = {
  id: string;
  toolId: string;
  sourceId: string;
  sourceName: string;
  sourceType: Source["type"];
  title: string;
  observedAt: string;
  score: number;
  confidence: number;
  metricImpacts: Partial<MetricBreakdown>;
  notes: string;
};

export type Poll = {
  toolId: string;
  votesFor: number;
  votesAgainst: number;
};

export type ScoreSnapshot = {
  id: string;
  toolId: string;
  capturedAt: string;
  score: number;
  reason: string;
};

export type Tool = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  subcategory: string;
  tagline: string;
  summary: string;
  website: string;
  pricing: string;
  founded: string;
  stage: "Emerging" | "Scaling" | "Established";
  metrics: MetricBreakdown;
  poll: Poll;
  observations: SourceObservation[];
  scoreSnapshots: ScoreSnapshot[];
};

export type ScoreBreakdown = MetricBreakdown & {
  sourceSignal: number;
  pollSentiment: number;
  finalScore: number;
};
