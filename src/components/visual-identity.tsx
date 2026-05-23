import {
  AlertCircle,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  DollarSign,
  FileQuestion,
  Gauge,
  Image,
  Layers3,
  Megaphone,
  PenLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
  Video
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { evidenceLabels, freshnessLabels, statusClass } from "@/lib/status";
import type { Category, EvidenceStatus, FreshnessStatus, Source, Tool } from "@/lib/types";

type VisualTone = {
  icon: LucideIcon;
  className: string;
  accentClassName: string;
};

type ToolIdentityProps = {
  tool: Pick<Tool, "name" | "categorySlug" | "subcategory">;
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

function getStatusLabel(status: FreshnessStatus | EvidenceStatus) {
  return status in freshnessLabels ? freshnessLabels[status as FreshnessStatus] : evidenceLabels[status as EvidenceStatus];
}

export function ToolIdentity({ tool, size = "md" }: ToolIdentityProps) {
  const tone = getTone(tool.categorySlug);
  const Icon = tone.icon;
  const sizeClass = {
    sm: "h-10 w-10 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg"
  }[size];
  const iconClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border ${sizeClass} ${tone.className}`} aria-hidden="true">
      <span className={`absolute -right-3 -top-3 h-8 w-8 rounded-full ${tone.accentClassName}`} />
      <span className="relative font-mono font-semibold tabular-nums">{getInitials(tool.name)}</span>
      <Icon className={`absolute bottom-1 right-1 opacity-70 ${iconClass}`} />
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
