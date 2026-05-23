"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { clampScore } from "@/lib/scoring";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Poll } from "@/lib/types";

type PollWidgetProps = {
  poll: Poll;
};

export function PollWidget({ poll }: PollWidgetProps) {
  const [votesFor, setVotesFor] = useState(poll.votesFor);
  const [votesAgainst, setVotesAgainst] = useState(poll.votesAgainst);
  const [choice, setChoice] = useState<"for" | "against" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const sentiment = useMemo(() => {
    const total = votesFor + votesAgainst;
    return total ? clampScore((votesFor / total) * 100) : 50;
  }, [votesFor, votesAgainst]);

  async function getUserId() {
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      return userData.user.id;
    }

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error || !data.user) {
      throw new Error("Voting requires an authenticated session.");
    }

    return data.user.id;
  }

  async function vote(nextChoice: "for" | "against") {
    if (choice || isSaving) {
      return;
    }

    const previousVotesFor = votesFor;
    const previousVotesAgainst = votesAgainst;

    setChoice(nextChoice);
    if (nextChoice === "for") {
      setVotesFor((current) => current + 1);
    } else {
      setVotesAgainst((current) => current + 1);
    }

    if (!poll.id) {
      setStatus("Vote saved locally until Supabase polls are seeded.");
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const userId = await getUserId();
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: poll.id,
        user_id: userId,
        vote: nextChoice
      });

      if (error) {
        throw error;
      }

      setStatus("Vote recorded.");
    } catch (error) {
      setChoice(null);
      setVotesFor(previousVotesFor);
      setVotesAgainst(previousVotesAgainst);
      setStatus(error instanceof Error && error.message ? error.message : "Vote could not be recorded.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">User Poll</h3>
          <p className="text-xs text-muted-foreground">{votesFor + votesAgainst} verified votes</p>
        </div>
        <span className="font-mono text-2xl font-semibold tabular-nums">{sentiment}%</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${sentiment}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={Boolean(choice) || isSaving}
          onClick={() => vote("for")}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background text-sm font-medium transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ThumbsUp className="h-4 w-4" />
          Would use
        </button>
        <button
          type="button"
          disabled={Boolean(choice) || isSaving}
          onClick={() => vote("against")}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background text-sm font-medium transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ThumbsDown className="h-4 w-4" />
          Not a fit
        </button>
      </div>
      {status ? <p className="mt-3 text-xs text-muted-foreground">{status}</p> : null}
    </div>
  );
}
