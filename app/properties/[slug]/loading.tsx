// Shown the moment a project link is opened, while the page streams in.
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading project" className="mx-auto max-w-container px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="skeleton h-4 w-56 rounded-full" />
      <div className="skeleton mt-5 h-7 w-28 rounded-full" />
      <div className="skeleton mt-3 h-11 w-[min(640px,90%)] rounded-2xl" />
      <div className="skeleton mt-3 h-5 w-72 rounded-full" />
      <div className="mt-6 grid gap-2 sm:grid-cols-[2fr_1fr]">
        <div className="skeleton aspect-[16/10] rounded-[28px]" />
        <div className="hidden gap-2 sm:grid">
          <div className="skeleton rounded-[28px]" />
          <div className="skeleton rounded-[28px]" />
        </div>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <div className="skeleton h-6 w-40 rounded-full" />
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-11/12 rounded-full" />
          <div className="skeleton h-4 w-4/5 rounded-full" />
        </div>
        <div className="skeleton hidden h-72 rounded-[28px] lg:block" />
      </div>
    </main>
  );
}
