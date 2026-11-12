const STEPS = [
  { num: '01', title: 'Shortlist', text: 'Save homes that fit your criteria' },
  { num: '02', title: 'Verify', text: 'Review verified K-RERA approvals & bank APFs' },
  { num: '03', title: 'Visit', text: 'Dedicated site visit with the developer team' },
  { num: '04', title: 'Book Direct', text: 'Direct developer price with zero brokerage' },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-container px-4 py-6" aria-label="How it works">
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-ink sm:text-lg">How EstateNav works</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STEPS.map((step) => (
            <div key={step.num} className="relative rounded-xl border border-line/60 bg-surface-2/40 p-3">
              <span className="font-mono text-xs font-bold text-accent-ink">{step.num}</span>
              <h3 className="mt-1 text-sm font-semibold text-ink">{step.title}</h3>
              <p className="mt-0.5 text-2xs text-ink-muted leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
