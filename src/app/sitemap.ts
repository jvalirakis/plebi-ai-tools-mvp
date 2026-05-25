import type { MetadataRoute } from "next";
import { getCategoryRecords, getToolRecords } from "@/lib/repository";
import { absoluteUrl } from "@/lib/seo/metadata";
import type { Tool } from "@/lib/types";

const safeSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isSafeSlug(slug: string) {
  return safeSlugPattern.test(slug);
}

function toValidDate(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

function latestDate(dates: Array<Date | undefined>, fallback: Date) {
  const validDates = dates.filter((date): date is Date => Boolean(date));

  if (!validDates.length) {
    return fallback;
  }

  return new Date(Math.max(...validDates.map((date) => date.getTime())));
}

function getToolLastModified(tool: Tool, fallback: Date) {
  return latestDate(
    [
      toValidDate(tool.lastVerifiedAt),
      ...tool.observations.map((observation) => toValidDate(observation.observedAt)),
      ...tool.scoreSnapshots.map((snapshot) => toValidDate(snapshot.snapshotDate || snapshot.capturedAt))
    ],
    fallback
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatedAt = new Date();
  const [categories, tools] = await Promise.all([getCategoryRecords(), getToolRecords()]);
  const publicCategories = categories.filter((category) => isSafeSlug(category.slug));
  const publicTools = tools.filter((tool) => isSafeSlug(tool.slug));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: absoluteUrl("/compare"),
      lastModified: generatedAt,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: absoluteUrl("/tools"),
      lastModified: latestDate(publicTools.map((tool) => getToolLastModified(tool, generatedAt)), generatedAt),
      changeFrequency: "weekly",
      priority: 0.9
    },
    ...publicCategories.map((category) => {
      const categoryTools = publicTools.filter((tool) => tool.categorySlug === category.slug);

      return {
        url: absoluteUrl(`/categories/${category.slug}`),
        lastModified: latestDate(categoryTools.map((tool) => getToolLastModified(tool, generatedAt)), generatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8
      };
    }),
    ...publicTools.map((tool) => ({
      url: absoluteUrl(`/tools/${tool.slug}`),
      lastModified: getToolLastModified(tool, generatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
