export default function Loading() {
  return (
    <main className="mx-auto max-w-container animate-pulse px-4 pb-20 pt-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-40 rounded bg-surface-2" />
      <div className="mt-6 h-14 w-[28rem] max-w-full rounded-[12px] bg-surface-2" />
      <div className="mt-10 h-[22rem] rounded-card bg-surface-2" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="aspect-[16/10] rounded-card bg-surface-2" />
        ))}
      </div>
    </main>
  );
}
