import type { Metadata } from "next";
import { CompareWorkbench } from "@/components/compare-workbench";
import { getTools } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Compare AI Tools | Plebi"
};

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <section className="surface rounded-md p-6 sm:p-8">
        <h1 className="text-4xl font-semibold">Compare AI Tools</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          Evaluate leaders side by side across Plebi Score inputs, pricing, fit, and source-backed confidence.
        </p>
      </section>
      <CompareWorkbench tools={getTools()} />
    </div>
  );
}
