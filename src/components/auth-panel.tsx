"use client";

import { LogIn } from "lucide-react";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthPanelProps = {
  configured: boolean;
};

export function AuthPanel({ configured }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(configured ? null : "Supabase env vars are not set.");

  async function signIn() {
    if (!configured) {
      setStatus("Add Supabase env vars to enable magic-link admin auth.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`
      }
    });

    setStatus(error ? error.message : "Magic link sent.");
  }

  return (
    <div className="surface rounded-md p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Admin Access</h2>
          <p className="text-sm text-muted-foreground">
            {configured ? "Supabase auth is configured." : "Supabase auth is ready to configure."}
          </p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs ${configured ? "bg-primary text-primary-foreground" : "chip text-muted-foreground"}`}>
          {configured ? "Connected" : "Not connected"}
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="admin@company.com"
          className="focus-ring h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm"
        />
        <button
          type="button"
          onClick={signIn}
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <LogIn className="h-4 w-4" />
          Send link
        </button>
      </div>
      {status ? <p className="mt-3 text-sm text-muted-foreground">{status}</p> : null}
    </div>
  );
}
