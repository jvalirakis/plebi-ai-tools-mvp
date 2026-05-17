import { ChevronDown } from "lucide-react";
import type { SourceObservation } from "@/lib/types";

type SourceObservationsProps = {
  observations: SourceObservation[];
};

export function SourceObservations({ observations }: SourceObservationsProps) {
  return (
    <div className="space-y-3">
      {observations
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((observation) => (
          <details key={observation.id} className="group rounded-md border border-border bg-card">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{observation.sourceName}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {observation.title} / {observation.observedAt}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-sm tabular-nums">{observation.score}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
              </span>
            </summary>
            <div className="border-t border-border px-4 py-3">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="chip rounded-md px-2 py-1 text-xs capitalize text-muted-foreground">
                  {observation.sourceType}
                </span>
                <span className="chip rounded-md px-2 py-1 text-xs text-muted-foreground">
                  Confidence {(observation.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{observation.notes}</p>
            </div>
          </details>
        ))}
    </div>
  );
}
