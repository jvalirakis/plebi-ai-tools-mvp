import { categories, sources, tools } from "@/lib/seed";
import { getScoreBreakdown } from "@/lib/scoring";

export function getCategories() {
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

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getTools() {
  return tools;
}

export function getSources() {
  return sources;
}

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getRankedTools(categorySlug?: string) {
  return tools
    .filter((tool) => (categorySlug ? tool.categorySlug === categorySlug : true))
    .map((tool) => ({
      ...tool,
      score: getScoreBreakdown(tool).finalScore
    }))
    .sort((a, b) => b.score - a.score);
}

export function getRelatedTools(toolSlug: string) {
  const tool = getToolBySlug(toolSlug);

  if (!tool) {
    return [];
  }

  return getRankedTools(tool.categorySlug)
    .filter((relatedTool) => relatedTool.slug !== toolSlug)
    .slice(0, 3);
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
