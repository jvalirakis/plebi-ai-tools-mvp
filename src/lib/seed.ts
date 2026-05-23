import { clampScore, getPollSentiment } from "@/lib/scoring";
import type { Category, MetricBreakdown, Source, SourceObservation, Tool } from "@/lib/types";

type ToolSeed = Omit<Tool, "bestFor" | "observations" | "scoreSnapshots">;

export const categories: Category[] = [
  {
    id: "cat-writing",
    slug: "writing-content",
    name: "Writing & Content",
    description: "Long-form drafting, brand copy, editorial workflows, and content operations.",
    subcategories: ["Writing assistant", "Marketing copy", "Editorial operations", "SEO content"],
    signal: "High saturation, strong workflow lock-in",
    benchmark: "Quality, controllability, team governance"
  },
  {
    id: "cat-image",
    slug: "image-generation",
    name: "Image Generation",
    description: "Visual ideation, production graphics, design assists, and brand-safe image creation.",
    subcategories: ["Text to image", "Creative production", "Design tooling", "Open models"],
    signal: "Rapid model churn and style differentiation",
    benchmark: "Prompt fidelity, commercial safety, iteration speed"
  },
  {
    id: "cat-video-audio",
    slug: "video-audio",
    name: "Video & Audio",
    description: "Video generation, voice synthesis, editing, dubbing, and media post-production.",
    subcategories: ["Video generation", "Voice AI", "Editing", "Avatar video"],
    signal: "Enterprise demand rising fastest",
    benchmark: "Output quality, editing control, rights posture"
  },
  {
    id: "cat-coding",
    slug: "coding-dev",
    name: "Coding & Dev",
    description: "AI coding assistants, agentic IDEs, code search, and developer productivity platforms.",
    subcategories: ["IDE assistant", "Code agent", "Code search", "Cloud dev"],
    signal: "High willingness to pay, security scrutiny",
    benchmark: "Context depth, code quality, repository safety"
  },
  {
    id: "cat-research",
    slug: "research-search",
    name: "Research & Search",
    description: "Answer engines, literature research, enterprise search, and evidence synthesis.",
    subcategories: ["Answer engine", "Academic research", "Enterprise search", "Citation synthesis"],
    signal: "Trust and citation quality decide adoption",
    benchmark: "Source quality, factuality, retrieval depth"
  },
  {
    id: "cat-productivity",
    slug: "productivity-ops",
    name: "Productivity & Ops",
    description: "Meeting intelligence, documents, workflow automation, and everyday business execution.",
    subcategories: ["Workspace AI", "Meetings", "Automation", "Presentations"],
    signal: "Bundled incumbents are compressing pricing",
    benchmark: "Workflow fit, admin controls, time saved"
  },
  {
    id: "cat-sales",
    slug: "sales-marketing",
    name: "Sales & Marketing",
    description: "Pipeline intelligence, outbound personalization, CRM copilots, and conversion optimization.",
    subcategories: ["CRM AI", "Outbound", "Email coaching", "Personalization"],
    signal: "ROI measurement matters more than novelty",
    benchmark: "Data enrichment, attribution, revenue impact"
  },
  {
    id: "cat-data",
    slug: "data-analytics",
    name: "Data & Analytics",
    description: "Natural-language analytics, forecasting, AutoML, and decision intelligence.",
    subcategories: ["BI copilot", "AutoML", "Data analyst", "Decision intelligence"],
    signal: "Governance and explainability shape enterprise use",
    benchmark: "Data grounding, model transparency, analyst velocity"
  }
];

export const sources: Source[] = [
  {
    id: "source-benchmark",
    name: "Plebi Benchmark Lab",
    type: "benchmark",
    url: "https://plebi.example/benchmarks",
    weight: 0.32,
    credibility: 94
  },
  {
    id: "source-operator",
    name: "Operator Panel",
    type: "review",
    url: "https://plebi.example/operator-panel",
    weight: 0.24,
    credibility: 88
  },
  {
    id: "source-community",
    name: "Verified User Poll",
    type: "community",
    url: "https://plebi.example/polls",
    weight: 0.18,
    credibility: 82
  },
  {
    id: "source-pricing",
    name: "Pricing & Packaging Audit",
    type: "pricing",
    url: "https://plebi.example/pricing",
    weight: 0.14,
    credibility: 84
  },
  {
    id: "source-trust",
    name: "Trust & Security Review",
    type: "security",
    url: "https://plebi.example/trust",
    weight: 0.12,
    credibility: 90
  }
];

const bestForBySlug: Record<string, string> = {
  "chatgpt": "Teams that need one flexible assistant for writing, analysis, and multimodal work.",
  "claude": "Long-context writing, research synthesis, and careful editorial collaboration.",
  "jasper": "Marketing teams that need brand-controlled campaign content at scale.",
  "copy-ai": "Go-to-market teams standardizing repeatable sales and marketing copy workflows.",
  "writesonic": "Content teams producing search-oriented articles and template-driven assets.",
  "midjourney": "Creative teams prioritizing distinctive visual quality and art direction.",
  "dall-e": "Teams that want simple image generation inside a broader AI assistant workflow.",
  "stable-diffusion": "Technical teams that need controllable, customizable image generation pipelines.",
  "adobe-firefly": "Design organizations that need commercial safety and Adobe workflow integration.",
  "leonardo-ai": "Game, product, and content teams creating fast visual variants.",
  "runway": "Creative teams making AI-assisted video concepts and production edits.",
  "synthesia": "Businesses producing governed training, enablement, and localized avatar video.",
  "descript": "Podcast, education, and video teams editing media through transcripts.",
  "elevenlabs": "Teams producing realistic narration, dubbing, and voice experiences.",
  "pika": "Creators testing short-form motion ideas with low setup overhead.",
  "github-copilot": "Engineering teams that want broad IDE coverage and enterprise controls.",
  "cursor": "Developers who want an AI-native editor with repository-aware assistance.",
  "replit-agent": "Builders shipping prototypes and small apps in a hosted coding workspace.",
  "codeium": "Teams evaluating code assistance with cost sensitivity and editor flexibility.",
  "sourcegraph-cody": "Organizations working across large codebases, migrations, and code search.",
  "perplexity": "Researchers who need fast answers with visible web citations.",
  "elicit": "Analysts and academics running structured literature review workflows.",
  "consensus": "Users validating claims against scientific literature and citations.",
  "glean": "Larger companies unifying enterprise search and workplace knowledge.",
  "you-com": "Users comparing AI search modes for research and productivity.",
  "notion-ai": "Teams already running docs, notes, and projects in Notion.",
  "grammarly": "Organizations improving business communication quality across many users.",
  "otter-ai": "Teams that need searchable meeting records, summaries, and action items.",
  "zapier-ai": "Operations teams automating repeatable cross-app business processes.",
  "gamma": "Teams creating fast briefings, decks, and shareable narrative assets.",
  "hubspot-breeze": "HubSpot customers adding AI to CRM, support, and revenue workflows.",
  "clay": "Modern revenue teams building enrichment and personalized outbound systems.",
  "apollo-ai": "Sales teams consolidating prospect data, sequencing, and messaging.",
  "lavender": "Sales reps and managers improving outbound email quality.",
  "mutiny": "B2B marketers personalizing website conversion paths by segment.",
  "tableau-pulse": "Tableau and Salesforce teams adopting proactive metric insights.",
  "julius-ai": "Individuals and teams analyzing spreadsheets, charts, and uploaded data.",
  "akkio": "Business teams building no-code predictive analytics and forecasts.",
  "datarobot": "Enterprise teams that need governed model development and monitoring.",
  "thoughtspot-sage": "Organizations offering natural-language BI on governed business data."
};

const toolSeeds: ToolSeed[] = [
  {
    id: "tool-chatgpt",
    slug: "chatgpt",
    name: "ChatGPT",
    categorySlug: "writing-content",
    subcategory: "Writing assistant",
    tagline: "General-purpose AI assistant with strong writing, analysis, and multimodal coverage.",
    summary: "Best fit for teams that want one flexible assistant across drafting, synthesis, ideation, and internal knowledge workflows.",
    website: "https://chatgpt.com",
    pricing: "Free, Plus, Team, Enterprise",
    founded: "2022",
    stage: "Established",
    metrics: { capability: 94, usability: 91, reliability: 88, value: 86, adoption: 96 },
    poll: { toolId: "tool-chatgpt", votesFor: 4360, votesAgainst: 514 }
  },
  {
    id: "tool-claude",
    slug: "claude",
    name: "Claude",
    categorySlug: "writing-content",
    subcategory: "Writing assistant",
    tagline: "High-context assistant favored for careful writing, analysis, and team research.",
    summary: "Strong for users who need polished reasoning, long context handling, and lower-friction editorial collaboration.",
    website: "https://claude.ai",
    pricing: "Free, Pro, Team, Enterprise",
    founded: "2023",
    stage: "Established",
    metrics: { capability: 93, usability: 89, reliability: 90, value: 84, adoption: 88 },
    poll: { toolId: "tool-claude", votesFor: 3212, votesAgainst: 388 }
  },
  {
    id: "tool-jasper",
    slug: "jasper",
    name: "Jasper",
    categorySlug: "writing-content",
    subcategory: "Marketing copy",
    tagline: "Brand-controlled marketing content platform for campaigns and content operations.",
    summary: "Built for marketing teams that need governance, repeatable campaign assets, and brand voice management.",
    website: "https://www.jasper.ai",
    pricing: "Creator, Pro, Business",
    founded: "2021",
    stage: "Established",
    metrics: { capability: 82, usability: 84, reliability: 83, value: 72, adoption: 80 },
    poll: { toolId: "tool-jasper", votesFor: 1058, votesAgainst: 298 }
  },
  {
    id: "tool-copy-ai",
    slug: "copy-ai",
    name: "Copy.ai",
    categorySlug: "writing-content",
    subcategory: "Marketing copy",
    tagline: "Go-to-market content automation for repeatable sales and marketing workflows.",
    summary: "Useful for teams standardizing outbound, social, and launch copy through workflow templates.",
    website: "https://www.copy.ai",
    pricing: "Free, Starter, Advanced",
    founded: "2020",
    stage: "Scaling",
    metrics: { capability: 78, usability: 83, reliability: 78, value: 77, adoption: 74 },
    poll: { toolId: "tool-copy-ai", votesFor: 814, votesAgainst: 246 }
  },
  {
    id: "tool-writesonic",
    slug: "writesonic",
    name: "Writesonic",
    categorySlug: "writing-content",
    subcategory: "SEO content",
    tagline: "Content and SEO writing suite with article, chatbot, and brand workflow coverage.",
    summary: "A pragmatic choice for content teams optimizing for search-oriented volume and template coverage.",
    website: "https://writesonic.com",
    pricing: "Free, Individual, Standard",
    founded: "2021",
    stage: "Scaling",
    metrics: { capability: 76, usability: 80, reliability: 75, value: 79, adoption: 71 },
    poll: { toolId: "tool-writesonic", votesFor: 696, votesAgainst: 244 }
  },
  {
    id: "tool-midjourney",
    slug: "midjourney",
    name: "Midjourney",
    categorySlug: "image-generation",
    subcategory: "Text to image",
    tagline: "Highly distinctive image generation with strong aesthetics and creative direction.",
    summary: "Best for concept art, moodboards, editorial visuals, and teams prioritizing visual quality over workflow integration.",
    website: "https://www.midjourney.com",
    pricing: "Basic, Standard, Pro, Mega",
    founded: "2022",
    stage: "Established",
    metrics: { capability: 94, usability: 78, reliability: 86, value: 81, adoption: 92 },
    poll: { toolId: "tool-midjourney", votesFor: 2880, votesAgainst: 302 }
  },
  {
    id: "tool-dall-e",
    slug: "dall-e",
    name: "DALL-E",
    categorySlug: "image-generation",
    subcategory: "Text to image",
    tagline: "Image generation integrated into a broad assistant and developer ecosystem.",
    summary: "Strong for users who need convenient image creation inside a general AI workflow with simple prompting.",
    website: "https://openai.com/dall-e",
    pricing: "Bundled and API usage",
    founded: "2021",
    stage: "Established",
    metrics: { capability: 88, usability: 90, reliability: 84, value: 82, adoption: 88 },
    poll: { toolId: "tool-dall-e", votesFor: 2196, votesAgainst: 358 }
  },
  {
    id: "tool-stable-diffusion",
    slug: "stable-diffusion",
    name: "Stable Diffusion",
    categorySlug: "image-generation",
    subcategory: "Open models",
    tagline: "Open image generation ecosystem with broad model, hosting, and customization options.",
    summary: "Best for technical teams that want control, extensibility, and custom visual pipelines.",
    website: "https://stability.ai",
    pricing: "Open models and platform plans",
    founded: "2022",
    stage: "Established",
    metrics: { capability: 87, usability: 72, reliability: 78, value: 90, adoption: 86 },
    poll: { toolId: "tool-stable-diffusion", votesFor: 2108, votesAgainst: 486 }
  },
  {
    id: "tool-adobe-firefly",
    slug: "adobe-firefly",
    name: "Adobe Firefly",
    categorySlug: "image-generation",
    subcategory: "Design tooling",
    tagline: "Commercially oriented generative media built into Adobe creative workflows.",
    summary: "A strong enterprise option where brand safety, rights posture, and designer workflow integration are central.",
    website: "https://www.adobe.com/products/firefly.html",
    pricing: "Included with Adobe plans and credit packs",
    founded: "2023",
    stage: "Established",
    metrics: { capability: 83, usability: 88, reliability: 87, value: 75, adoption: 84 },
    poll: { toolId: "tool-adobe-firefly", votesFor: 1508, votesAgainst: 364 }
  },
  {
    id: "tool-leonardo-ai",
    slug: "leonardo-ai",
    name: "Leonardo AI",
    categorySlug: "image-generation",
    subcategory: "Creative production",
    tagline: "Creative image and asset generation platform with production-friendly controls.",
    summary: "Useful for game, product, and content teams needing rapid visual variants and style consistency.",
    website: "https://leonardo.ai",
    pricing: "Free, Apprentice, Artisan, Maestro",
    founded: "2022",
    stage: "Scaling",
    metrics: { capability: 82, usability: 82, reliability: 79, value: 83, adoption: 76 },
    poll: { toolId: "tool-leonardo-ai", votesFor: 1004, votesAgainst: 268 }
  },
  {
    id: "tool-runway",
    slug: "runway",
    name: "Runway",
    categorySlug: "video-audio",
    subcategory: "Video generation",
    tagline: "Generative video and creative editing suite for professional media workflows.",
    summary: "Strong for teams creating video concepts, campaign assets, and AI-assisted edits with increasing control.",
    website: "https://runwayml.com",
    pricing: "Free, Standard, Pro, Unlimited, Enterprise",
    founded: "2018",
    stage: "Established",
    metrics: { capability: 90, usability: 84, reliability: 80, value: 78, adoption: 86 },
    poll: { toolId: "tool-runway", votesFor: 1768, votesAgainst: 342 }
  },
  {
    id: "tool-synthesia",
    slug: "synthesia",
    name: "Synthesia",
    categorySlug: "video-audio",
    subcategory: "Avatar video",
    tagline: "Enterprise avatar video platform for training, enablement, and localization.",
    summary: "Best when repeatable business video, governance, and localization matter more than cinematic generation.",
    website: "https://www.synthesia.io",
    pricing: "Starter, Creator, Enterprise",
    founded: "2017",
    stage: "Established",
    metrics: { capability: 84, usability: 88, reliability: 87, value: 76, adoption: 82 },
    poll: { toolId: "tool-synthesia", votesFor: 1114, votesAgainst: 242 }
  },
  {
    id: "tool-descript",
    slug: "descript",
    name: "Descript",
    categorySlug: "video-audio",
    subcategory: "Editing",
    tagline: "Text-based audio and video editor with transcription, cleanup, and overdub workflows.",
    summary: "A strong fit for podcasts, customer education, and lightweight video operations.",
    website: "https://www.descript.com",
    pricing: "Free, Hobbyist, Creator, Business, Enterprise",
    founded: "2017",
    stage: "Established",
    metrics: { capability: 82, usability: 90, reliability: 84, value: 83, adoption: 80 },
    poll: { toolId: "tool-descript", votesFor: 1240, votesAgainst: 218 }
  },
  {
    id: "tool-elevenlabs",
    slug: "elevenlabs",
    name: "ElevenLabs",
    categorySlug: "video-audio",
    subcategory: "Voice AI",
    tagline: "Voice synthesis, dubbing, and audio generation with high perceived realism.",
    summary: "Best for teams producing narration, localization, and voice interfaces with quality-sensitive output.",
    website: "https://elevenlabs.io",
    pricing: "Free, Starter, Creator, Pro, Scale, Business",
    founded: "2022",
    stage: "Established",
    metrics: { capability: 91, usability: 86, reliability: 84, value: 82, adoption: 85 },
    poll: { toolId: "tool-elevenlabs", votesFor: 1712, votesAgainst: 198 }
  },
  {
    id: "tool-pika",
    slug: "pika",
    name: "Pika",
    categorySlug: "video-audio",
    subcategory: "Video generation",
    tagline: "Fast AI video generation for short-form visual experimentation.",
    summary: "Good for creative teams testing motion ideas and social video concepts with a lower setup burden.",
    website: "https://pika.art",
    pricing: "Free, Standard, Pro, Fancy",
    founded: "2023",
    stage: "Scaling",
    metrics: { capability: 78, usability: 83, reliability: 73, value: 80, adoption: 76 },
    poll: { toolId: "tool-pika", votesFor: 886, votesAgainst: 286 }
  },
  {
    id: "tool-github-copilot",
    slug: "github-copilot",
    name: "GitHub Copilot",
    categorySlug: "coding-dev",
    subcategory: "IDE assistant",
    tagline: "Developer assistant embedded in common code editors and GitHub workflows.",
    summary: "A default option for engineering teams that want broad IDE coverage and enterprise controls.",
    website: "https://github.com/features/copilot",
    pricing: "Individual, Business, Enterprise",
    founded: "2021",
    stage: "Established",
    metrics: { capability: 88, usability: 91, reliability: 85, value: 83, adoption: 95 },
    poll: { toolId: "tool-github-copilot", votesFor: 3504, votesAgainst: 466 }
  },
  {
    id: "tool-cursor",
    slug: "cursor",
    name: "Cursor",
    categorySlug: "coding-dev",
    subcategory: "IDE assistant",
    tagline: "AI-native code editor focused on repository-aware coding and agentic edits.",
    summary: "Strong for individual developers and teams that want deep context inside a fast AI-first IDE.",
    website: "https://cursor.com",
    pricing: "Free, Pro, Business",
    founded: "2023",
    stage: "Scaling",
    metrics: { capability: 91, usability: 89, reliability: 82, value: 84, adoption: 87 },
    poll: { toolId: "tool-cursor", votesFor: 2746, votesAgainst: 320 }
  },
  {
    id: "tool-replit-agent",
    slug: "replit-agent",
    name: "Replit Agent",
    categorySlug: "coding-dev",
    subcategory: "Code agent",
    tagline: "Cloud development agent for building, running, and iterating on software projects.",
    summary: "Best for rapid prototypes, learning, and shipping small apps in a hosted development environment.",
    website: "https://replit.com",
    pricing: "Starter, Replit Core, Teams",
    founded: "2024",
    stage: "Scaling",
    metrics: { capability: 82, usability: 86, reliability: 76, value: 80, adoption: 78 },
    poll: { toolId: "tool-replit-agent", votesFor: 1030, votesAgainst: 312 }
  },
  {
    id: "tool-codeium",
    slug: "codeium",
    name: "Codeium",
    categorySlug: "coding-dev",
    subcategory: "IDE assistant",
    tagline: "Code completion and chat assistant with accessible pricing and enterprise options.",
    summary: "Appealing to teams evaluating coding assistance with cost sensitivity and broad editor support.",
    website: "https://codeium.com",
    pricing: "Individual, Teams, Enterprise",
    founded: "2021",
    stage: "Scaling",
    metrics: { capability: 80, usability: 83, reliability: 80, value: 88, adoption: 74 },
    poll: { toolId: "tool-codeium", votesFor: 918, votesAgainst: 234 }
  },
  {
    id: "tool-sourcegraph-cody",
    slug: "sourcegraph-cody",
    name: "Sourcegraph Cody",
    categorySlug: "coding-dev",
    subcategory: "Code search",
    tagline: "Code AI assistant built around repository search and large codebase context.",
    summary: "Strong for organizations where code understanding, migration, and repository-scale context are key.",
    website: "https://sourcegraph.com/cody",
    pricing: "Free, Pro, Enterprise",
    founded: "2023",
    stage: "Scaling",
    metrics: { capability: 81, usability: 78, reliability: 82, value: 79, adoption: 70 },
    poll: { toolId: "tool-sourcegraph-cody", votesFor: 676, votesAgainst: 196 }
  },
  {
    id: "tool-perplexity",
    slug: "perplexity",
    name: "Perplexity",
    categorySlug: "research-search",
    subcategory: "Answer engine",
    tagline: "AI answer engine with citations, web retrieval, and research-focused responses.",
    summary: "Best for users who want quick synthesis with visible sources and a lower-friction search workflow.",
    website: "https://www.perplexity.ai",
    pricing: "Free, Pro, Enterprise Pro",
    founded: "2022",
    stage: "Established",
    metrics: { capability: 88, usability: 90, reliability: 83, value: 86, adoption: 88 },
    poll: { toolId: "tool-perplexity", votesFor: 2708, votesAgainst: 302 }
  },
  {
    id: "tool-elicit",
    slug: "elicit",
    name: "Elicit",
    categorySlug: "research-search",
    subcategory: "Academic research",
    tagline: "Research assistant for literature review, paper discovery, and evidence extraction.",
    summary: "Useful for researchers and analysts who need structured evidence workflows rather than general answers.",
    website: "https://elicit.com",
    pricing: "Basic, Plus, Pro, Enterprise",
    founded: "2020",
    stage: "Scaling",
    metrics: { capability: 82, usability: 80, reliability: 84, value: 78, adoption: 70 },
    poll: { toolId: "tool-elicit", votesFor: 734, votesAgainst: 176 }
  },
  {
    id: "tool-consensus",
    slug: "consensus",
    name: "Consensus",
    categorySlug: "research-search",
    subcategory: "Citation synthesis",
    tagline: "Evidence search engine focused on scientific claims and literature-backed answers.",
    summary: "Best for users validating claims against research literature with clearer citation context.",
    website: "https://consensus.app",
    pricing: "Free, Premium, Teams",
    founded: "2021",
    stage: "Scaling",
    metrics: { capability: 80, usability: 82, reliability: 83, value: 80, adoption: 68 },
    poll: { toolId: "tool-consensus", votesFor: 622, votesAgainst: 154 }
  },
  {
    id: "tool-glean",
    slug: "glean",
    name: "Glean",
    categorySlug: "research-search",
    subcategory: "Enterprise search",
    tagline: "Enterprise AI search and knowledge assistant across workplace applications.",
    summary: "A strong option for larger companies consolidating knowledge discovery and assistant workflows.",
    website: "https://www.glean.com",
    pricing: "Enterprise",
    founded: "2019",
    stage: "Established",
    metrics: { capability: 86, usability: 84, reliability: 88, value: 74, adoption: 79 },
    poll: { toolId: "tool-glean", votesFor: 812, votesAgainst: 182 }
  },
  {
    id: "tool-you-com",
    slug: "you-com",
    name: "You.com",
    categorySlug: "research-search",
    subcategory: "Answer engine",
    tagline: "AI search and assistant platform for web answers, research, and productivity modes.",
    summary: "Useful for users comparing answer styles and wanting an AI search workflow with configurable modes.",
    website: "https://you.com",
    pricing: "Free, Pro, Team",
    founded: "2020",
    stage: "Scaling",
    metrics: { capability: 76, usability: 80, reliability: 76, value: 82, adoption: 66 },
    poll: { toolId: "tool-you-com", votesFor: 510, votesAgainst: 192 }
  },
  {
    id: "tool-notion-ai",
    slug: "notion-ai",
    name: "Notion AI",
    categorySlug: "productivity-ops",
    subcategory: "Workspace AI",
    tagline: "AI writing, search, and synthesis embedded inside the Notion workspace.",
    summary: "Best for teams already using Notion for notes, documentation, projects, and internal knowledge.",
    website: "https://www.notion.com/product/ai",
    pricing: "Add-on and bundled business plans",
    founded: "2023",
    stage: "Established",
    metrics: { capability: 80, usability: 89, reliability: 82, value: 78, adoption: 84 },
    poll: { toolId: "tool-notion-ai", votesFor: 1462, votesAgainst: 314 }
  },
  {
    id: "tool-grammarly",
    slug: "grammarly",
    name: "Grammarly",
    categorySlug: "productivity-ops",
    subcategory: "Workspace AI",
    tagline: "Writing assistance and communication quality platform with AI drafting features.",
    summary: "Strong for broad business communication, policy-aware writing, and organization-wide deployment.",
    website: "https://www.grammarly.com",
    pricing: "Free, Pro, Business, Enterprise",
    founded: "2009",
    stage: "Established",
    metrics: { capability: 78, usability: 92, reliability: 90, value: 80, adoption: 91 },
    poll: { toolId: "tool-grammarly", votesFor: 2508, votesAgainst: 384 }
  },
  {
    id: "tool-otter-ai",
    slug: "otter-ai",
    name: "Otter.ai",
    categorySlug: "productivity-ops",
    subcategory: "Meetings",
    tagline: "Meeting transcription, summaries, and conversation intelligence for business teams.",
    summary: "Useful when recurring meetings need searchable records, action items, and lightweight summaries.",
    website: "https://otter.ai",
    pricing: "Basic, Pro, Business, Enterprise",
    founded: "2016",
    stage: "Established",
    metrics: { capability: 76, usability: 86, reliability: 82, value: 82, adoption: 78 },
    poll: { toolId: "tool-otter-ai", votesFor: 924, votesAgainst: 222 }
  },
  {
    id: "tool-zapier-ai",
    slug: "zapier-ai",
    name: "Zapier AI",
    categorySlug: "productivity-ops",
    subcategory: "Automation",
    tagline: "Automation builder with AI-assisted workflow creation across business apps.",
    summary: "Best for operations teams turning repeatable cross-app processes into maintainable automations.",
    website: "https://zapier.com/ai",
    pricing: "Free, Professional, Team, Enterprise",
    founded: "2023",
    stage: "Established",
    metrics: { capability: 82, usability: 84, reliability: 86, value: 82, adoption: 88 },
    poll: { toolId: "tool-zapier-ai", votesFor: 1546, votesAgainst: 278 }
  },
  {
    id: "tool-gamma",
    slug: "gamma",
    name: "Gamma",
    categorySlug: "productivity-ops",
    subcategory: "Presentations",
    tagline: "AI presentation and document creation platform for fast narrative assets.",
    summary: "A good fit for teams creating briefings, decks, and shareable content with less manual formatting.",
    website: "https://gamma.app",
    pricing: "Free, Plus, Pro",
    founded: "2022",
    stage: "Scaling",
    metrics: { capability: 78, usability: 88, reliability: 78, value: 84, adoption: 76 },
    poll: { toolId: "tool-gamma", votesFor: 1008, votesAgainst: 216 }
  },
  {
    id: "tool-hubspot-breeze",
    slug: "hubspot-breeze",
    name: "HubSpot Breeze",
    categorySlug: "sales-marketing",
    subcategory: "CRM AI",
    tagline: "HubSpot's AI layer for CRM insights, content, support, and revenue workflows.",
    summary: "Best for HubSpot customers looking to add AI assistance without leaving the CRM operating system.",
    website: "https://www.hubspot.com/products/artificial-intelligence",
    pricing: "Bundled across HubSpot hubs",
    founded: "2024",
    stage: "Established",
    metrics: { capability: 80, usability: 86, reliability: 84, value: 78, adoption: 83 },
    poll: { toolId: "tool-hubspot-breeze", votesFor: 816, votesAgainst: 206 }
  },
  {
    id: "tool-clay",
    slug: "clay",
    name: "Clay",
    categorySlug: "sales-marketing",
    subcategory: "Outbound",
    tagline: "AI-assisted data enrichment and outbound workflow builder for go-to-market teams.",
    summary: "Strong for modern revenue teams that want flexible prospecting, enrichment, and personalization workflows.",
    website: "https://www.clay.com",
    pricing: "Free, Starter, Explorer, Pro, Enterprise",
    founded: "2017",
    stage: "Scaling",
    metrics: { capability: 87, usability: 80, reliability: 82, value: 82, adoption: 79 },
    poll: { toolId: "tool-clay", votesFor: 1102, votesAgainst: 218 }
  },
  {
    id: "tool-apollo-ai",
    slug: "apollo-ai",
    name: "Apollo AI",
    categorySlug: "sales-marketing",
    subcategory: "Outbound",
    tagline: "Sales intelligence and engagement platform with AI-assisted prospecting and messaging.",
    summary: "Useful for teams consolidating prospect data, sequencing, and AI-assisted sales execution.",
    website: "https://www.apollo.io",
    pricing: "Free, Basic, Professional, Organization",
    founded: "2023",
    stage: "Established",
    metrics: { capability: 81, usability: 82, reliability: 82, value: 84, adoption: 86 },
    poll: { toolId: "tool-apollo-ai", votesFor: 1348, votesAgainst: 284 }
  },
  {
    id: "tool-lavender",
    slug: "lavender",
    name: "Lavender",
    categorySlug: "sales-marketing",
    subcategory: "Email coaching",
    tagline: "AI email coach for sales reps focused on improving outbound message quality.",
    summary: "Best for teams that need targeted coaching and feedback inside seller communication workflows.",
    website: "https://www.lavender.ai",
    pricing: "Free, Individual Pro, Teams",
    founded: "2020",
    stage: "Scaling",
    metrics: { capability: 76, usability: 85, reliability: 79, value: 80, adoption: 68 },
    poll: { toolId: "tool-lavender", votesFor: 532, votesAgainst: 156 }
  },
  {
    id: "tool-mutiny",
    slug: "mutiny",
    name: "Mutiny",
    categorySlug: "sales-marketing",
    subcategory: "Personalization",
    tagline: "Website personalization platform using AI-assisted targeting and content adaptation.",
    summary: "Strong for B2B marketing teams optimizing conversion paths across segments and accounts.",
    website: "https://www.mutinyhq.com",
    pricing: "Custom",
    founded: "2018",
    stage: "Scaling",
    metrics: { capability: 78, usability: 77, reliability: 80, value: 72, adoption: 64 },
    poll: { toolId: "tool-mutiny", votesFor: 398, votesAgainst: 142 }
  },
  {
    id: "tool-tableau-pulse",
    slug: "tableau-pulse",
    name: "Tableau Pulse",
    categorySlug: "data-analytics",
    subcategory: "BI copilot",
    tagline: "AI-powered analytics experience embedded in the Tableau and Salesforce ecosystem.",
    summary: "Best for organizations already invested in Tableau that want proactive metrics and guided insights.",
    website: "https://www.tableau.com/products/tableau-pulse",
    pricing: "Tableau and Salesforce plans",
    founded: "2024",
    stage: "Established",
    metrics: { capability: 82, usability: 80, reliability: 86, value: 74, adoption: 78 },
    poll: { toolId: "tool-tableau-pulse", votesFor: 610, votesAgainst: 164 }
  },
  {
    id: "tool-julius-ai",
    slug: "julius-ai",
    name: "Julius AI",
    categorySlug: "data-analytics",
    subcategory: "Data analyst",
    tagline: "AI data analyst for spreadsheets, charts, statistical questions, and quick analysis.",
    summary: "A useful lightweight analyst for individuals and teams working with uploaded files and fast questions.",
    website: "https://julius.ai",
    pricing: "Free, Essential, Pro",
    founded: "2023",
    stage: "Scaling",
    metrics: { capability: 80, usability: 84, reliability: 76, value: 84, adoption: 70 },
    poll: { toolId: "tool-julius-ai", votesFor: 656, votesAgainst: 176 }
  },
  {
    id: "tool-akkio",
    slug: "akkio",
    name: "Akkio",
    categorySlug: "data-analytics",
    subcategory: "AutoML",
    tagline: "No-code predictive analytics and AI data preparation platform for business teams.",
    summary: "Best for teams that want accessible forecasting and predictive workflows without heavy data science setup.",
    website: "https://www.akkio.com",
    pricing: "Basic, Professional, Business",
    founded: "2019",
    stage: "Scaling",
    metrics: { capability: 78, usability: 82, reliability: 78, value: 80, adoption: 62 },
    poll: { toolId: "tool-akkio", votesFor: 420, votesAgainst: 128 }
  },
  {
    id: "tool-datarobot",
    slug: "datarobot",
    name: "DataRobot",
    categorySlug: "data-analytics",
    subcategory: "AutoML",
    tagline: "Enterprise AI platform for model building, governance, monitoring, and decision automation.",
    summary: "Strong for regulated or mature organizations that need governed AI delivery across complex environments.",
    website: "https://www.datarobot.com",
    pricing: "Enterprise",
    founded: "2012",
    stage: "Established",
    metrics: { capability: 86, usability: 74, reliability: 88, value: 70, adoption: 76 },
    poll: { toolId: "tool-datarobot", votesFor: 638, votesAgainst: 174 }
  },
  {
    id: "tool-thoughtspot-sage",
    slug: "thoughtspot-sage",
    name: "ThoughtSpot Sage",
    categorySlug: "data-analytics",
    subcategory: "BI copilot",
    tagline: "Natural-language analytics and AI-assisted BI exploration for business users.",
    summary: "Useful for organizations that want searchable analytics experiences with governed business data.",
    website: "https://www.thoughtspot.com",
    pricing: "Essentials, Pro, Enterprise",
    founded: "2023",
    stage: "Established",
    metrics: { capability: 80, usability: 81, reliability: 84, value: 74, adoption: 68 },
    poll: { toolId: "tool-thoughtspot-sage", votesFor: 514, votesAgainst: 146 }
  }
];

const observationTitles = [
  "Capability benchmark",
  "Operator workflow review",
  "Verified user poll readout",
  "Pricing and packaging audit",
  "Trust and security review"
];

const sourceMetricPairs: Array<[keyof MetricBreakdown, keyof MetricBreakdown]> = [
  ["capability", "reliability"],
  ["usability", "capability"],
  ["adoption", "usability"],
  ["value", "usability"],
  ["reliability", "adoption"]
];

function hashOffset(seed: string, index: number) {
  const total = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ((total + index * 19) % 13) - 6;
}

function makeObservation(tool: ToolSeed, source: Source, index: number): SourceObservation {
  const [primary, secondary] = sourceMetricPairs[index];
  const score = clampScore(tool.metrics[primary] * 0.62 + tool.metrics[secondary] * 0.28 + source.credibility * 0.1 + hashOffset(tool.id, index));
  const confidence = Math.min(0.98, Math.max(0.64, source.credibility / 100 - index * 0.015 + hashOffset(tool.slug, index) / 120));

  return {
    id: `${tool.id}-${source.id}`,
    toolId: tool.id,
    sourceId: source.id,
    sourceName: source.name,
    sourceType: source.type,
    sourceUrl: source.url,
    sourceWeight: source.weight,
    title: observationTitles[index],
    observedAt: `2026-0${((index + tool.slug.length) % 4) + 1}-${String(((tool.name.length + index * 4) % 23) + 3).padStart(2, "0")}`,
    score,
    confidence: Number(confidence.toFixed(2)),
    metricImpacts: {
      [primary]: tool.metrics[primary],
      [secondary]: tool.metrics[secondary]
    },
    notes: `${tool.name} scored strongest on ${primary} with supporting signal from ${secondary}. Confidence reflects source credibility, sample depth, and recency.`
  };
}

function estimateScore(tool: ToolSeed) {
  const metricScore =
    tool.metrics.capability * 0.25 +
    tool.metrics.usability * 0.18 +
    tool.metrics.reliability * 0.18 +
    tool.metrics.value * 0.16 +
    tool.metrics.adoption * 0.13;
  const normalizedMetricScore = metricScore / 0.9;
  const sourceSignal = sources.slice(0, 5).reduce((total, source, index) => {
    const [primary, secondary] = sourceMetricPairs[index];
    return total + (tool.metrics[primary] * 0.7 + tool.metrics[secondary] * 0.3) * source.weight;
  }, 0);

  return clampScore(normalizedMetricScore * 0.7 + sourceSignal * 0.2 + getPollSentiment(tool) * 0.1);
}

export const tools: Tool[] = toolSeeds.map((tool, index) => {
  const score = estimateScore(tool);
  return {
    ...tool,
    bestFor: bestForBySlug[tool.slug],
    observations: sources.map((source, sourceIndex) => makeObservation(tool, source, sourceIndex)),
    scoreSnapshots: [
      {
        id: `${tool.id}-snapshot-q1`,
        toolId: tool.id,
        capturedAt: "2026-01-15",
        score: clampScore(score - 2 - (index % 3)),
        reason: "Initial Plebi benchmark import"
      },
      {
        id: `${tool.id}-snapshot-q2`,
        toolId: tool.id,
        capturedAt: "2026-04-10",
        score,
        reason: "Updated source observations and poll weighting"
      }
    ]
  };
});
