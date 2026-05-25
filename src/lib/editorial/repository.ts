import { getActiveEditorialSources as getStaticActiveEditorialSources, getEditorialSources as getStaticEditorialSources } from "@/lib/editorial/sources";
import { getSupabaseDataClient } from "@/lib/supabase/data-client";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import type { EditorialItem, EditorialSource } from "@/lib/types";

type EditorialSourceRow = Database["public"]["Tables"]["editorial_sources"]["Row"];
type EditorialSourceInsert = Database["public"]["Tables"]["editorial_sources"]["Insert"];
type EditorialItemRow = Database["public"]["Tables"]["editorial_items"]["Row"];
type EditorialItemInsert = Database["public"]["Tables"]["editorial_items"]["Insert"];

function mapSource(row: EditorialSourceRow): EditorialSource {
  return {
    id: row.id,
    name: row.name,
    homepageUrl: row.homepage_url,
    feedUrl: row.feed_url,
    sourceType: "rss",
    category: row.category,
    region: row.region,
    language: row.language,
    reliabilityNote: row.reliability_note,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapItem(row: EditorialItemRow): EditorialItem {
  return {
    id: row.id,
    sourceId: row.source_id,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    originalUrl: row.original_url,
    originalTitle: row.original_title,
    originalExcerpt: row.original_excerpt,
    publishedAt: row.published_at,
    fetchedAt: row.fetched_at,
    contentHash: row.content_hash,
    category: row.category,
    region: row.region,
    language: row.language,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function sourceToInsert(source: EditorialSource): EditorialSourceInsert {
  return {
    name: source.name,
    homepage_url: source.homepageUrl ?? null,
    feed_url: source.feedUrl,
    source_type: source.sourceType,
    category: source.category ?? null,
    region: source.region ?? null,
    language: source.language ?? null,
    reliability_note: source.reliabilityNote ?? null,
    is_active: source.isActive,
    updated_at: new Date().toISOString()
  };
}

export function itemToInsert(item: EditorialItem): EditorialItemInsert {
  return {
    source_id: item.sourceId ?? null,
    source_name: item.sourceName,
    source_url: item.sourceUrl ?? null,
    original_url: item.originalUrl,
    original_title: item.originalTitle,
    original_excerpt: item.originalExcerpt ?? null,
    published_at: item.publishedAt ?? null,
    fetched_at: item.fetchedAt,
    content_hash: item.contentHash ?? null,
    category: item.category ?? null,
    region: item.region ?? null,
    language: item.language ?? null,
    status: item.status
  };
}

export async function listEditorialSources() {
  const client = getSupabaseDataClient();

  if (!client) {
    return getStaticEditorialSources();
  }

  const { data, error } = await client.from("editorial_sources").select("*").order("name", { ascending: true });

  if (error || !data?.length) {
    return getStaticEditorialSources();
  }

  return data.map(mapSource);
}

export async function listActiveEditorialSources() {
  const sources = await listEditorialSources();
  return sources.filter((source) => source.isActive);
}

export async function listPublicEditorialItems(limit = 24) {
  const client = getSupabaseDataClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("editorial_items")
    .select("*")
    .in("status", ["candidate", "selected"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(mapItem);
}

export async function upsertSeedEditorialSources() {
  const client = getSupabaseServiceClient();

  if (!client) {
    return getStaticActiveEditorialSources();
  }

  const { data, error } = await client
    .from("editorial_sources")
    .upsert(getStaticEditorialSources().map(sourceToInsert), { onConflict: "feed_url" })
    .select("*");

  if (error || !data?.length) {
    return getStaticActiveEditorialSources();
  }

  return data.map(mapSource).filter((source) => source.isActive);
}

export async function insertEditorialItems(items: EditorialItem[]): Promise<{ inserted: number; duplicates: number; storageMode: "supabase" | "unconfigured" }> {
  const client = getSupabaseServiceClient();

  if (!client || !items.length) {
    return {
      inserted: 0,
      duplicates: 0,
      storageMode: client ? "supabase" : "unconfigured"
    };
  }

  const urls = items.map((item) => item.originalUrl);
  const hashes = items.map((item) => item.contentHash).filter((hash): hash is string => Boolean(hash));
  const [{ data: urlRows }, { data: hashRows }] = await Promise.all([
    client.from("editorial_items").select("original_url").in("original_url", urls),
    hashes.length
      ? client.from("editorial_items").select("content_hash").in("content_hash", hashes)
      : Promise.resolve({ data: [] as Array<{ content_hash: string | null }> })
  ]);

  const existingUrls = new Set((urlRows ?? []).map((row) => row.original_url));
  const existingHashes = new Set((hashRows ?? []).map((row) => row.content_hash).filter((hash): hash is string => Boolean(hash)));
  const newItems = items.filter((item) => !existingUrls.has(item.originalUrl) && (!item.contentHash || !existingHashes.has(item.contentHash)));

  if (!newItems.length) {
    return {
      inserted: 0,
      duplicates: items.length,
      storageMode: "supabase"
    };
  }

  const { data, error } = await client
    .from("editorial_items")
    .upsert(newItems.map(itemToInsert), { onConflict: "original_url", ignoreDuplicates: true })
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  const inserted = data?.length ?? 0;

  return {
    inserted,
    duplicates: items.length - inserted,
    storageMode: "supabase"
  };
}
