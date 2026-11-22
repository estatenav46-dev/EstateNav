// Shown the moment a project link is opened, while the page streams in.
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading project" className="mx-auto max-w-container px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="skeleton h-4 w-56 rounded-full" />
      <div className="skeleton mt-5 h-7 w-28 rounded-full" />
      <div className="skeleton mt-3 h-14 w-[min(640px,90%)] rounded-[12px]" />
      <div className="skeleton mt-3 h-5 w-72 rounded-full" />
      <div className="mt-6 grid gap-2.5 sm:h-[clamp(18rem,34vw,32rem)] sm:grid-cols-[2fr_1fr]">
        <div className="skeleton aspect-[4/3] rounded-card sm:aspect-auto" />
        <div className="hidden gap-2.5 sm:grid">
          <div className="skeleton rounded-card" />
          <div className="skeleton rounded-card" />
        </div>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <div className="space-y-3">
          <div className="skeleton h-6 w-40 rounded-full" />
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-11/12 rounded-full" />
          <div className="skeleton h-4 w-4/5 rounded-full" />
        </div>
        <div className="skeleton hidden h-80 rounded-card lg:block" />
      </div>
    </main>
  );
}
