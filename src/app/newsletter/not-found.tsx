import Link from "next/link";

export default function NewsletterNotFound() {
  return (
    <div className="surface mx-auto max-w-xl rounded-md p-8 text-center">
      <h1 className="text-3xl font-semibold">AI Brief issue not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">This Plebi AI Brief issue is not published in the current archive.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/newsletter"
          className="focus-ring inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          View AI Brief archive
        </Link>
        <Link
          href="/tools"
          className="focus-ring inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium transition hover:border-primary"
        >
          Browse tools
        </Link>
      </div>
    </div>
  );
}
