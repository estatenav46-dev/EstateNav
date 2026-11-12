import { ShieldCheck, CheckCircle2, Tag, UserCheck } from 'lucide-react';

const TRUST_POINTS = [
  { icon: ShieldCheck, text: 'Zero buyer brokerage' },
  { icon: CheckCircle2, text: 'K-RERA details shown' },
  { icon: Tag, text: 'Direct developer price' },
  { icon: UserCheck, text: 'Dedicated advisor' },
];

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-container px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8" aria-label="Why buyers use EstateNav">
      <div className="rounded-2xl border border-line bg-surface-2/60 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {TRUST_POINTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-ink sm:text-sm">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

