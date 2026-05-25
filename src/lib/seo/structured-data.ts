import { absoluteUrl, siteConfig, truncateDescription } from "@/lib/seo/metadata";
import type { Category, Tool } from "@/lib/types";

export type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];

export type JsonLdObject = {
  [key: string]: JsonLdValue | undefined;
};

type ItemListEntry = {
  name: string;
  path: string;
  description?: string | null;
};

type BreadcrumbEntry = {
  name: string;
  path: string;
};

function safeExternalUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:" ? parsedUrl.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function createWebsiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.defaultDescription
  };
}

export function createItemListJsonLd({ name, path, description, items }: { name: string; path: string; description?: string | null; items: ItemListEntry[] }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description: truncateDescription(description),
    url: absoluteUrl(path),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      description: item.description ? truncateDescription(item.description) : undefined,
      url: absoluteUrl(item.path)
    }))
  };
}

export function createBreadcrumbListJsonLd(items: BreadcrumbEntry[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function createToolJsonLd(tool: Tool, category?: Category): JsonLdObject {
  const canonicalUrl = absoluteUrl(`/tools/${tool.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: truncateDescription(tool.summary || tool.tagline),
    url: safeExternalUrl(tool.website) ?? canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    applicationCategory: category?.name ?? tool.subcategory,
    operatingSystem: "Web"
  };
}
