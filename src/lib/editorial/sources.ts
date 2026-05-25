import type { EditorialSource } from "@/lib/types";

export const editorialSources: EditorialSource[] = [
  {
    name: "OpenAI News",
    homepageUrl: "https://openai.com/news/",
    feedUrl: "https://openai.com/news/rss.xml",
    sourceType: "rss",
    category: "Official AI labs",
    region: "Global",
    language: "en",
    reliabilityNote: "Official OpenAI news RSS feed. Source-provided titles and excerpts only.",
    isActive: true
  },
  {
    name: "Google AI Blog",
    homepageUrl: "https://blog.google/technology/ai/",
    feedUrl: "https://blog.google/technology/ai/rss/",
    sourceType: "rss",
    category: "Official AI labs",
    region: "Global",
    language: "en",
    reliabilityNote: "Official Google AI blog RSS feed. Source-provided titles and excerpts only.",
    isActive: true
  },
  {
    name: "Google DeepMind Blog",
    homepageUrl: "https://deepmind.google/blog/",
    feedUrl: "https://deepmind.google/blog/rss.xml",
    sourceType: "rss",
    category: "Official AI labs",
    region: "Global",
    language: "en",
    reliabilityNote: "Official Google DeepMind blog RSS feed. Source-provided titles and excerpts only.",
    isActive: true
  },
  {
    name: "arXiv cs.AI",
    homepageUrl: "https://arxiv.org/list/cs.AI/recent",
    feedUrl: "https://export.arxiv.org/rss/cs.AI",
    sourceType: "rss",
    category: "Developer/research sources",
    region: "Global",
    language: "en",
    reliabilityNote: "arXiv computer science AI category RSS feed. Research metadata, not editorial endorsement.",
    isActive: true
  },
  {
    name: "The Verge AI",
    homepageUrl: "https://www.theverge.com/ai-artificial-intelligence",
    feedUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    sourceType: "rss",
    category: "AI product/tools media",
    region: "US",
    language: "en",
    reliabilityNote: "Technology media RSS feed for AI coverage. Source-provided titles and excerpts only.",
    isActive: true
  },
  {
    name: "TechCrunch AI",
    homepageUrl: "https://techcrunch.com/category/artificial-intelligence/",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
    sourceType: "rss",
    category: "AI product/tools media",
    region: "US",
    language: "en",
    reliabilityNote: "Technology media RSS feed for AI coverage. Source-provided titles and excerpts only.",
    isActive: true
  },
  {
    name: "MIT Technology Review AI",
    homepageUrl: "https://www.technologyreview.com/topic/artificial-intelligence/",
    feedUrl: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
    sourceType: "rss",
    category: "AI product/tools media",
    region: "US",
    language: "en",
    reliabilityNote: "Technology Review AI topic RSS feed. Source-provided titles and excerpts only.",
    isActive: true
  },
  {
    name: "VentureBeat AI",
    homepageUrl: "https://venturebeat.com/category/ai/",
    feedUrl: "https://venturebeat.com/category/ai/feed",
    sourceType: "rss",
    category: "AI product/tools media",
    region: "US",
    language: "en",
    reliabilityNote: "Technology media RSS feed for AI coverage. Source-provided titles and excerpts only.",
    isActive: true
  }
];

export function normalizeSourceUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;

  try {
    const url = new URL(withProtocol);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function validateEditorialSource(source: EditorialSource) {
  return Boolean(source.name.trim() && normalizeSourceUrl(source.feedUrl) && source.sourceType === "rss");
}

export function getEditorialSources() {
  return editorialSources;
}

export function getActiveEditorialSources() {
  return editorialSources.filter((source) => source.isActive && validateEditorialSource(source));
}
