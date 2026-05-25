import type { Metadata } from "next";

type CreateMetadataOptions = {
  title?: string;
  description?: string | null;
  path?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  absoluteTitle?: boolean;
};

const fallbackBaseUrl = "https://plebi-ai-tools-mvp.vercel.app";
const defaultOgImagePath: string | null = null;

function normalizeBaseUrl(value: string | undefined) {
  const rawValue = value?.trim();

  if (!rawValue) {
    return fallbackBaseUrl;
  }

  const withProtocol = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return fallbackBaseUrl;
  }
}

export const siteConfig = {
  name: "Plebi",
  url: normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL),
  defaultTitle: "Plebi | AI Tools Intelligence",
  titleTemplate: "%s | Plebi",
  defaultDescription: "Transparent AI tool rankings with source observations, poll sentiment, score breakdowns, and decision-focused comparisons.",
  defaultOgImagePath
};

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}

export function truncateDescription(description: string | null | undefined, fallback = siteConfig.defaultDescription, maxLength = 155) {
  const cleaned = (description || fallback).replace(/\s+/g, " ").trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 3).trimEnd()}...`;
}

export function withSiteTitle(title = siteConfig.defaultTitle) {
  return title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
}

function getOpenGraphImages() {
  if (!siteConfig.defaultOgImagePath) {
    return undefined;
  }

  return [
    {
      url: absoluteUrl(siteConfig.defaultOgImagePath),
      width: 1200,
      height: 630,
      alt: `${siteConfig.name} AI tools intelligence`
    }
  ];
}

export function createPageMetadata({
  title = siteConfig.defaultTitle,
  description,
  path = "/",
  type = "website",
  noIndex = false,
  absoluteTitle = false
}: CreateMetadataOptions = {}): Metadata {
  const fullTitle = withSiteTitle(title);
  const metadataDescription = truncateDescription(description);
  const canonical = absoluteUrl(path);
  const images = getOpenGraphImages();

  return {
    title: absoluteTitle ? { absolute: fullTitle } : title,
    description: metadataDescription,
    alternates: {
      canonical
    },
    openGraph: {
      title: fullTitle,
      description: metadataDescription,
      url: canonical,
      siteName: siteConfig.name,
      type,
      images
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: fullTitle,
      description: metadataDescription,
      images: images?.map((image) => image.url)
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false
          }
        }
      : {
          index: true,
          follow: true
        }
  };
}

export function createRootMetadata(): Metadata {
  const baseMetadata = createPageMetadata({
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    path: "/",
    absoluteTitle: true
  });

  return {
    ...baseMetadata,
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.defaultTitle,
      template: siteConfig.titleTemplate
    },
    applicationName: siteConfig.name
  };
}
