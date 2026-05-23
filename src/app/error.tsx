"use client";

import { RefreshCw } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <section className="surface rounded-md p-6 sm:p-8">
      <p className="text-sm font-medium text-danger">Data view unavailable</p>
      <h1 className="mt-3 text-3xl font-semibold">Plebi could not load this ranking view.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
        Try reloading the view. If the issue persists, the source dataset or Supabase connection may need review.
      </p>
      {error.digest ? <p className="mt-3 font-mono text-xs text-muted-foreground">Digest {error.digest}</p> : null}
      <button
        type="button"
        onClick={reset}
        className="focus-ring mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </section>
  );
}
