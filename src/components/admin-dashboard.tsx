"use client";

import { Database, FileClock, Layers3, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AuthPanel } from "@/components/auth-panel";
import { getScoreBreakdown } from "@/lib/scoring";
import type { Category, Source, SourceObservation, Tool } from "@/lib/types";

type AdminDashboardProps = {
  categories: Category[];
  tools: Tool[];
  sources: Source[];
  configured: boolean;
};

type AdminTab = "tools" | "categories" | "sources" | "observations" | "snapshots";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "tools", label: "Tools" },
  { id: "categories", label: "Categories" },
  { id: "sources", label: "Sources" },
  { id: "observations", label: "Observations" },
  { id: "snapshots", label: "Snapshots" }
];

function fieldClass() {
  return "focus-ring h-10 w-full rounded-md border border-border bg-background px-3 text-sm";
}

export function AdminDashboard({ categories, tools, sources, configured }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("tools");
  const [editableTools, setEditableTools] = useState(tools.slice(0, 12));
  const [editableCategories, setEditableCategories] = useState(categories);
  const [editableSources, setEditableSources] = useState(sources);
  const [editableObservations, setEditableObservations] = useState<SourceObservation[]>(
    tools.flatMap((tool) => tool.observations.slice(0, 2)).slice(0, 16)
  );
  const [editableSnapshots, setEditableSnapshots] = useState(tools.flatMap((tool) => tool.scoreSnapshots).slice(0, 16));
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const dashboardStats = useMemo(
    () => [
      { label: "Tools", value: editableTools.length, icon: Database },
      { label: "Categories", value: editableCategories.length, icon: Layers3 },
      { label: "Snapshots", value: editableSnapshots.length, icon: FileClock }
    ],
    [editableCategories.length, editableSnapshots.length, editableTools.length]
  );

  function markSaved() {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }

  function addTool() {
    const firstCategory = editableCategories[0];
    setEditableTools((current) => [
      {
        ...tools[0],
        id: `draft-tool-${current.length + 1}`,
        slug: `draft-tool-${current.length + 1}`,
        name: "New AI Tool",
        categorySlug: firstCategory?.slug ?? "writing-content",
        subcategory: firstCategory?.subcategories[0] ?? "Draft",
        tagline: "Draft positioning statement",
        summary: "Draft evaluation summary",
        website: "https://example.com",
        pricing: "TBD",
        poll: { toolId: `draft-tool-${current.length + 1}`, votesFor: 0, votesAgainst: 0 },
        observations: [],
        scoreSnapshots: []
      }
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="surface rounded-md p-5">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Manage the ranked directory, scoring evidence, poll inputs, and score history before connecting production Supabase writes.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {dashboardStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-md border border-border bg-background p-4">
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-mono text-2xl font-semibold tabular-nums">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
        <AuthPanel configured={configured} />
      </div>

      <div className="surface rounded-md">
        <div className="flex flex-col gap-3 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`focus-ring h-10 rounded-md px-3 text-sm font-medium transition ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={markSaved}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:border-primary"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
        </div>

        {activeTab === "tools" ? (
          <div className="p-4">
            <div className="mb-4 flex justify-between gap-3">
              <h2 className="text-base font-semibold">Tool Records</h2>
              <button
                type="button"
                onClick={addTool}
                className="focus-ring inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Score</th>
                    <th className="px-3 py-2 font-medium">Pricing</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {editableTools.map((tool) => (
                    <tr key={tool.id}>
                      <td className="min-w-56 px-3 py-2">
                        <input
                          value={tool.name}
                          onChange={(event) =>
                            setEditableTools((current) => current.map((item) => (item.id === tool.id ? { ...item, name: event.target.value } : item)))
                          }
                          className={fieldClass()}
                        />
                      </td>
                      <td className="min-w-48 px-3 py-2">
                        <select
                          value={tool.categorySlug}
                          onChange={(event) =>
                            setEditableTools((current) =>
                              current.map((item) => (item.id === tool.id ? { ...item, categorySlug: event.target.value } : item))
                            )
                          }
                          className={fieldClass()}
                        >
                          {editableCategories.map((category) => (
                            <option key={category.slug} value={category.slug}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 font-mono tabular-nums">{getScoreBreakdown(tool).finalScore}%</td>
                      <td className="min-w-48 px-3 py-2">
                        <input
                          value={tool.pricing}
                          onChange={(event) =>
                            setEditableTools((current) => current.map((item) => (item.id === tool.id ? { ...item, pricing: event.target.value } : item)))
                          }
                          className={fieldClass()}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setEditableTools((current) => current.filter((item) => item.id !== tool.id))}
                          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-danger hover:text-danger"
                          aria-label={`Delete ${tool.name}`}
                          title={`Delete ${tool.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === "categories" ? (
          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {editableCategories.map((category) => (
              <div key={category.id} className="rounded-md border border-border bg-background p-4">
                <input
                  value={category.name}
                  onChange={(event) =>
                    setEditableCategories((current) => current.map((item) => (item.id === category.id ? { ...item, name: event.target.value } : item)))
                  }
                  className={fieldClass()}
                />
                <textarea
                  value={category.description}
                  onChange={(event) =>
                    setEditableCategories((current) =>
                      current.map((item) => (item.id === category.id ? { ...item, description: event.target.value } : item))
                    )
                  }
                  className="focus-ring mt-3 min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "sources" ? (
          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {editableSources.map((source) => (
              <div key={source.id} className="rounded-md border border-border bg-background p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={source.name}
                    onChange={(event) =>
                      setEditableSources((current) => current.map((item) => (item.id === source.id ? { ...item, name: event.target.value } : item)))
                    }
                    className={fieldClass()}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={source.credibility}
                    onChange={(event) =>
                      setEditableSources((current) =>
                        current.map((item) => (item.id === source.id ? { ...item, credibility: Number(event.target.value) } : item))
                      )
                    }
                    className={fieldClass()}
                  />
                </div>
                <p className="mt-3 text-xs capitalize text-muted-foreground">{source.type} source</p>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "observations" ? (
          <div className="divide-y divide-border">
            {editableObservations.map((observation) => (
              <div key={observation.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_120px_120px_auto] lg:items-center">
                <input
                  value={observation.title}
                  onChange={(event) =>
                    setEditableObservations((current) =>
                      current.map((item) => (item.id === observation.id ? { ...item, title: event.target.value } : item))
                    )
                  }
                  className={fieldClass()}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={observation.score}
                  onChange={(event) =>
                    setEditableObservations((current) =>
                      current.map((item) => (item.id === observation.id ? { ...item, score: Number(event.target.value) } : item))
                    )
                  }
                  className={fieldClass()}
                />
                <input
                  type="date"
                  value={observation.observedAt}
                  onChange={(event) =>
                    setEditableObservations((current) =>
                      current.map((item) => (item.id === observation.id ? { ...item, observedAt: event.target.value } : item))
                    )
                  }
                  className={fieldClass()}
                />
                <button
                  type="button"
                  onClick={() => setEditableObservations((current) => current.filter((item) => item.id !== observation.id))}
                  className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-danger hover:text-danger"
                  aria-label="Delete observation"
                  title="Delete observation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "snapshots" ? (
          <div className="divide-y divide-border">
            {editableSnapshots.map((snapshot) => (
              <div key={snapshot.id} className="grid gap-3 p-4 lg:grid-cols-[150px_120px_1fr_auto] lg:items-center">
                <input
                  type="date"
                  value={snapshot.capturedAt}
                  onChange={(event) =>
                    setEditableSnapshots((current) =>
                      current.map((item) => (item.id === snapshot.id ? { ...item, capturedAt: event.target.value } : item))
                    )
                  }
                  className={fieldClass()}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={snapshot.score}
                  onChange={(event) =>
                    setEditableSnapshots((current) => current.map((item) => (item.id === snapshot.id ? { ...item, score: Number(event.target.value) } : item)))
                  }
                  className={fieldClass()}
                />
                <input
                  value={snapshot.reason}
                  onChange={(event) =>
                    setEditableSnapshots((current) =>
                      current.map((item) => (item.id === snapshot.id ? { ...item, reason: event.target.value } : item))
                    )
                  }
                  className={fieldClass()}
                />
                <button
                  type="button"
                  onClick={() => setEditableSnapshots((current) => current.filter((item) => item.id !== snapshot.id))}
                  className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-danger hover:text-danger"
                  aria-label="Delete snapshot"
                  title="Delete snapshot"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {savedAt ? <p className="text-sm text-muted-foreground">Draft saved locally at {savedAt}. Supabase write actions can replace this state layer.</p> : null}
    </div>
  );
}
