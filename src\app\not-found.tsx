import Link from "next/link";

export default function NotFound() {
  return (
    <div className="surface mx-auto max-w-xl rounded-md p-8 text-center">
      <h1 className="text-3xl font-semibold">Record not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">The requested Plebi record is not available in the seeded directory.</p>
      <Link
        href="/"
        className="focus-ring mt-6 inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Return to directory
      </Link>
    </div>
  );
}
