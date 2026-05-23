export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="surface rounded-md p-6 sm:p-8">
        <div className="h-3 w-28 rounded-full bg-muted" />
        <div className="mt-5 h-10 max-w-2xl rounded-md bg-muted" />
        <div className="mt-4 h-4 max-w-3xl rounded-full bg-muted" />
        <div className="mt-2 h-4 max-w-xl rounded-full bg-muted" />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="surface rounded-md p-5">
            <div className="h-5 w-5 rounded-md bg-muted" />
            <div className="mt-5 h-3 w-24 rounded-full bg-muted" />
            <div className="mt-3 h-8 w-20 rounded-md bg-muted" />
          </div>
        ))}
      </section>
      <section className="surface rounded-md p-5">
        <div className="h-4 w-40 rounded-full bg-muted" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-12 rounded-md bg-muted" />
          ))}
        </div>
      </section>
    </div>
  );
}
