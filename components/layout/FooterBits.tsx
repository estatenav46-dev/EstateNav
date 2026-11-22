'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ArrowUp, MessageCircle } from 'lucide-react';
import { whatsAppLink } from '@/lib/contact';
import { Reveal, Words } from '@/components/Reveal';

/** Closing call to action; the home page already ends on the advisory band, so it is skipped there. */
export function FooterCta({ agentName, whatsapp }: { agentName: string; whatsapp: string }) {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <Reveal variant="words" className="flex flex-col gap-6 border-b border-[rgb(var(--on-night)/0.12)] pb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="rw-fade text-sm font-medium text-[rgb(var(--on-night)/0.65)]">Ready when you are</p>
        <h2 className="mt-1 font-serif text-[1.9rem] leading-[1.08] text-[rgb(var(--on-night))] sm:text-[2.4rem]">
          <Words>
            <>See it in person, <span className="text-brass">with the advisor.</span></>
          </Words>
        </h2>
      </div>
      <div className="rw-fade flex flex-wrap gap-2">
        <Link href="/contact?intent=site-visit" className="btn-primary min-h-[52px] px-6">
          Book a site visit <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <a
          href={whatsAppLink(`Hi ${agentName}, I'm browsing EstateNav and would like some advice.`, whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--radius)] px-6 text-sm font-semibold text-[rgb(var(--on-night))] ring-1 ring-[rgb(var(--on-night)/0.25)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[rgb(var(--on-night)/0.08)] active:scale-[0.97]"
        >
          <MessageCircle className="h-4 w-4 text-brass" aria-hidden="true" /> WhatsApp the advisor
        </a>
      </div>
    </Reveal>
  );
}

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
      className="group inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[rgb(var(--on-night))]"
    >
      Back to top
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-[rgb(var(--on-night)/0.25)] transition-transform duration-slow ease-out group-hover:-translate-y-1">
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}
