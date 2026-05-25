export type MetricKey = "capability" | "usability" | "reliability" | "value" | "adoption";

export type MetricBreakdown = Record<MetricKey, number>;

export type FreshnessStatus = "current" | "needs_review" | "stale" | "seed_only";

export type EvidenceStatus = "source_verified" | "partially_verified" | "manual_seed" | "insufficient_evidence";

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
  sourceUrl?: string;
  sourceWeight?: number;
  evidenceUrl?: string | null;
  title: string;
  observedAt: string;
  score: number;
  confidence: number;
  metricImpacts: Partial<MetricBreakdown>;
  notes: string;
};

export type Poll = {
  id?: string;
  toolId: string;
  votesFor: number;
  votesAgainst: number;
};

export type PollVote = {
  id: string;
  pollId: string;
  userId: string | null;
  vote: "for" | "against";
  createdAt: string;
};

export type ScoreSnapshot = {
  id: string;
  toolId: string;
  capturedAt: string;
  snapshotDate: string;
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
  bestFor: string;
  website: string;
  pricing: string;
  founded: string;
  stage: "Emerging" | "Scaling" | "Established";
  lastVerifiedAt: string | null;
  freshnessStatus: FreshnessStatus;
  evidenceStatus: EvidenceStatus;
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

export type EditorialSource = {
  id?: string;
  name: string;
  homepageUrl?: string | null;
  feedUrl: string;
  sourceType: "rss";
  category?: string | null;
  region?: string | null;
  language?: string | null;
  reliabilityNote?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EditorialItemStatus = "candidate" | "selected" | "rejected" | "archived";

export type EditorialItem = {
  id?: string;
  sourceId?: string | null;
  sourceName: string;
  sourceUrl?: string | null;
  originalUrl: string;
  originalTitle: string;
  originalExcerpt?: string | null;
  publishedAt?: string | null;
  fetchedAt?: string;
  contentHash?: string | null;
  category?: string | null;
  region?: string | null;
  language?: string | null;
  status: EditorialItemStatus;
  createdAt?: string;
  updatedAt?: string;
};
