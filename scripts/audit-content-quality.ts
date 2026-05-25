import fs from "node:fs";
import path from "node:path";
import * as ts from "typescript";

type Severity = "error" | "warning" | "info";
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue | undefined };

type AuditIssue = {
  severity: Severity;
  code: string;
  message: string;
  target?: string;
};

type AuditCategory = {
  slug: string;
  name: string;
  description: string;
  subcategories: string[];
};

type AuditTool = {
  slug: string;
  name: string;
  categorySlug: string;
  subcategory: string;
  tagline: string;
  summary: string;
  website: string;
  pricing: string;
  stage: string;
};

type AuditNewsletterSection = {
  toolSlugs: string[];
  categorySlugs: string[];
};

type AuditNewsletterIssue = {
  slug: string;
  title: string;
  issueDate: string;
  summary: string;
  status: string;
  featuredToolSlugs: string[];
  featuredCategorySlugs: string[];
  sections: AuditNewsletterSection[];
};

type AuditEditorialSource = {
  name: string;
  homepageUrl: string;
  feedUrl: string;
  sourceType: string;
  category: string;
  region: string;
  language: string;
  isActive: boolean;
};

type PricingType = "free_freemium" | "paid" | "enterprise" | "open_source" | "usage_based" | "other";

type AuditReport = {
  auditDate: string;
  scope: string[];
  categoryCount: number;
  toolCount: number;
  newsletterIssueCount: number;
  editorialSourceCount: number;
  activeEditorialSourceCount: number;
  counts: Record<Severity, number>;
  pricingTypeCounts: Record<PricingType, number>;
  issues: AuditIssue[];
};

const rootDir = process.cwd();
const seedPath = path.join(rootDir, "src", "lib", "seed.ts");
const supabaseSeedPath = path.join(rootDir, "supabase", "seed.sql");
const structuredDataPath = path.join(rootDir, "src", "lib", "seo", "structured-data.ts");
const directoryFiltersPath = path.join(rootDir, "src", "lib", "directory-filters.ts");
const contentPath = path.join(rootDir, "src", "lib", "content.ts");
const newsletterIssuesPath = path.join(rootDir, "src", "lib", "newsletter", "issues.ts");
const editorialSourcesPath = path.join(rootDir, "src", "lib", "editorial", "sources.ts");
const sitemapPath = path.join(rootDir, "src", "app", "sitemap.ts");
const docsDir = path.join(rootDir, "docs");
const writeReports = process.argv.includes("--write");
const auditDate = new Date().toISOString().slice(0, 10);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const riskyClaimPattern = /\b(best|#1|guaranteed|gdpr compliant)\b/i;
const compliancePattern = /\b(GDPR|HIPAA|SOC 2|ISO 27001|certified|compliant)\b/i;

function addIssue(issues: AuditIssue[], severity: Severity, code: string, message: string, target?: string) {
  issues.push({ severity, code, message, target });
}

function readSource(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function getSourceFile(filePath: string) {
  return ts.createSourceFile(filePath, readSource(filePath), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function getVariableInitializer(sourceFile: ts.SourceFile, name: string) {
  let initializer: ts.Expression | undefined;

  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      initializer = node.initializer;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return initializer;
}

function getPropertyName(name: ts.PropertyName) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return undefined;
}

function expressionToValue(expression: ts.Expression): JsonValue | undefined {
  if (ts.isStringLiteralLike(expression)) {
    return expression.text;
  }

  if (ts.isNumericLiteral(expression)) {
    return Number(expression.text);
  }

  if (expression.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }

  if (expression.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  if (expression.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  }

  if (ts.isPrefixUnaryExpression(expression) && ts.isNumericLiteral(expression.operand)) {
    const value = Number(expression.operand.text);
    return expression.operator === ts.SyntaxKind.MinusToken ? -value : value;
  }

  if (ts.isArrayLiteralExpression(expression)) {
    const values: JsonValue[] = [];

    for (const element of expression.elements) {
      if (ts.isSpreadElement(element)) {
        return undefined;
      }

      const value = expressionToValue(element);
      if (typeof value === "undefined") {
        return undefined;
      }

      values.push(value);
    }

    return values;
  }

  if (ts.isObjectLiteralExpression(expression)) {
    const value: JsonObject = {};

    for (const property of expression.properties) {
      if (!ts.isPropertyAssignment(property)) {
        return undefined;
      }

      const key = getPropertyName(property.name);
      if (!key) {
        return undefined;
      }

      const propertyValue = expressionToValue(property.initializer);
      if (typeof propertyValue === "undefined") {
        return undefined;
      }

      value[key] = propertyValue;
    }

    return value;
  }

  return undefined;
}

function isObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(record: JsonObject, key: string) {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(record: JsonObject, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];
}

function asObjectArray(record: JsonObject, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function parseObjectArray(sourceFile: ts.SourceFile, variableName: string) {
  const initializer = getVariableInitializer(sourceFile, variableName);
  const value = initializer ? expressionToValue(initializer) : undefined;
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function parseObjectRecord(sourceFile: ts.SourceFile, variableName: string) {
  const initializer = getVariableInitializer(sourceFile, variableName);
  const value = initializer ? expressionToValue(initializer) : undefined;
  return isObject(value) ? value : {};
}

function toCategory(record: JsonObject): AuditCategory {
  return {
    slug: asString(record, "slug"),
    name: asString(record, "name"),
    description: asString(record, "description"),
    subcategories: asStringArray(record, "subcategories")
  };
}

function toTool(record: JsonObject): AuditTool {
  return {
    slug: asString(record, "slug"),
    name: asString(record, "name"),
    categorySlug: asString(record, "categorySlug"),
    subcategory: asString(record, "subcategory"),
    tagline: asString(record, "tagline"),
    summary: asString(record, "summary"),
    website: asString(record, "website"),
    pricing: asString(record, "pricing"),
    stage: asString(record, "stage")
  };
}

function toNewsletterIssue(record: JsonObject): AuditNewsletterIssue {
  return {
    slug: asString(record, "slug"),
    title: asString(record, "title"),
    issueDate: asString(record, "issueDate"),
    summary: asString(record, "summary"),
    status: asString(record, "status"),
    featuredToolSlugs: asStringArray(record, "featuredToolSlugs"),
    featuredCategorySlugs: asStringArray(record, "featuredCategorySlugs"),
    sections: asObjectArray(record, "sections").map((section) => ({
      toolSlugs: asStringArray(section, "toolSlugs"),
      categorySlugs: asStringArray(section, "categorySlugs")
    }))
  };
}

function toEditorialSource(record: JsonObject): AuditEditorialSource {
  return {
    name: asString(record, "name"),
    homepageUrl: asString(record, "homepageUrl"),
    feedUrl: asString(record, "feedUrl"),
    sourceType: asString(record, "sourceType"),
    category: asString(record, "category"),
    region: asString(record, "region"),
    language: asString(record, "language"),
    isActive: record.isActive === true
  };
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getPricingType(pricing: string): PricingType {
  const normalized = pricing.toLowerCase();

  if (normalized.includes("open") || normalized.includes("model")) {
    return "open_source";
  }

  if (normalized.includes("free")) {
    return "free_freemium";
  }

  if (normalized.includes("api") || normalized.includes("usage") || normalized.includes("credit")) {
    return "usage_based";
  }

  if (
    normalized.includes("enterprise") &&
    !/(pro|team|starter|business|plus|basic|creator|standard|individual|premium|professional|paid)/i.test(pricing)
  ) {
    return "enterprise";
  }

  if (
    normalized.includes("pro") ||
    normalized.includes("premium") ||
    normalized.includes("team") ||
    normalized.includes("paid") ||
    normalized.includes("starter") ||
    normalized.includes("business") ||
    normalized.includes("enterprise")
  ) {
    return "paid";
  }

  return "other";
}

function countDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (!value) {
      continue;
    }

    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return Array.from(duplicates);
}

function hasText(source: string, pattern: string) {
  return source.includes(pattern);
}

function createReport() {
  const seedFile = getSourceFile(seedPath);
  const newsletterFile = getSourceFile(newsletterIssuesPath);
  const editorialSourcesFile = getSourceFile(editorialSourcesPath);
  const structuredDataSource = readSource(structuredDataPath);
  const directoryFiltersSource = readSource(directoryFiltersPath);
  const contentSource = readSource(contentPath);
  const sitemapSource = readSource(sitemapPath);
  const supabaseSeedSource = readSource(supabaseSeedPath);
  const categories = parseObjectArray(seedFile, "categories").map(toCategory);
  const tools = parseObjectArray(seedFile, "toolSeeds").map(toTool);
  const newsletterIssues = parseObjectArray(newsletterFile, "newsletterIssues").map(toNewsletterIssue);
  const editorialSources = parseObjectArray(editorialSourcesFile, "editorialSources").map(toEditorialSource);
  const bestForBySlug = parseObjectRecord(seedFile, "bestForBySlug");
  const issues: AuditIssue[] = [];
  const categorySlugs = new Set(categories.map((category) => category.slug));
  const toolSlugs = new Set(tools.map((tool) => tool.slug));
  const pricingTypeCounts: Record<PricingType, number> = {
    free_freemium: 0,
    paid: 0,
    enterprise: 0,
    open_source: 0,
    usage_based: 0,
    other: 0
  };

  for (const duplicate of countDuplicates(categories.map((category) => category.slug))) {
    addIssue(issues, "error", "duplicate-category-slug", "Category slugs must be unique.", duplicate);
  }

  for (const duplicate of countDuplicates(tools.map((tool) => tool.slug))) {
    addIssue(issues, "error", "duplicate-tool-slug", "Tool slugs must be unique.", duplicate);
  }

  for (const duplicate of countDuplicates(newsletterIssues.map((issue) => issue.slug))) {
    addIssue(issues, "error", "duplicate-newsletter-slug", "Newsletter issue slugs must be unique.", duplicate);
  }

  for (const duplicate of countDuplicates(editorialSources.map((source) => source.name))) {
    addIssue(issues, "error", "duplicate-editorial-source-name", "Editorial source names must be unique.", duplicate);
  }

  for (const duplicate of countDuplicates(editorialSources.map((source) => source.feedUrl))) {
    addIssue(issues, "error", "duplicate-editorial-feed-url", "Editorial source feed URLs must be unique.", duplicate);
  }

  for (const category of categories) {
    if (!category.name) {
      addIssue(issues, "error", "missing-category-name", "Category is missing a display name.", category.slug || "unknown category");
    }

    if (!category.slug || !slugPattern.test(category.slug)) {
      addIssue(issues, "error", "invalid-category-slug", "Category slug is missing or not URL-safe.", category.name || "unknown category");
    }

    if (!category.description) {
      addIssue(issues, "warning", "missing-category-description", "Category metadata needs a safe description fallback.", category.slug);
    } else if (category.description.length > 180) {
      addIssue(issues, "warning", "long-category-description", "Category description may be too long for metadata previews.", category.slug);
    }

    if (!category.subcategories.length) {
      addIssue(issues, "warning", "missing-category-subcategories", "Category has no subcategory filters.", category.slug);
    }
  }

  for (const tool of tools) {
    if (!tool.name) {
      addIssue(issues, "error", "missing-tool-name", "Tool is missing a display name.", tool.slug || "unknown tool");
    }

    if (!tool.slug || !slugPattern.test(tool.slug)) {
      addIssue(issues, "error", "invalid-tool-slug", "Tool slug is missing or not URL-safe.", tool.name || "unknown tool");
    }

    if (!tool.website || !isValidUrl(tool.website)) {
      addIssue(issues, "error", "invalid-tool-url", "Tool official website URL is missing or invalid.", tool.slug || tool.name);
    }

    if (!tool.categorySlug || !categorySlugs.has(tool.categorySlug)) {
      addIssue(issues, "error", "invalid-tool-category", "Tool references a missing category slug.", tool.slug || tool.name);
    }

    if (!tool.tagline) {
      addIssue(issues, "warning", "missing-tool-tagline", "Tool detail and card views need a short tagline.", tool.slug);
    }

    if (!tool.summary) {
      addIssue(issues, "warning", "missing-tool-summary", "Tool metadata needs a safe summary fallback.", tool.slug);
    } else if (tool.summary.length > 180) {
      addIssue(issues, "warning", "long-tool-summary", "Tool summary may be too long for metadata previews.", tool.slug);
    }

    if (!tool.subcategory) {
      addIssue(issues, "warning", "missing-tool-subcategory", "Tool filters and compare rows need a subcategory.", tool.slug);
    }

    if (!tool.pricing) {
      addIssue(issues, "warning", "missing-pricing-note", "Pricing filters need a pricing note or clear fallback.", tool.slug);
    } else {
      pricingTypeCounts[getPricingType(tool.pricing)] += 1;
    }

    if (typeof bestForBySlug[tool.slug] !== "string" || !String(bestForBySlug[tool.slug]).trim()) {
      addIssue(issues, "warning", "missing-best-for", "Tool cards and compare views need a best-for positioning note.", tool.slug);
    }

    if (riskyClaimPattern.test(`${tool.tagline} ${tool.summary}`)) {
      addIssue(issues, "warning", "unsupported-superlative", "Avoid absolute ranking or guarantee language unless backed by verified source data.", tool.slug);
    }
  }

  for (const category of categories) {
    const count = tools.filter((tool) => tool.categorySlug === category.slug).length;
    if (!count) {
      addIssue(issues, "warning", "empty-category", "Category has no tools. Keep only if intentional and documented.", category.slug);
    }
  }

  for (const issue of newsletterIssues) {
    if (!issue.title) {
      addIssue(issues, "error", "missing-newsletter-title", "Newsletter issue is missing a title.", issue.slug || "unknown issue");
    }

    if (!issue.slug || !slugPattern.test(issue.slug)) {
      addIssue(issues, "error", "invalid-newsletter-slug", "Newsletter issue slug is missing or not URL-safe.", issue.title || "unknown issue");
    }

    if (!issue.summary) {
      addIssue(issues, "error", "missing-newsletter-summary", "Newsletter issue is missing a summary for cards and metadata.", issue.slug || issue.title);
    }

    if (!issue.issueDate || Number.isNaN(new Date(`${issue.issueDate}T00:00:00.000Z`).getTime())) {
      addIssue(issues, "error", "invalid-newsletter-date", "Newsletter issue date is missing or invalid.", issue.slug || issue.title);
    }

    const linkedToolSlugs = new Set([...issue.featuredToolSlugs, ...issue.sections.flatMap((section) => section.toolSlugs)]);
    for (const toolSlug of linkedToolSlugs) {
      if (!toolSlugs.has(toolSlug)) {
        addIssue(issues, "error", "invalid-newsletter-tool-link", "Newsletter issue links to a missing tool slug.", `${issue.slug}:${toolSlug}`);
      }
    }

    const linkedCategorySlugs = new Set([...issue.featuredCategorySlugs, ...issue.sections.flatMap((section) => section.categorySlugs)]);
    for (const categorySlug of linkedCategorySlugs) {
      if (!categorySlugs.has(categorySlug)) {
        addIssue(issues, "error", "invalid-newsletter-category-link", "Newsletter issue links to a missing category slug.", `${issue.slug}:${categorySlug}`);
      }
    }

    if (issue.status !== "published" && hasText(sitemapSource, `/newsletter/${issue.slug}`)) {
      addIssue(issues, "error", "unpublished-newsletter-in-sitemap", "Unpublished newsletter issues should not appear in sitemap output.", issue.slug);
    }
  }

  for (const source of editorialSources) {
    if (!source.name) {
      addIssue(issues, "error", "missing-editorial-source-name", "Editorial source is missing a name.", source.feedUrl || "unknown source");
    }

    if (!source.feedUrl || !isValidUrl(source.feedUrl)) {
      addIssue(issues, "error", "invalid-editorial-feed-url", "Editorial source feed URL is missing or invalid.", source.name || "unknown source");
    }

    if (source.homepageUrl && !isValidUrl(source.homepageUrl)) {
      addIssue(issues, "error", "invalid-editorial-homepage-url", "Editorial source homepage URL is invalid.", source.name || source.feedUrl);
    }

    if (source.sourceType !== "rss") {
      addIssue(issues, "error", "unsupported-editorial-source-type", "Phase 10.2 supports RSS/Atom sources only.", source.name || source.feedUrl);
    }

    if (source.isActive && (!source.category || !source.language)) {
      addIssue(issues, "warning", "editorial-source-metadata-gap", "Active editorial sources should include category and language metadata.", source.name || source.feedUrl);
    }
  }

  const seedSource = readSource(seedPath);
  if (riskyClaimPattern.test(supabaseSeedSource)) {
    addIssue(issues, "warning", "unsupported-superlative-sql", "Supabase seed SQL still contains absolute ranking or guarantee language.", "supabase/seed.sql");
  } else {
    addIssue(issues, "info", "sql-superlative-copy-safe", "Supabase seed SQL avoids absolute best/#1/guarantee wording in copied summaries.", "supabase/seed.sql");
  }

  if (compliancePattern.test(`${seedSource}\n${supabaseSeedSource}`)) {
    addIssue(issues, "warning", "compliance-claim-review", "Compliance-like language exists in seed content and should be backed by visible evidence.", "src/lib/seed.ts");
  } else {
    addIssue(issues, "info", "no-compliance-claims", "No GDPR/compliance-style claims were found in seed content.", "src/lib/seed.ts + supabase/seed.sql");
  }

  if (hasText(structuredDataSource, "aggregateRating") || hasText(structuredDataSource, "review") || hasText(structuredDataSource, "offers")) {
    addIssue(issues, "warning", "json-ld-risk-fields", "Structured data includes rating, review, or offer fields; verify these are supported by real data.", "src/lib/seo/structured-data.ts");
  } else {
    addIssue(issues, "info", "json-ld-safe-fields", "Structured data avoids fake offers, ratings, and reviews.", "src/lib/seo/structured-data.ts");
  }

  if (hasText(structuredDataSource, "\"@type\": \"SoftwareApplication\"")) {
    addIssue(issues, "info", "software-application-json-ld", "Tool JSON-LD uses visible name, description, URL, category, and Web operating system only.", "src/lib/seo/structured-data.ts");
  }

  if (hasText(sitemapSource, "absoluteUrl(\"/tools\")")) {
    addIssue(issues, "info", "tools-in-sitemap", "/tools remains included in sitemap generation.", "src/app/sitemap.ts");
  } else {
    addIssue(issues, "warning", "tools-missing-from-sitemap", "/tools was not detected in sitemap generation.", "src/app/sitemap.ts");
  }

  if (hasText(sitemapSource, "getPublishedNewsletterIssues") && hasText(sitemapSource, "absoluteUrl(\"/newsletter\")")) {
    addIssue(issues, "info", "newsletter-in-sitemap", "/newsletter and published newsletter issues are included in sitemap generation.", "src/app/sitemap.ts");
  } else {
    addIssue(issues, "warning", "newsletter-missing-from-sitemap", "Newsletter archive or issue pages were not detected in sitemap generation.", "src/app/sitemap.ts");
  }

  if (hasText(sitemapSource, "absoluteUrl(\"/signals\")")) {
    addIssue(issues, "info", "signals-in-sitemap", "/signals remains included in sitemap generation.", "src/app/sitemap.ts");
  } else {
    addIssue(issues, "warning", "signals-missing-from-sitemap", "/signals was not detected in sitemap generation.", "src/app/sitemap.ts");
  }

  if (hasText(directoryFiltersSource, "return tool.lastVerifiedAt ?")) {
    addIssue(issues, "info", "last-verified-sort-fallback", "Last-verified sorting falls back to 0 for missing dates, keeping sparse seed data sortable.", "src/lib/directory-filters.ts");
  }

  if (hasText(contentSource, "No pricing note available yet") && hasText(contentSource, "No specific data caution has been added yet")) {
    addIssue(issues, "info", "compare-fallback-copy", "Compare and trust helpers include honest fallbacks for sparse pricing and data-caution fields.", "src/lib/content.ts");
  }

  addIssue(issues, "info", "derived-use-cases", "Practical use cases and alternatives are currently derived from tool/category context instead of stored as separate fields.");

  const counts: Record<Severity, number> = { error: 0, warning: 0, info: 0 };
  for (const issue of issues) {
    counts[issue.severity] += 1;
  }

  return {
    auditDate,
    scope: [
      "src/lib/seed.ts",
      "src/lib/newsletter/issues.ts",
      "src/lib/editorial/sources.ts",
      "supabase/seed.sql",
      "src/lib/content.ts",
      "src/lib/directory-filters.ts",
      "src/lib/seo/structured-data.ts",
      "src/app/sitemap.ts"
    ],
    categoryCount: categories.length,
    toolCount: tools.length,
    newsletterIssueCount: newsletterIssues.length,
    editorialSourceCount: editorialSources.length,
    activeEditorialSourceCount: editorialSources.filter((source) => source.isActive).length,
    counts,
    pricingTypeCounts,
    issues
  } satisfies AuditReport;
}

function toMarkdown(report: AuditReport) {
  const issueRows = report.issues
    .map((issue) => `| ${issue.severity} | ${issue.code} | ${issue.target ?? "-"} | ${issue.message.replace(/\|/g, "\\|")} |`)
    .join("\n");
  const pricingRows = Object.entries(report.pricingTypeCounts)
    .map(([type, count]) => `| ${type} | ${count} |`)
    .join("\n");

  return `# Generated Content Quality Audit

Audit date: ${report.auditDate}

## Summary

- Categories checked: ${report.categoryCount}
- Tools checked: ${report.toolCount}
- Newsletter issues checked: ${report.newsletterIssueCount}
- Editorial sources checked: ${report.editorialSourceCount}
- Active editorial sources: ${report.activeEditorialSourceCount}
- Errors: ${report.counts.error}
- Warnings: ${report.counts.warning}
- Info: ${report.counts.info}

## Scope

${report.scope.map((item) => `- ${item}`).join("\n")}

## Pricing Type Coverage

| Pricing type | Tool count |
| --- | ---: |
${pricingRows}

## Findings

| Severity | Code | Target | Message |
| --- | --- | --- | --- |
${issueRows || "| info | no-findings | - | No findings were emitted. |"}
`;
}

function writeReportFiles(report: AuditReport) {
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, "content-quality-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(docsDir, "content-quality-audit.generated.md"), toMarkdown(report));
}

const report = createReport();

console.log("Content quality audit");
console.log(`Date: ${report.auditDate}`);
console.log(`Tools: ${report.toolCount}`);
console.log(`Categories: ${report.categoryCount}`);
console.log(`Newsletter issues: ${report.newsletterIssueCount}`);
console.log(`Editorial sources: ${report.editorialSourceCount}`);
console.log(`Active editorial sources: ${report.activeEditorialSourceCount}`);
console.log(`Errors: ${report.counts.error}`);
console.log(`Warnings: ${report.counts.warning}`);
console.log(`Info: ${report.counts.info}`);

if (writeReports) {
  writeReportFiles(report);
  console.log("Wrote docs/content-quality-audit.json");
  console.log("Wrote docs/content-quality-audit.generated.md");
}

if (report.counts.error > 0) {
  process.exitCode = 1;
}
