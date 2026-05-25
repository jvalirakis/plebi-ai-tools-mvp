export type NewsletterIssueStatus = "published" | "draft";

export type NewsletterSection = {
  heading: string;
  body: string;
  toolSlugs?: string[];
  categorySlugs?: string[];
};

export type NewsletterIssue = {
  slug: string;
  title: string;
  subtitle: string;
  issueDate: string;
  summary: string;
  intro: string;
  executiveSummary: string[];
  sections: NewsletterSection[];
  featuredToolSlugs: string[];
  featuredCategorySlugs: string[];
  recommendations: string[];
  whatToTry: string[];
  whatToWatch: string[];
  hypeCheck: string[];
  curationNote: string;
  status: NewsletterIssueStatus;
};

export const newsletterIssues: NewsletterIssue[] = [
  {
    slug: "ai-tool-starter-stack",
    title: "AI Tool Starter Stack",
    subtitle: "A practical starting point for comparing writing, research, coding, and image tools.",
    issueDate: "2026-05-25",
    summary: "A practical starter stack for people comparing broad assistants, research tools, coding copilots, and visual ideation tools.",
    intro:
      "This brief is an evergreen starter map for teams and professionals who want to trial AI tools without turning the evaluation into a tool-shopping spiral.",
    executiveSummary: [
      "Start with one general assistant, one research tool, and one workflow-specific tool before expanding the stack.",
      "Use Plebi Score as a decision aid, then inspect evidence status, freshness, pricing notes, and source observations before adopting.",
      "Treat image and creative tools as workflow-specific choices because model freshness and control needs vary quickly."
    ],
    sections: [
      {
        heading: "Start with broad assistants",
        body:
          "General assistants may be useful for drafting, analysis, brainstorming, and workflow planning. Compare fit and evidence labels before standardizing across a team.",
        toolSlugs: ["chatgpt", "claude"],
        categorySlugs: ["writing-content"]
      },
      {
        heading: "Add research and coding depth",
        body:
          "A practical stack often needs a research layer and a developer layer. Check citation behavior, repository context, data handling, and pricing before relying on either.",
        toolSlugs: ["perplexity", "github-copilot"],
        categorySlugs: ["research-search", "coding-dev"]
      },
      {
        heading: "Use creative tools intentionally",
        body:
          "Image generation tools are better compared by creative control, production fit, brand-safety workflow, and evidence freshness than by a single broad winner claim.",
        toolSlugs: ["midjourney"],
        categorySlugs: ["image-generation"]
      }
    ],
    featuredToolSlugs: ["chatgpt", "claude", "perplexity", "github-copilot", "midjourney"],
    featuredCategorySlugs: ["writing-content", "research-search", "coding-dev", "image-generation"],
    recommendations: [
      "Shortlist by use case first, then use Plebi evidence and freshness labels to decide what deserves a trial.",
      "Check current pricing on official sites before procurement or team rollout.",
      "Prefer tools with clear source observations when the decision affects customer data, production workflows, or budget."
    ],
    whatToTry: [
      "Compare one general assistant against one specialist tool for a real task you already do weekly.",
      "Open the source breakdown for each shortlisted tool and note whether the evidence is current, partial, or manual seed data.",
      "Use the compare page before adding another tool to the stack."
    ],
    whatToWatch: [
      "Evidence freshness can matter more than raw score in fast-moving categories.",
      "Bundled assistants may reduce the need for separate point solutions.",
      "Team adoption depends on workflow fit, admin controls, and clear data-handling expectations."
    ],
    hypeCheck: [
      "A high score is not a procurement decision by itself.",
      "Avoid buying overlapping tools before you know which workflow each one improves.",
      "Seed-only or needs-review profiles should be treated as starting points for evaluation, not current market consensus."
    ],
    curationNote:
      "This issue uses Plebi's existing static tool and category dataset. It does not include live news, crawling, paid placement, fake ratings, or external benchmark claims.",
    status: "published"
  },
  {
    slug: "image-generation-tool-brief",
    title: "Image Generation Tool Brief",
    subtitle: "How to compare image tools by creative control, production fit, and workflow confidence.",
    issueDate: "2026-05-18",
    summary: "A category brief for comparing image generation tools without treating seeded rankings as current market consensus.",
    intro:
      "Image generation changes quickly, so this brief focuses on the decision criteria that remain useful even when individual model rankings need verification.",
    executiveSummary: [
      "Compare image tools by workflow fit: ideation, production assets, brand-safe editing, open-model control, or design integration.",
      "Freshness and evidence status should be checked before treating any image ranking as current.",
      "The right tool may differ for designers, marketers, developers, and teams with stricter review needs."
    ],
    sections: [
      {
        heading: "Creative control and iteration speed",
        body:
          "For creative exploration, compare how easily each tool helps a user refine style, composition, and prompt direction. Avoid assuming that one tool is universally strongest.",
        toolSlugs: ["midjourney", "ideogram", "leonardo-ai"],
        categorySlugs: ["image-generation"]
      },
      {
        heading: "Production and brand workflow",
        body:
          "For business use, brand-safe production, editing workflow, and current pricing context may matter more than novelty. Check official sites and visible evidence notes.",
        toolSlugs: ["adobe-firefly", "google-gemini-image"],
        categorySlugs: ["image-generation"]
      },
      {
        heading: "Open ecosystem and model choice",
        body:
          "Open or ecosystem-driven options may be useful when teams need more control over models, hosting, or customization. Review data and license implications separately.",
        toolSlugs: ["flux", "stable-diffusion"],
        categorySlugs: ["image-generation"]
      }
    ],
    featuredToolSlugs: ["midjourney", "google-gemini-image", "flux", "ideogram", "adobe-firefly", "stable-diffusion", "leonardo-ai"],
    featuredCategorySlugs: ["image-generation"],
    recommendations: [
      "Start from the image generation category page and filter by evidence and freshness before shortlisting.",
      "Use source breakdowns to separate manual seed notes from stronger source-backed signals.",
      "Check current pricing, usage rights, and production constraints on the official site before commercial use."
    ],
    whatToTry: [
      "Pick one ideation task and one production task, then compare how each tool fits both.",
      "Review profiles marked manual seed or needs review with extra caution.",
      "Compare at least two alternatives instead of relying on a single rank position."
    ],
    whatToWatch: [
      "Model naming and product packaging can shift faster than static directories update.",
      "Creative quality, editing control, and commercial safety may point to different tools.",
      "Evidence gaps should be visible rather than hidden behind a confident-looking score."
    ],
    hypeCheck: [
      "Do not treat seeded image rankings as current truth unless the evidence status supports it.",
      "A viral demo may not translate into repeatable production workflow value.",
      "A tool can be impressive for ideation and still need review for team or brand use."
    ],
    curationNote:
      "This brief uses Plebi's existing image-generation profiles and intentionally avoids live market claims or fabricated benchmarks.",
    status: "published"
  },
  {
    slug: "compare-before-you-adopt",
    title: "Compare Before You Adopt",
    subtitle: "A practical guide to using score inputs, evidence signals, pricing notes, and compare flows.",
    issueDate: "2026-05-11",
    summary: "A decision brief for using Plebi's score, evidence status, pricing context, and compare page before adopting an AI tool.",
    intro:
      "This brief frames Plebi as a decision workflow: browse broadly, shortlist by use case, inspect evidence, then compare practical tradeoffs before adoption.",
    executiveSummary: [
      "Use the score as a summary, not a substitute for source review.",
      "Look for mismatches between a tool's best-for note and the workflow you actually need.",
      "Compare alternatives in the same category before committing time, budget, or team training."
    ],
    sections: [
      {
        heading: "Browse by category first",
        body:
          "Categories help keep comparisons fair. A writing assistant, research engine, and coding copilot may all be useful, but they should not be judged by the same adoption criteria.",
        categorySlugs: ["writing-content", "research-search", "coding-dev"]
      },
      {
        heading: "Inspect the trust signals",
        body:
          "Before using a tool for sensitive or business-critical work, inspect freshness, evidence status, source notes, pricing context, and any data caution already shown on the tool page.",
        toolSlugs: ["chatgpt", "claude", "perplexity"]
      },
      {
        heading: "Use compare as the final screen",
        body:
          "The compare page is useful once you have a shortlist. It should help clarify tradeoffs rather than turn every tool into a generic score race.",
        toolSlugs: ["github-copilot", "cursor"],
        categorySlugs: ["coding-dev"]
      }
    ],
    featuredToolSlugs: ["chatgpt", "claude", "perplexity", "github-copilot", "cursor"],
    featuredCategorySlugs: ["writing-content", "research-search", "coding-dev", "productivity-ops"],
    recommendations: [
      "Define the job-to-be-done before comparing tools.",
      "Use evidence and freshness labels to decide how much confidence to place in a rank.",
      "Check current pricing and data-handling terms on the official site before rollout."
    ],
    whatToTry: [
      "Open one category page, choose three tools, then compare them side by side.",
      "Use best-for and not-ideal-for guidance to remove tools that do not match your workflow.",
      "Record the main strength and main caution for each shortlisted tool."
    ],
    whatToWatch: [
      "Tools with strong demos may still need evidence review for repeatable business use.",
      "Pricing, packaging, and included model access can change after a static profile is written.",
      "Evidence status should be revisited before team-wide adoption."
    ],
    hypeCheck: [
      "Do not assume an AI tool is useful just because it appears in many roundups.",
      "Avoid comparing tools across unrelated categories as if they solve the same problem.",
      "If source evidence is insufficient, treat the page as an evaluation prompt rather than a final recommendation."
    ],
    curationNote:
      "This issue uses existing Plebi directory fields and avoids fake ratings, reviews, current pricing claims, or compliance claims.",
    status: "published"
  }
];

function sortByIssueDateDesc(a: NewsletterIssue, b: NewsletterIssue) {
  return b.issueDate.localeCompare(a.issueDate) || a.title.localeCompare(b.title);
}

export function getPublishedNewsletterIssues() {
  return newsletterIssues.filter((issue) => issue.status === "published").sort(sortByIssueDateDesc);
}

export function getLatestNewsletterIssue() {
  return getPublishedNewsletterIssues()[0];
}

export function getNewsletterIssueBySlug(slug: string) {
  return getPublishedNewsletterIssues().find((issue) => issue.slug === slug);
}

export function formatIssueDate(issueDate: string) {
  const parsedDate = new Date(`${issueDate}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return issueDate;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(parsedDate);
}
