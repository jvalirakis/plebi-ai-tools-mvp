"use client";

import { FileCheck2, RefreshCcw, Save, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getScoreBreakdown } from "@/lib/scoring";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Database } from "@/lib/supabase/types";
import { evidenceLabels, freshnessLabels, statusClass } from "@/lib/status";
import type { EvidenceStatus, FreshnessStatus, Source, SourceObservation, Tool } from "@/lib/types";

type EvidenceIntakeProps = {
  tools: Tool[];
  sources: Source[];
  configured: boolean;
};

type ObservationRecord = SourceObservation & {
  toolName: string;
};

type EvidenceFormState = {
  observationId: string;
  toolId: string;
  sourceName: string;
  sourceType: Source["type"];
  evidenceUrl: string;
  title: string;
  score: number;
  confidence: number;
  weight: number;
  observedAt: string;
  notes: string;
  evidenceStatus: EvidenceStatus;
  freshnessStatus: FreshnessStatus;
};

type ScorePreview = {
  currentScore: number;
  nextScore: number;
  sourceSignal: number;
};

const sourceTypes: Source["type"][] = ["benchmark", "review", "community", "pricing", "security"];
const freshnessStatuses: FreshnessStatus[] = ["current", "needs_review", "stale", "seed_only"];
const evidenceStatuses: EvidenceStatus[] = ["source_verified", "partially_verified", "manual_seed", "insufficient_evidence"];

function fieldClass() {
  return "focus-ring h-10 w-full rounded-md border border-border bg-background px-3 text-sm";
}

function textareaClass() {
  return "focus-ring min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, value));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function makeInitialForm(tools: Tool[], sources: Source[]): EvidenceFormState {
  const firstTool = tools[0];
  const firstSource = sources[0];

  return {
    observationId: "",
    toolId: firstTool?.id ?? "",
    sourceName: firstSource?.name ?? "Manual evidence review",
    sourceType: firstSource?.type ?? "review",
    evidenceUrl: "",
    title: "Manual evidence intake",
    score: 75,
    confidence: 0.7,
    weight: firstSource?.weight ?? 0.2,
    observedAt: todayIso(),
    notes: "Manual evidence record entered by Plebi admin.",
    evidenceStatus: firstTool?.evidenceStatus ?? "insufficient_evidence",
    freshnessStatus: firstTool?.freshnessStatus ?? "needs_review"
  };
}

function toObservationForm(observation: ObservationRecord, tool: Tool): EvidenceFormState {
  return {
    observationId: observation.id,
    toolId: tool.id,
    sourceName: observation.sourceName,
    sourceType: observation.sourceType,
    evidenceUrl: observation.evidenceUrl ?? observation.sourceUrl ?? "",
    title: observation.title,
    score: observation.score,
    confidence: observation.confidence,
    weight: observation.sourceWeight ?? 0.2,
    observedAt: observation.observedAt,
    notes: observation.notes,
    evidenceStatus: tool.evidenceStatus,
    freshnessStatus: tool.freshnessStatus
  };
}

function getManualSourceUrl(evidenceUrl: string, existingSource?: Source) {
  return evidenceUrl.trim() || existingSource?.url || "https://plebi.example/manual-evidence";
}

export function EvidenceIntake({ tools, sources, configured }: EvidenceIntakeProps) {
  const router = useRouter();
  const [form, setForm] = useState<EvidenceFormState>(() => makeInitialForm(tools, sources));
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scorePreview, setScorePreview] = useState<ScorePreview | null>(null);

  const observations = useMemo<ObservationRecord[]>(
    () =>
      tools
        .flatMap((tool) => tool.observations.map((observation) => ({ ...observation, toolName: tool.name })))
        .sort((a, b) => b.observedAt.localeCompare(a.observedAt)),
    [tools]
  );
  const selectedTool = tools.find((tool) => tool.id === form.toolId) ?? tools[0];
  const selectedSource = sources.find((source) => source.name.toLowerCase() === form.sourceName.trim().toLowerCase());
  const editableObservationCount = observations.length;

  function resetForTool(toolId: string) {
    const tool = tools.find((item) => item.id === toolId);
    setScorePreview(null);
    setMessage(null);
    setForm((current) => ({
      ...current,
      observationId: "",
      toolId,
      title: "Manual evidence intake",
      score: 75,
      confidence: 0.7,
      observedAt: todayIso(),
      notes: "Manual evidence record entered by Plebi admin.",
      evidenceStatus: tool?.evidenceStatus ?? "insufficient_evidence",
      freshnessStatus: tool?.freshnessStatus ?? "needs_review"
    }));
  }

  function loadObservation(observationId: string) {
    setScorePreview(null);
    setMessage(null);

    if (!observationId) {
      resetForTool(form.toolId);
      return;
    }

    const observation = observations.find((item) => item.id === observationId);
    const tool = observation ? tools.find((item) => item.id === observation.toolId) : null;

    if (observation && tool) {
      setForm(toObservationForm(observation, tool));
    }
  }

  function getDraftTool() {
    if (!selectedTool) {
      return null;
    }

    const draftObservation: SourceObservation = {
      id: form.observationId || "draft-observation",
      toolId: selectedTool.id,
      sourceId: selectedSource?.id ?? "draft-source",
      sourceName: form.sourceName.trim() || "Manual evidence review",
      sourceType: form.sourceType,
      sourceUrl: getManualSourceUrl(form.evidenceUrl, selectedSource),
      sourceWeight: clamp(Number(form.weight), 0, 1),
      evidenceUrl: form.evidenceUrl.trim() || null,
      title: form.title.trim() || "Manual evidence intake",
      observedAt: form.observedAt,
      score: clamp(Number(form.score), 0, 100),
      confidence: clamp(Number(form.confidence), 0, 1),
      metricImpacts: { capability: clamp(Number(form.score), 0, 100) },
      notes: form.notes.trim() || "Manual evidence record entered by Plebi admin."
    };
    const observationsWithoutDraft = selectedTool.observations.filter((observation) => observation.id !== form.observationId);

    return {
      ...selectedTool,
      freshnessStatus: form.freshnessStatus,
      evidenceStatus: form.evidenceStatus,
      observations: [...observationsWithoutDraft, draftObservation]
    };
  }

  function previewRecalculation() {
    const draftTool = getDraftTool();

    if (!selectedTool || !draftTool) {
      return;
    }

    setScorePreview({
      currentScore: getScoreBreakdown(selectedTool).finalScore,
      nextScore: getScoreBreakdown(draftTool).finalScore,
      sourceSignal: getScoreBreakdown(draftTool).sourceSignal
    });
  }

  async function saveEvidence() {
    setMessage(null);
    setScorePreview(null);

    if (!configured) {
      setMessage("Supabase environment variables are not configured for writes.");
      return;
    }

    if (!selectedTool || !isUuid(selectedTool.id)) {
      setMessage("This record is still coming from seed fallback. Seed Supabase first, then save manual evidence.");
      return;
    }

    if (!form.sourceName.trim() || !form.title.trim() || !form.observedAt) {
      setMessage("Tool, source name, signal title, and observed date are required.");
      return;
    }

    setSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const sourceUrl = getManualSourceUrl(form.evidenceUrl, selectedSource);
      const sourcePayload = {
        name: form.sourceName.trim(),
        type: form.sourceType,
        url: sourceUrl,
        weight: clamp(Number(form.weight), 0, 1),
        credibility: Math.round(clamp(Number(form.confidence), 0, 1) * 100)
      };
      let sourceId = selectedSource && isUuid(selectedSource.id) ? selectedSource.id : null;

      if (sourceId) {
        const { error } = await supabase.from("sources").update(sourcePayload).eq("id", sourceId);

        if (error) {
          throw error;
        }
      } else {
        const { data, error } = await supabase.from("sources").insert(sourcePayload).select("id").single();

        if (error) {
          throw error;
        }

        sourceId = data.id;
      }

      const observationPayload: Database["public"]["Tables"]["source_observations"]["Insert"] = {
        tool_id: selectedTool.id,
        source_id: sourceId,
        title: form.title.trim(),
        observed_at: form.observedAt,
        score: clamp(Number(form.score), 0, 100),
        confidence: clamp(Number(form.confidence), 0, 1),
        metric_impacts: { capability: clamp(Number(form.score), 0, 100) },
        evidence_url: form.evidenceUrl.trim() || null,
        notes: form.notes.trim() || "Manual evidence record entered by Plebi admin."
      };

      if (form.observationId && isUuid(form.observationId)) {
        const { error } = await supabase.from("source_observations").update(observationPayload).eq("id", form.observationId);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("source_observations").insert(observationPayload);

        if (error) {
          throw error;
        }
      }

      const verifiedAt =
        form.evidenceStatus === "source_verified" || form.evidenceStatus === "partially_verified" ? form.observedAt : selectedTool.lastVerifiedAt;
      const { error: toolError } = await supabase
        .from("tools")
        .update({
          freshness_status: form.freshnessStatus,
          evidence_status: form.evidenceStatus,
          last_verified_at: verifiedAt
        })
        .eq("id", selectedTool.id);

      if (toolError) {
        throw toolError;
      }

      setMessage("Evidence saved. Public pages will refresh with the latest Supabase records.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Evidence save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function createScoreSnapshot() {
    setMessage(null);
    const draftTool = getDraftTool();

    if (!configured) {
      setMessage("Supabase environment variables are not configured for writes.");
      return;
    }

    if (!selectedTool || !draftTool || !isUuid(selectedTool.id)) {
      setMessage("This record is still coming from seed fallback. Seed Supabase first, then create score snapshots.");
      return;
    }

    setSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const nextScore = getScoreBreakdown(draftTool).finalScore;
      const today = todayIso();
      const { error } = await supabase.from("score_snapshots").insert({
        tool_id: selectedTool.id,
        captured_at: today,
        snapshot_date: today,
        score: nextScore,
        reason: "Manual evidence intake recalculation using structured metrics, normalized source observations, and current poll counts."
      });

      if (error) {
        throw error;
      }

      setScorePreview({
        currentScore: getScoreBreakdown(selectedTool).finalScore,
        nextScore,
        sourceSignal: getScoreBreakdown(draftTool).sourceSignal
      });
      setMessage("Recalculated score snapshot created.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Score snapshot creation failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 p-4 xl:grid-cols-[320px_1fr]">
      <aside className="rounded-md border border-border bg-background p-4">
        <div className="mb-4 flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Evidence Intake</h2>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Create or edit manual source observations. Writes use existing Supabase admin RLS policies and do not crawl external sources.
        </p>
        <label className="mt-5 block text-xs font-medium text-muted-foreground" htmlFor="observation-select">
          Edit observation
        </label>
        <select id="observation-select" value={form.observationId} onChange={(event) => loadObservation(event.target.value)} className={fieldClass()}>
          <option value="">New observation</option>
          {observations.slice(0, 80).map((observation) => (
            <option key={observation.id} value={observation.id}>
              {observation.toolName} / {observation.sourceName} / {observation.observedAt}
            </option>
          ))}
        </select>
        <div className="mt-5 rounded-md border border-border bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">Source registry</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A matching source name updates that source when it exists in Supabase; otherwise Plebi creates a new source record.
          </p>
          <p className="mt-3 font-mono text-xs text-muted-foreground tabular-nums">{editableObservationCount} observations loaded</p>
        </div>
      </aside>

      <div className="space-y-4">
        <div className="rounded-md border border-border bg-background p-4">
          <div className="mb-4 flex items-center gap-2">
            <SquarePen className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Manual Evidence Record</h3>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Tool
              <select value={form.toolId} onChange={(event) => resetForTool(event.target.value)} className={fieldClass()}>
                {tools.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Signal title
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className={fieldClass()}
              />
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Source name
              <input
                value={form.sourceName}
                onChange={(event) => setForm((current) => ({ ...current, sourceName: event.target.value }))}
                className={fieldClass()}
              />
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Source type
              <select
                value={form.sourceType}
                onChange={(event) => setForm((current) => ({ ...current, sourceType: event.target.value as Source["type"] }))}
                className={fieldClass()}
              >
                {sourceTypes.map((sourceType) => (
                  <option key={sourceType} value={sourceType}>
                    {sourceType}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Evidence URL
              <input
                value={form.evidenceUrl}
                onChange={(event) => setForm((current) => ({ ...current, evidenceUrl: event.target.value }))}
                className={fieldClass()}
                placeholder="https://"
              />
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Observed date
              <input
                type="date"
                value={form.observedAt}
                onChange={(event) => setForm((current) => ({ ...current, observedAt: event.target.value }))}
                className={fieldClass()}
              />
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Observed / normalized score
              <input
                type="number"
                min={0}
                max={100}
                value={form.score}
                onChange={(event) => setForm((current) => ({ ...current, score: Number(event.target.value) }))}
                className={fieldClass()}
              />
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Confidence
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={form.confidence}
                onChange={(event) => setForm((current) => ({ ...current, confidence: Number(event.target.value) }))}
                className={fieldClass()}
              />
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Weight
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={form.weight}
                onChange={(event) => setForm((current) => ({ ...current, weight: Number(event.target.value) }))}
                className={fieldClass()}
              />
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Evidence status
              <select
                value={form.evidenceStatus}
                onChange={(event) => setForm((current) => ({ ...current, evidenceStatus: event.target.value as EvidenceStatus }))}
                className={fieldClass()}
              >
                {evidenceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {evidenceLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground">
              Mark tool as
              <select
                value={form.freshnessStatus}
                onChange={(event) => setForm((current) => ({ ...current, freshnessStatus: event.target.value as FreshnessStatus }))}
                className={fieldClass()}
              >
                {freshnessStatuses.map((status) => (
                  <option key={status} value={status}>
                    {freshnessLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs font-medium text-muted-foreground lg:col-span-2">
              Note
              <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className={textareaClass()} />
            </label>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="text-base font-semibold">Recalculation Utility</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Preview and snapshot the score using the current structured metrics, normalized source observations, and poll sentiment.
            </p>
            {scorePreview ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Current score</p>
                  <p className="mt-1 font-mono text-lg tabular-nums">{scorePreview.currentScore}%</p>
                </div>
                <div className="rounded-md border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Preview score</p>
                  <p className="mt-1 font-mono text-lg tabular-nums">{scorePreview.nextScore}%</p>
                </div>
                <div className="rounded-md border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Source signal</p>
                  <p className="mt-1 font-mono text-lg tabular-nums">{scorePreview.sourceSignal}%</p>
                </div>
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={previewRecalculation}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary"
              >
                <RefreshCcw className="h-4 w-4" />
                Preview
              </button>
              <button
                type="button"
                onClick={createScoreSnapshot}
                disabled={saving}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileCheck2 className="h-4 w-4" />
                Create snapshot
              </button>
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs font-medium text-muted-foreground">Selected status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-md border px-2 py-1 text-xs ${statusClass(form.freshnessStatus)}`}>
                {freshnessLabels[form.freshnessStatus]}
              </span>
              <span className={`rounded-md border px-2 py-1 text-xs ${statusClass(form.evidenceStatus)}`}>
                {evidenceLabels[form.evidenceStatus]}
              </span>
            </div>
            <button
              type="button"
              onClick={saveEvidence}
              disabled={saving}
              className="focus-ring mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save evidence"}
            </button>
            {message ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
