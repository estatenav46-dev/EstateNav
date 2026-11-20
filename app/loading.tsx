// Shown instantly while a page without its own loading screen (the home page and others) loads.
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading" className="mx-auto max-w-container px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5.2fr)_minmax(0,6.8fr)] lg:items-center lg:gap-10">
        <div className="space-y-3">
          <div className="skeleton h-9 w-72 max-w-full rounded-full" />
          <div className="skeleton h-12 w-full rounded-2xl" />
          <div className="skeleton h-12 w-4/5 rounded-2xl" />
          <div className="skeleton h-4 w-3/4 rounded-full" />
          <div className="skeleton mt-4 h-28 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={`skeleton h-[19rem] rounded-2xl ${i === 2 ? 'hidden xl:block' : ''}`} />
          ))}
        </div>
      </div>
      <div className="skeleton mt-10 h-7 w-64 rounded-full" />
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-48 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
