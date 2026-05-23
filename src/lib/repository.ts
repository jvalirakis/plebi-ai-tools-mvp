import { cache } from "react";
import { categories as seedCategories, sources as seedSources, tools as seedTools } from "@/lib/seed";
import { getScoreBreakdown } from "@/lib/scoring";
import { getSupabaseDataClient } from "@/lib/supabase/data-client";
import type { Database, Json } from "@/lib/supabase/types";
import type { Category, MetricBreakdown, Poll, PollVote, ScoreSnapshot, Source, SourceObservation, Tool } from "@/lib/types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type SourceRow = Database["public"]["Tables"]["sources"]["Row"];
type SourceObservationRow = Database["public"]["Tables"]["source_observations"]["Row"];
type ScoreSnapshotRow = Database["public"]["Tables"]["score_snapshots"]["Row"];
type PollRow = Database["public"]["Tables"]["polls"]["Row"];
type PollVoteRow = Database["public"]["Tables"]["poll_votes"]["Row"];

const metricKeys = ["capability", "usability", "reliability", "value", "adoption"] as const;
const sourceTypes: Source["type"][] = ["benchmark", "review", "community", "pricing", "security"];
const stages: Tool["stage"][] = ["Emerging", "Scaling", "Established"];
const seedToolBySlug = new Map(seedTools.map((tool) => [tool.slug, tool]));
const seedObservations = seedTools.flatMap((tool) => tool.observations);
const seedSnapshots = seedTools.flatMap((tool) => tool.scoreSnapshots);
const seedPolls = seedTools.map((tool) => tool.poll);

function isJsonRecord(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: Json | number | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toMetricBreakdown(value: Json): MetricBreakdown {
  const record = isJsonRecord(value) ? value : {};

  return {
    capability: toNumber(record.capability),
    usability: toNumber(record.usability),
    reliability: toNumber(record.reliability),
    value: toNumber(record.value),
    adoption: toNumber(record.adoption)
  };
}

function toPartialMetricBreakdown(value: Json): Partial<MetricBreakdown> {
  if (!isJsonRecord(value)) {
    return {};
  }

  return metricKeys.reduce<Partial<MetricBreakdown>>((metrics, key) => {
    const metricValue = value[key];

    if (typeof metricValue === "number" && Number.isFinite(metricValue)) {
      metrics[key] = metricValue;
    }

    return metrics;
  }, {});
}

function toSourceType(value: string): Source["type"] {
  return sourceTypes.includes(value as Source["type"]) ? (value as Source["type"]) : "benchmark";
}

function toStage(value: string): Tool["stage"] {
  return stages.includes(value as Tool["stage"]) ? (value as Tool["stage"]) : "Emerging";
}

async function readCategoryRows() {
  const client = getSupabaseDataClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client.from("categories").select("*").order("created_at", { ascending: true });
  return error ? [] : data ?? [];
}

async function readToolRows() {
  const client = getSupabaseDataClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client.from("tools").select("*").order("created_at", { ascending: true });
  return error ? [] : data ?? [];
}

async function readSourceRows() {
  const client = getSupabaseDataClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client.from("sources").select("*").order("created_at", { ascending: true });
  return error ? [] : data ?? [];
}

async function readSourceObservationRows() {
  const client = getSupabaseDataClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client.from("source_observations").select("*").order("observed_at", { ascending: false });
  return error ? [] : data ?? [];
}

async function readScoreSnapshotRows() {
  const client = getSupabaseDataClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client.from("score_snapshots").select("*").order("captured_at", { ascending: true });
  return error ? [] : data ?? [];
}

async function readPollRows() {
  const client = getSupabaseDataClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client.from("polls").select("*").order("created_at", { ascending: true });
  return error ? [] : data ?? [];
}

async function readPollVoteRows() {
  const client = getSupabaseDataClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client.from("poll_votes").select("*").order("created_at", { ascending: false });
  return error ? [] : data ?? [];
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    subcategories: row.subcategories,
    signal: row.signal,
    benchmark: row.benchmark
  };
}

function mapSource(row: SourceRow): Source {
  return {
    id: row.id,
    name: row.name,
    type: toSourceType(row.type),
    url: row.url,
    weight: Number(row.weight),
    credibility: row.credibility
  };
}

function mapObservation(row: SourceObservationRow, sourceById: Map<string, Source>): SourceObservation {
  const source = sourceById.get(row.source_id);

  return {
    id: row.id,
    toolId: row.tool_id,
    sourceId: row.source_id,
    sourceName: source?.name ?? "Unknown Source",
    sourceType: source?.type ?? "benchmark",
    sourceUrl: source?.url,
    sourceWeight: source?.weight,
    title: row.title,
    observedAt: row.observed_at,
    score: row.score,
    confidence: Number(row.confidence),
    metricImpacts: toPartialMetricBreakdown(row.metric_impacts),
    notes: row.notes
  };
}

function mapSnapshot(row: ScoreSnapshotRow): ScoreSnapshot {
  return {
    id: row.id,
    toolId: row.tool_id,
    capturedAt: row.captured_at,
    score: row.score,
    reason: row.reason
  };
}

function mapPoll(row: PollRow): Poll {
  return {
    id: row.id,
    toolId: row.tool_id,
    votesFor: row.votes_for,
    votesAgainst: row.votes_against
  };
}

function mapPollVote(row: PollVoteRow): PollVote {
  return {
    id: row.id,
    pollId: row.poll_id,
    userId: row.user_id,
    vote: row.vote,
    createdAt: row.created_at
  };
}

function groupByToolId<T extends { toolId: string }>(records: T[]) {
  return records.reduce<Map<string, T[]>>((grouped, record) => {
    const current = grouped.get(record.toolId) ?? [];
    current.push(record);
    grouped.set(record.toolId, current);
    return grouped;
  }, new Map<string, T[]>());
}

function adaptSeedObservations(tool: Tool, toolId: string, sourceByName: Map<string, Source>) {
  return tool.observations.map((observation) => {
    const source = sourceByName.get(observation.sourceName);

    return {
      ...observation,
      id: `${toolId}-${observation.sourceId}`,
      toolId,
      sourceId: source?.id ?? observation.sourceId,
      sourceUrl: source?.url ?? observation.sourceUrl,
      sourceWeight: source?.weight ?? observation.sourceWeight
    };
  });
}

function adaptSeedSnapshots(tool: Tool, toolId: string) {
  return tool.scoreSnapshots.map((snapshot) => ({
    ...snapshot,
    id: `${toolId}-${snapshot.id}`,
    toolId
  }));
}

function adaptSeedPoll(tool: Tool, toolId: string): Poll {
  return {
    toolId,
    votesFor: tool.poll.votesFor,
    votesAgainst: tool.poll.votesAgainst
  };
}

export const getCategoryRecords = cache(async (): Promise<Category[]> => {
  const rows = await readCategoryRows();
  return rows.length ? rows.map(mapCategory) : seedCategories;
});

export const getSourceRecords = cache(async (): Promise<Source[]> => {
  const rows = await readSourceRows();
  return rows.length ? rows.map(mapSource) : seedSources;
});

export const getSourceObservationRecords = cache(async (): Promise<SourceObservation[]> => {
  const [rows, sources] = await Promise.all([readSourceObservationRows(), getSourceRecords()]);
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  return rows.length ? rows.map((row) => mapObservation(row, sourceById)) : seedObservations;
});

export const getScoreSnapshotRecords = cache(async (): Promise<ScoreSnapshot[]> => {
  const rows = await readScoreSnapshotRows();
  return rows.length ? rows.map(mapSnapshot) : seedSnapshots;
});

export const getPollRecords = cache(async (): Promise<Poll[]> => {
  const rows = await readPollRows();
  return rows.length ? rows.map(mapPoll) : seedPolls;
});

export const getPollVoteRecords = cache(async (): Promise<PollVote[]> => {
  const rows = await readPollVoteRows();
  return rows.map(mapPollVote);
});

export const getToolRecords = cache(async (): Promise<Tool[]> => {
  const [toolRows, categories, sources, observationRows, snapshotRows, pollRows] = await Promise.all([
    readToolRows(),
    getCategoryRecords(),
    getSourceRecords(),
    readSourceObservationRows(),
    readScoreSnapshotRows(),
    readPollRows()
  ]);

  if (!toolRows.length) {
    return seedTools;
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const sourceByName = new Map(sources.map((source) => [source.name, source]));
  const observationsByToolId = groupByToolId(observationRows.map((row) => mapObservation(row, sourceById)));
  const snapshotsByToolId = groupByToolId(snapshotRows.map(mapSnapshot));
  const pollByToolId = new Map(pollRows.map((row) => [row.tool_id, mapPoll(row)]));

  return toolRows.map((row) => {
    const seedTool = seedToolBySlug.get(row.slug);
    const observations = observationsByToolId.get(row.id);
    const scoreSnapshots = snapshotsByToolId.get(row.id);
    const poll = pollByToolId.get(row.id);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      categorySlug: categoryById.get(row.category_id)?.slug ?? seedTool?.categorySlug ?? "uncategorized",
      subcategory: row.subcategory,
      tagline: row.tagline,
      summary: row.summary,
      bestFor: row.best_for || seedTool?.bestFor || row.summary,
      website: row.website,
      pricing: row.pricing,
      founded: row.founded,
      stage: toStage(row.stage),
      metrics: toMetricBreakdown(row.metrics),
      poll: poll ?? (seedTool ? adaptSeedPoll(seedTool, row.id) : { toolId: row.id, votesFor: 0, votesAgainst: 0 }),
      observations: observations?.length ? observations : seedTool ? adaptSeedObservations(seedTool, row.id, sourceByName) : [],
      scoreSnapshots: scoreSnapshots?.length ? scoreSnapshots : seedTool ? adaptSeedSnapshots(seedTool, row.id) : []
    };
  });
});

export async function getCategories() {
  const [categories, tools] = await Promise.all([getCategoryRecords(), getToolRecords()]);

  return categories.map((category) => {
    const categoryTools = tools.filter((tool) => tool.categorySlug === category.slug);
    const topTool = categoryTools
      .map((tool) => ({ tool, score: getScoreBreakdown(tool).finalScore }))
      .sort((a, b) => b.score - a.score)[0];

    return {
      ...category,
      toolCount: categoryTools.length,
      topTool: topTool?.tool,
      topScore: topTool?.score ?? 0
    };
  });
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategoryRecords();
  return categories.find((category) => category.slug === slug);
}

export async function getTools() {
  return getToolRecords();
}

export async function getSources() {
  return getSourceRecords();
}

export async function getToolBySlug(slug: string) {
  const tools = await getToolRecords();
  return tools.find((tool) => tool.slug === slug);
}

export async function getRankedTools(categorySlug?: string) {
  const tools = await getToolRecords();

  return tools
    .filter((tool) => (categorySlug ? tool.categorySlug === categorySlug : true))
    .map((tool) => ({
      ...tool,
      score: getScoreBreakdown(tool).finalScore
    }))
    .sort((a, b) => b.score - a.score);
}

export async function getRelatedTools(toolSlug: string) {
  const tool = await getToolBySlug(toolSlug);

  if (!tool) {
    return [];
  }

  const rankedTools = await getRankedTools(tool.categorySlug);
  return rankedTools.filter((relatedTool) => relatedTool.slug !== toolSlug).slice(0, 3);
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
