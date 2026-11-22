'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { Developer, Property } from '@/lib/data/types';
import { useReducedMotionPreference } from '@/lib/ui/hooks';
import { SectionHeading } from './SectionHeading';

type Partner = { id: string; name: string; logo: Developer['logo']; projects: number };

// From this many partners the wall becomes two slow, opposite-moving rows; fewer sit still.
const MARQUEE_FROM = 8;

function Tile({ partner, decorative = false }: { partner: Partner; decorative?: boolean }) {
  const { logo, name, projects } = partner;
  const body = logo?.url ? (
    <span className="relative block h-full w-full">
      <Image
        src={logo.url}
        alt={decorative ? '' : `${name} logo`}
        fill
        sizes="160px"
        quality={80}
        unoptimized={logo.url.toLowerCase().split('?')[0].endsWith('.svg')}
        className="object-contain grayscale transition-[filter,opacity] duration-base group-hover:grayscale-0 group-focus-visible:grayscale-0 [@media(hover:hover)]:opacity-75 [@media(hover:hover)]:group-hover:opacity-100"
      />
    </span>
  ) : (
    <span className="line-clamp-2 text-center font-serif text-[1.05rem] leading-tight text-neutral-800">{name}</span>
  );
  const box = 'group flex h-20 w-44 shrink-0 items-center justify-center rounded-[14px] border border-line bg-white px-5 py-3.5 transition-[transform,border-color,box-shadow] duration-base sm:h-[5.5rem] sm:w-48';
  if (decorative) return <span aria-hidden="true" className={box}>{body}</span>;
  if (!projects) return <span className={box} title={name}>{body}</span>;
  return (
    <Link
      href={`/properties?q=${encodeURIComponent(name)}`}
      aria-label={`${name}: ${projects} ${projects === 1 ? 'project' : 'projects'} on EstateNav`}
      title={name}
      className={`${box} hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_14px_30px_-20px_rgb(var(--shadow)/0.6)]`}
    >
      {body}
    </Link>
  );
}

function Row({ partners, reverse, paused }: { partners: Partner[]; reverse?: boolean; paused: boolean }) {
  // Two copies make the loop seamless; the copy is hidden from assistive tech and the tab order.
  return (
    <div className="logo-marquee overflow-hidden py-1.5" data-paused={paused}>
      <ul className="logo-track flex w-max gap-3" data-reverse={reverse || undefined} style={{ ['--dur' as string]: `${Math.max(36, partners.length * 7)}s` }}>
        {partners.map((p) => (
          <li key={p.id}>
            <Tile partner={p} />
          </li>
        ))}
        {partners.map((p) => (
          <li key={`dup-${p.id}`} className="logo-dup" aria-hidden="true">
            <Tile partner={p} decorative />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Channel partners (developer records in Firestore, managed on the admin's Partners page): their
// uploaded logos, or the name when no logo is uploaded yet. Hidden partners never reach here.
export function PartnerWall({ developers, properties }: { developers: Developer[]; properties: Property[] }) {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotionPreference();
  const partners: Partner[] = developers
    .map((d) => ({ id: d.id, name: d.name, logo: d.logo, projects: properties.filter((p) => p.developerId === d.id).length }))
    .sort((a, b) => Number(Boolean(b.logo?.url)) - Number(Boolean(a.logo?.url)) || b.projects - a.projects || a.name.localeCompare(b.name));
  if (!partners.length) return null;
  // Reduced motion: one still, centred wall instead of the two moving rows.
  const moving = partners.length >= MARQUEE_FROM && !reduced;
  const centred = partners.length >= MARQUEE_FROM && reduced;
  const rows = moving ? [partners.filter((_, i) => i % 2 === 0), partners.filter((_, i) => i % 2 === 1)] : [];

  return (
    <section aria-labelledby="partners-title" className="pt-12 sm:pt-14 lg:pt-16">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Channel partners"
          id="partners-title"
          title="The developers we work with"
          action={
            moving ? (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
              >
                {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                {paused ? 'Play' : 'Pause'} logos
              </button>
            ) : undefined
          }
        />
      </div>

      {moving ? (
        <div className="mt-6 space-y-1.5 sm:mt-7">
          <Row partners={rows[0]} paused={paused} />
          <Row partners={rows[1]} reverse paused={paused} />
        </div>
      ) : centred ? (
        <ul className="mx-auto mt-6 flex max-w-container flex-wrap justify-center gap-3 px-4 sm:mt-7 sm:px-6 lg:px-8">
          {partners.map((p) => (
            <li key={p.id}>
              <Tile partner={p} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mx-auto mt-6 grid max-w-container grid-cols-2 gap-3 px-4 sm:mt-7 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] sm:px-6 lg:px-8 [&_.group]:w-full">
          {partners.map((p) => (
            <li key={p.id}>
              <Tile partner={p} />
            </li>
          ))}
        </ul>
      )}

      <p className="mx-auto mt-4 max-w-container px-4 text-xs text-ink-muted sm:px-6 lg:px-8">
        EstateNav is an authorised channel partner, not the developers’ official website. Logos belong to their owners.
      </p>
    </section>
  );
}
