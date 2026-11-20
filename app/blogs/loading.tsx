export default function Loading() {
  return (
    <main className="mx-auto max-w-container animate-pulse px-4 pb-20 pt-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-40 rounded bg-surface-2" />
      <div className="mt-4 h-8 w-80 max-w-full rounded bg-surface-2" />
      <div className="mt-8 h-64 rounded-[22px] bg-surface-2" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-56 rounded-2xl bg-surface-2" />
        ))}
      </div>
    </main>
  );
}
