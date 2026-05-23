import { ChevronDown } from "lucide-react";
import { EmptyStateVisual, SourceTypeIcon } from "@/components/visual-identity";
import type { SourceObservation } from "@/lib/types";

type SourceObservationsProps = {
  observations: SourceObservation[];
};

export function SourceObservations({ observations }: SourceObservationsProps) {
  if (!observations.length) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background p-6">
        <div className="flex gap-4">
          <EmptyStateVisual kind="evidence" />
          <div>
            <p className="text-sm font-medium">No evidence yet</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              No source observations are attached yet. Add manual evidence in the admin intake workflow to make this score auditable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {observations
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((observation) => (
          <details key={observation.id} className="group rounded-md border border-border bg-card">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
              <span className="flex min-w-0 items-center gap-3">
                <SourceTypeIcon type={observation.sourceType} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{observation.sourceName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {observation.title} / {observation.observedAt}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-sm tabular-nums">{observation.score}%</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
              </span>
            </summary>
            <div className="border-t border-border px-4 py-3">
              <div className="mb-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-md border border-border bg-background p-2">
                  <span className="block">Signal title</span>
                  <span className="mt-1 block text-foreground">{observation.title}</span>
                </div>
                <div className="rounded-md border border-border bg-background p-2">
                  <span className="block">Source type</span>
                  <span className="mt-1 block capitalize text-foreground">{observation.sourceType}</span>
                </div>
                <div className="rounded-md border border-border bg-background p-2">
                  <span className="block">Normalized score</span>
                  <span className="mt-1 block font-mono text-foreground tabular-nums">{observation.score}%</span>
                </div>
                <div className="rounded-md border border-border bg-background p-2">
                  <span className="block">Confidence</span>
                  <span className="mt-1 block font-mono text-foreground tabular-nums">{(observation.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="rounded-md border border-border bg-background p-2">
                  <span className="block">Weight</span>
                  <span className="mt-1 block font-mono text-foreground tabular-nums">
                    {observation.sourceWeight ? `${(observation.sourceWeight * 100).toFixed(0)}%` : "N/A"}
                  </span>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">Observed {observation.observedAt}</span>
                {observation.sourceUrl ? (
                  <a
                    href={observation.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="chip rounded-md px-2 py-1 text-xs text-primary hover:underline"
                  >
                    Source URL
                  </a>
                ) : null}
                {observation.evidenceUrl ? (
                  <a
                    href={observation.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="chip rounded-md px-2 py-1 text-xs text-primary hover:underline"
                  >
                    Evidence URL
                  </a>
                ) : (
                  <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">No evidence URL attached</span>
                )}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                <span className="font-medium text-foreground">Note: </span>
                {observation.notes}
              </p>
            </div>
          </details>
        ))}
    </div>
  );
}
