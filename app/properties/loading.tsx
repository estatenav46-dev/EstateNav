// Instant feedback while the listings page loads.
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading listings" className="mx-auto flex max-w-container">
      <div className="hidden w-[260px] shrink-0 space-y-3 border-r border-line p-4 pt-12 sm:block">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton h-11 w-11 rounded-[10px]" />
            <div className="skeleton h-4 flex-1 rounded-full" />
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1 px-3 pt-4 sm:px-5 sm:pt-6 lg:px-8">
        <div className="skeleton h-3 w-32 rounded-full" />
        <div className="skeleton mt-4 h-11 w-72 max-w-full rounded-[12px]" />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-10 w-28 rounded-full" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-card border border-line bg-surface">
              <div className="skeleton aspect-[4/3]" />
              <div className="space-y-2 p-4">
                <div className="skeleton h-5 w-3/4 rounded-full" />
                <div className="skeleton h-4 w-1/2 rounded-full" />
                <div className="skeleton mt-3 h-5 w-2/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
