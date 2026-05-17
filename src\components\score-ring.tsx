import { getScoreTone } from "@/lib/scoring";

type ScoreRingProps = {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { box: 68, radius: 26, stroke: 7, text: "text-xl" },
  md: { box: 92, radius: 36, stroke: 8, text: "text-3xl" },
  lg: { box: 132, radius: 52, stroke: 10, text: "text-5xl" }
};

export function ScoreRing({ score, label = "Plebi Score", size = "md" }: ScoreRingProps) {
  const config = sizes[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative grid place-items-center" style={{ width: config.box, height: config.box }}>
        <svg width={config.box} height={config.box} viewBox={`0 0 ${config.box} ${config.box}`} aria-hidden="true">
          <circle
            cx={config.box / 2}
            cy={config.box / 2}
            r={config.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-muted"
          />
          <circle
            cx={config.box / 2}
            cy={config.box / 2}
            r={config.radius}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={getScoreTone(score)}
            transform={`rotate(-90 ${config.box / 2} ${config.box / 2})`}
          />
        </svg>
        <span className={`absolute font-semibold tabular-nums ${config.text}`}>{score}%</span>
      </div>
      <span className="text-xs font-medium uppercase text-muted-foreground">{label}</span>
    </div>
  );
}
