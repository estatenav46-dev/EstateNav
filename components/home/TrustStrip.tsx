import { CheckCircle2, FileCheck, ShieldCheck, Tag, UserCheck } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Zero Buyer Brokerage',
    sub: 'Direct developer inventory',
    detail: 'Save standard 1–2% advisory commission with 100% direct developer terms.',
  },
  {
    icon: CheckCircle2,
    title: 'K-RERA Certified',
    sub: 'License: ...007810',
    detail: 'Operated by a K-RERA registered agent; registration details are in the footer.',
  },
  {
    icon: Tag,
    title: 'Direct Developer Pricing',
    sub: 'Zero markup guarantee',
    detail: 'Official builder cost sheets, allocation decks, and pre-launch price locks.',
  },
  {
    icon: FileCheck,
    title: 'Legal & Title Diligence',
    sub: 'Kaveri & Khata verified',
    detail: 'Full title scrutiny, plan sanction clearances, and pre-approved bank APFs.',
  },
];

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-container px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8" aria-label="Why buyers choose EstateNav">
      <Reveal>
        <div className="rounded-card border border-line bg-surface shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {TRUST_PILLARS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="group p-5 transition-colors duration-fast hover:bg-surface-2/50 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink transition-colors group-hover:border-accent-ink group-hover:bg-accent-soft group-hover:text-accent-ink">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-ink sm:text-base leading-tight">
                        {item.title}
                      </h3>
                      <p className="font-mono text-[10px] text-accent-ink font-semibold uppercase tracking-wider">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

