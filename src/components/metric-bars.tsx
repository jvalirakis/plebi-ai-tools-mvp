import { metricLabels } from "@/lib/scoring";
import type { MetricBreakdown, MetricKey, ScoreBreakdown } from "@/lib/types";

type MetricBarsProps = {
  metrics: MetricBreakdown | ScoreBreakdown;
  includeSignals?: boolean;
};

export function MetricBars({ metrics, includeSignals = false }: MetricBarsProps) {
  const metricRows = (Object.keys(metricLabels) as MetricKey[]).map((key) => ({
    key,
    label: metricLabels[key],
    value: metrics[key]
  }));

  const signalRows =
    includeSignals && "sourceSignal" in metrics
      ? [
          { key: "sourceSignal", label: "Source Signal", value: metrics.sourceSignal },
          { key: "pollSentiment", label: "Poll Sentiment", value: metrics.pollSentiment }
        ]
      : [];

  return (
    <div className="space-y-3">
      {[...metricRows, ...signalRows].map((metric) => (
        <div key={metric.key} className="grid grid-cols-[minmax(86px,116px)_1fr_42px] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{metric.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${metric.value}%` }}
              aria-hidden="true"
            />
          </span>
          <span className="text-right font-mono text-xs tabular-nums">{metric.value}</span>
        </div>
      ))}
    </div>
  );
}
