import { createHash } from "node:crypto";
import { fetchEditorialFeed } from "@/lib/editorial/rss";
import { insertEditorialItems, upsertSeedEditorialSources } from "@/lib/editorial/repository";
import type { EditorialItem, EditorialSource } from "@/lib/types";

export type EditorialIngestionSummary = {
  sourcesChecked: number;
  itemsSeen: number;
  itemsInserted: number;
  duplicatesSkipped: number;
  storageMode: "supabase" | "unconfigured" | "dry_run";
  sourceErrors: Array<{
    sourceName: string;
    message: string;
  }>;
};

type IngestOptions = {
  maxSources?: number;
  maxItemsPerSource?: number;
  dryRun?: boolean;
};

function contentHash(source: EditorialSource, item: { title: string; link: string }) {
  return createHash("sha256").update(`${source.name}|${item.title}|${item.link}`).digest("hex");
}

function toEditorialItem(source: EditorialSource, item: { title: string; link: string; excerpt?: string | null; publishedAt?: string | null }): EditorialItem {
  const fetchedAt = new Date().toISOString();

  return {
    sourceId: source.id ?? null,
    sourceName: source.name,
    sourceUrl: source.homepageUrl ?? source.feedUrl,
    originalUrl: item.link,
    originalTitle: item.title,
    originalExcerpt: item.excerpt ?? null,
    publishedAt: item.publishedAt ?? null,
    fetchedAt,
    contentHash: contentHash(source, item),
    category: source.category ?? null,
    region: source.region ?? null,
    language: source.language ?? null,
    status: "candidate"
  };
}

export async function ingestEditorialSources(options: IngestOptions = {}): Promise<EditorialIngestionSummary> {
  const maxSources = Math.max(1, Math.min(options.maxSources ?? 8, 12));
  const maxItemsPerSource = Math.max(1, Math.min(options.maxItemsPerSource ?? 10, 25));
  const sources = (await upsertSeedEditorialSources()).filter((source) => source.isActive).slice(0, maxSources);
  const sourceErrors: EditorialIngestionSummary["sourceErrors"] = [];
  const fetchedItems: EditorialItem[] = [];

  for (const source of sources) {
    try {
      const feedItems = await fetchEditorialFeed(source, maxItemsPerSource);
      fetchedItems.push(...feedItems.map((item) => toEditorialItem(source, item)));
    } catch (error) {
      sourceErrors.push({
        sourceName: source.name,
        message: error instanceof Error ? error.message : "Unknown feed error"
      });
    }
  }

  const uniqueItems = Array.from(new Map(fetchedItems.map((item) => [item.originalUrl, item])).values());

  if (options.dryRun) {
    return {
      sourcesChecked: sources.length,
      itemsSeen: fetchedItems.length,
      itemsInserted: 0,
      duplicatesSkipped: fetchedItems.length - uniqueItems.length,
      storageMode: "dry_run",
      sourceErrors
    };
  }

  const result = await insertEditorialItems(uniqueItems);

  return {
    sourcesChecked: sources.length,
    itemsSeen: fetchedItems.length,
    itemsInserted: result.inserted,
    duplicatesSkipped: fetchedItems.length - uniqueItems.length + result.duplicates,
    storageMode: result.storageMode,
    sourceErrors
  };
}
