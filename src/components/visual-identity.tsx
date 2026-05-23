import {
  AlertCircle,
  AudioLines,
  BarChart3,
  Bot,
  Braces,
  BrainCircuit,
  Briefcase,
  ChartLine,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  DollarSign,
  FileQuestion,
  Frame,
  Gauge,
  Image,
  Layers3,
  Megaphone,
  MessageCircle,
  PenLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
  WandSparkles,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { evidenceLabels, freshnessLabels, statusClass } from "@/lib/status";
import type { Category, EvidenceStatus, FreshnessStatus, Source, Tool } from "@/lib/types";

type VisualTone = {
  icon: LucideIcon;
  className: string;
  accentClassName: string;
};

type ToolVisual = VisualTone & {
  label: string;
};

type ToolIdentityProps = {
  tool: Pick<Tool, "name" | "categorySlug" | "subcategory" | "slug">;
  size?: "sm" | "md" | "lg";
};

type CategoryVisualProps = {
  category: Pick<Category, "slug" | "name">;
  size?: "sm" | "md" | "lg";
};

type StatusBadgeProps = {
  status: FreshnessStatus | EvidenceStatus;
  label?: string;
};

type SourceTypeIconProps = {
  type: Source["type"];
};

type EmptyStateVisualProps = {
  kind?: "search" | "compare" | "evidence";
};

const fallbackTone: VisualTone = {
  icon: Layers3,
  className: "border-border bg-muted text-muted-foreground",
  accentClassName: "bg-muted"
};

const categoryVisuals: Record<string, VisualTone> = {
  "image-generation": {
    icon: Image,
    className: "border-primary/25 bg-primary/10 text-primary",
    accentClassName: "bg-primary/20"
  },
  "coding-dev": {
    icon: Code2,
    className: "border-success/25 bg-success/10 text-success",
    accentClassName: "bg-success/20"
  },
  "video-audio": {
    icon: Video,
    className: "border-accent/25 bg-accent/10 text-accent",
    accentClassName: "bg-accent/20"
  },
  "research-search": {
    icon: Search,
    className: "border-primary/25 bg-primary/10 text-primary",
    accentClassName: "bg-primary/20"
  },
  "productivity-ops": {
    icon: Briefcase,
    className: "border-success/25 bg-success/10 text-success",
    accentClassName: "bg-success/20"
  },
  "sales-marketing": {
    icon: Megaphone,
    className: "border-accent/25 bg-accent/10 text-accent",
    accentClassName: "bg-accent/20"
  },
  "data-analytics": {
    icon: BarChart3,
    className: "border-primary/25 bg-primary/10 text-primary",
    accentClassName: "bg-primary/20"
  },
  "writing-content": {
    icon: PenLine,
    className: "border-success/25 bg-success/10 text-success",
    accentClassName: "bg-success/20"
  }
};

const statusIcons: Record<FreshnessStatus | EvidenceStatus, LucideIcon> = {
  current: CheckCircle2,
  needs_review: Clock3,
  stale: AlertCircle,
  seed_only: Database,
  source_verified: ShieldCheck,
  partially_verified: ShieldAlert,
  manual_seed: Database,
  insufficient_evidence: FileQuestion
};

const sourceIcons: Record<Source["type"], LucideIcon> = {
  benchmark: Gauge,
  review: Star,
  community: Users,
  pricing: DollarSign,
  security: ShieldCheck
};

const categoryFallbackLabels: Record<string, string> = {
  "image-generation": "Image",
  "coding-dev": "Code",
  "video-audio": "Media",
  "research-search": "Search",
  "productivity-ops": "Ops",
  "sales-marketing": "Growth",
  "data-analytics": "Data",
  "writing-content": "Write"
};

const knownToolVisuals: Record<string, Pick<ToolVisual, "icon" | "label">> = {
  chatgpt: { icon: MessageCircle, label: "Chat" },
  claude: { icon: BrainCircuit, label: "Claude" },
  "github-copilot": { icon: Braces, label: "Code" },
  midjourney: { icon: Frame, label: "Art" },
  "google-gemini-image": { icon: Sparkles, label: "Gemini" },
  "dall-e": { icon: WandSparkles, label: "GPT" },
  perplexity: { icon: Search, label: "Search" },
  elevenlabs: { icon: AudioLines, label: "Voice" },
  grammarly: { icon: PenLine, label: "Write" },
  "zapier-ai": { icon: Workflow, label: "Auto" }
};

const subcategoryVisuals: Array<{ pattern: RegExp; icon: LucideIcon; label: string }> = [
  { pattern: /assistant|chat|writing|copy|seo|editorial/i, icon: MessageCircle, label: "Write" },
  { pattern: /code|developer|ide|agent|repo|repository/i, icon: Braces, label: "Code" },
  { pattern: /image|visual|design|creative|text to image/i, icon: Frame, label: "Image" },
  { pattern: /search|answer|research|citation|literature/i, icon: Search, label: "Search" },
  { pattern: /voice|audio|video|dubbing|meeting|transcription/i, icon: AudioLines, label: "Media" },
  { pattern: /automation|workflow|workspace|ops|operations/i, icon: Workflow, label: "Ops" },
  { pattern: /sales|marketing|crm|outbound|email|revenue/i, icon: Megaphone, label: "Growth" },
  { pattern: /data|analytics|business intelligence|bi|forecast|model/i, icon: ChartLine, label: "Data" },
  { pattern: /assistant|general/i, icon: Bot, label: "AI" }
];

function getTone(categorySlug: string) {
  return categoryVisuals[categorySlug] ?? fallbackTone;
}

function getInitials(name: string) {
  const words = name
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");

  return initials || "AI";
}

function getToolVisual(tool: Pick<Tool, "name" | "categorySlug" | "subcategory" | "slug">): ToolVisual {
  const tone = getTone(tool.categorySlug);
  const knownVisual = knownToolVisuals[tool.slug];
  const subcategoryVisual = subcategoryVisuals.find((visual) => visual.pattern.test(`${tool.subcategory} ${tool.name}`));

  return {
    ...tone,
    icon: knownVisual?.icon ?? subcategoryVisual?.icon ?? tone.icon,
    label: knownVisual?.label ?? subcategoryVisual?.label ?? categoryFallbackLabels[tool.categorySlug] ?? getInitials(tool.name)
  };
}

function getStatusLabel(status: FreshnessStatus | EvidenceStatus) {
  return status in freshnessLabels ? freshnessLabels[status as FreshnessStatus] : evidenceLabels[status as EvidenceStatus];
}

export function ToolIdentity({ tool, size = "md" }: ToolIdentityProps) {
  const visual = getToolVisual(tool);
  const Icon = visual.icon;
  const sizeClass = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  }[size];
  const iconClass = {
    sm: "h-[18px] w-[18px]",
    md: "h-5 w-5",
    lg: "h-7 w-7"
  }[size];
  const label = visual.label || getInitials(tool.name);

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border ${sizeClass} ${visual.className}`} aria-hidden="true">
      <span className={`absolute -right-3 -top-3 h-8 w-8 rounded-full ${visual.accentClassName}`} />
      <span className={`absolute -bottom-3 -left-3 h-8 w-8 rounded-full ${visual.accentClassName} opacity-70`} />
      <Icon className={`relative ${iconClass}`} strokeWidth={2.1} />
      {size !== "sm" ? (
        <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded border border-current/10 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium leading-none text-foreground/80 shadow-sm backdrop-blur-sm">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function CategoryVisual({ category, size = "md" }: CategoryVisualProps) {
  const tone = getTone(category.slug);
  const Icon = tone.icon;
  const sizeClass = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  }[size];
  const iconClass = size === "lg" ? "h-7 w-7" : "h-5 w-5";

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border ${sizeClass} ${tone.className}`} aria-hidden="true">
      <span className={`absolute -right-3 -top-3 h-8 w-8 rounded-full ${tone.accentClassName}`} />
      <Icon className={`relative ${iconClass}`} />
    </div>
  );
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const Icon = statusIcons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${statusClass(status)}`}>
      <Icon className="h-3.5 w-3.5" />
      {label ?? getStatusLabel(status)}
    </span>
  );
}

export function SourceTypeIcon({ type }: SourceTypeIconProps) {
  const Icon = sourceIcons[type];

  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground" aria-hidden="true">
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function EmptyStateVisual({ kind = "search" }: EmptyStateVisualProps) {
  const Icon = kind === "compare" ? BarChart3 : kind === "evidence" ? ShieldAlert : Search;

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground" aria-hidden="true">
      <span className="absolute -right-4 -top-4 h-10 w-10 rounded-full bg-primary/10" />
      <Icon className="relative h-6 w-6" />
    </div>
  );
}
