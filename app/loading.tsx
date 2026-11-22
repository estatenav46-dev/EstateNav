// Shown instantly while a page without its own loading screen (the home page and others) loads.
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading" className="mx-auto max-w-container px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14">
        <div className="space-y-3">
          <div className="skeleton h-3 w-56 max-w-full rounded-full" />
          <div className="skeleton h-14 w-full rounded-[12px]" />
          <div className="skeleton h-14 w-4/5 rounded-[12px]" />
          <div className="skeleton h-4 w-3/4 rounded-full" />
          <div className="skeleton mt-6 h-12 w-80 max-w-full rounded-[14px]" />
          <div className="skeleton h-32 w-full rounded-[20px]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="skeleton h-[18rem] rounded-card lg:h-[23rem] xl:h-[24rem]" />
          ))}
        </div>
      </div>
      <div className="skeleton mt-16 h-10 w-80 max-w-full rounded-[12px]" />
      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton aspect-[4/3] rounded-card" />
        ))}
      </div>
    </main>
  );
}
