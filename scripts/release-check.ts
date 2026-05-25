import { spawnSync } from "node:child_process";
import path from "node:path";

type Step = {
  label: string;
  command: string;
  args: string[];
};

function localPackageBin(...segments: string[]) {
  return path.join(process.cwd(), "node_modules", ...segments);
}

const steps: Step[] = [
  {
    label: "Validate analytics events",
    command: process.execPath,
    args: ["--no-warnings", "--experimental-strip-types", "scripts/validate-analytics.ts"]
  },
  {
    label: "Write content audit report",
    command: process.execPath,
    args: ["--no-warnings", "--experimental-strip-types", "scripts/audit-content-quality.ts", "--write"]
  },
  {
    label: "Type-check",
    command: process.execPath,
    args: [localPackageBin("typescript", "bin", "tsc"), "--noEmit"]
  },
  {
    label: "Lint",
    command: process.execPath,
    args: [localPackageBin("eslint", "bin", "eslint.js"), "."]
  },
  {
    label: "Build",
    command: process.execPath,
    args: [localPackageBin("next", "dist", "bin", "next"), "build", "--webpack"]
  }
];

for (const step of steps) {
  console.log(`\n> ${step.label}`);

  const result = spawnSync(step.command, step.args, {
    cwd: process.cwd(),
    env: process.env,
    shell: false,
    stdio: "inherit"
  });

  if (result.error) {
    console.error(`Release check failed during "${step.label}": ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Release check failed during "${step.label}" with exit code ${result.status ?? "unknown"}.`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nRelease check completed successfully.");
