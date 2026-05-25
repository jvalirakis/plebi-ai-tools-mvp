import { XMLParser } from "fast-xml-parser";
import type { EditorialSource } from "@/lib/types";

export type EditorialFeedItem = {
  title: string;
  link: string;
  excerpt?: string | null;
  publishedAt?: string | null;
};

type ParsedRecord = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  trimValues: true,
  parseTagValue: false,
  parseAttributeValue: false
});

function asRecord(value: unknown): ParsedRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as ParsedRecord) : null;
}

function asArray(value: unknown) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  const record = asRecord(value);
  if (!record) {
    return "";
  }

  for (const key of ["#text", "text", "value"]) {
    const nested = record[key];
    if (typeof nested === "string" || typeof nested === "number") {
      return String(nested);
    }
  }

  return "";
}

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ");
}

export function sanitizeFeedExcerpt(value: string | null | undefined, maxLength = 320) {
  const cleaned = decodeEntities(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return null;
  }

  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 3).trimEnd()}...` : cleaned;
}

function normalizeItemUrl(value: string, feedUrl: string) {
  try {
    const url = new URL(value, feedUrl);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeDate(value: string) {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

function getAtomLink(record: ParsedRecord, feedUrl: string) {
  const links = asArray(record.link);

  for (const link of links) {
    if (typeof link === "string") {
      const normalized = normalizeItemUrl(link, feedUrl);
      if (normalized) {
        return normalized;
      }
    }

    const linkRecord = asRecord(link);
    if (!linkRecord) {
      continue;
    }

    const rel = textValue(linkRecord["@_rel"]);
    const href = textValue(linkRecord["@_href"]);
    if ((!rel || rel === "alternate") && href) {
      const normalized = normalizeItemUrl(href, feedUrl);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function parseRssItem(record: ParsedRecord, feedUrl: string): EditorialFeedItem | null {
  const title = textValue(record.title).trim();
  const link = normalizeItemUrl(textValue(record.link).trim() || textValue(record.guid).trim(), feedUrl);

  if (!title || !link) {
    return null;
  }

  return {
    title,
    link,
    excerpt: sanitizeFeedExcerpt(textValue(record.description)),
    publishedAt: normalizeDate(textValue(record.pubDate) || textValue(record.published) || textValue(record.updated))
  };
}

function parseAtomEntry(record: ParsedRecord, feedUrl: string): EditorialFeedItem | null {
  const title = textValue(record.title).trim();
  const link = getAtomLink(record, feedUrl);

  if (!title || !link) {
    return null;
  }

  return {
    title,
    link,
    excerpt: sanitizeFeedExcerpt(textValue(record.summary) || textValue(record.content)),
    publishedAt: normalizeDate(textValue(record.published) || textValue(record.updated))
  };
}

function parseFeedXml(xml: string, feedUrl: string) {
  const parsed = parser.parse(xml) as ParsedRecord;
  const rss = asRecord(parsed.rss);
  const channel = rss ? asRecord(rss.channel) : null;

  if (channel) {
    return asArray(channel.item)
      .map((item) => asRecord(item))
      .filter((item): item is ParsedRecord => Boolean(item))
      .map((item) => parseRssItem(item, feedUrl))
      .filter((item): item is EditorialFeedItem => Boolean(item));
  }

  const feed = asRecord(parsed.feed);
  if (feed) {
    return asArray(feed.entry)
      .map((entry) => asRecord(entry))
      .filter((entry): entry is ParsedRecord => Boolean(entry))
      .map((entry) => parseAtomEntry(entry, feedUrl))
      .filter((item): item is EditorialFeedItem => Boolean(item));
  }

  return [];
}

export async function fetchEditorialFeed(source: EditorialSource, itemLimit = 10) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(source.feedUrl, {
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
        "User-Agent": "Plebi RSS ingestion; source-provided metadata only"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Feed returned HTTP ${response.status}`);
    }

    const xml = await response.text();
    return parseFeedXml(xml, source.feedUrl).slice(0, itemLimit);
  } finally {
    clearTimeout(timeout);
  }
}
