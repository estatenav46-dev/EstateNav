'use client';

import { useState } from 'react';
import type { OfficeHub, Property } from '@/lib/data/types';

const RINGS = [15, 30, 45, 60];

// Pick an office hub to see measured drive-time bands. Nothing is estimated here: a hub
// without sourced data says so.
export function CommuteRadar({ property, hubs, disclaimer }: { property: Property; hubs: OfficeHub[]; disclaimer: string }) {
  const [hubId, setHubId] = useState(hubs[0]?.id);
  const record = property.commute.find((c) => c.hubId === hubId);
  const hub = hubs.find((h) => h.id === hubId);
  const radius = (mins: number) => (Math.min(mins, 60) / 60) * 84;

  return (
    <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
      <svg viewBox="-100 -100 200 200" className="mx-auto h-52 w-52" role="img" aria-label={record ? `Drive time to ${hub?.name}: ${record.offPeakMins} minutes off-peak, ${record.peakMins} minutes at peak` : `No measured drive time to ${hub?.name} yet`}>
        {RINGS.map((m) => (
          <g key={m}>
            <circle r={radius(m)} fill="none" stroke="rgb(var(--line-strong))" strokeDasharray={m === 60 ? undefined : '2 3'} />
            <text x={radius(m) * 0.71 + 2} y={-radius(m) * 0.71} className="fill-ink-muted font-mono text-[8px]">{m}′</text>
          </g>
        ))}
        <path d="M-90 0H90M0-90V90" stroke="rgb(var(--line))" />
        {record && (
          <>
            <circle r={radius(record.peakMins)} fill="rgb(var(--accent) / 0.12)" stroke="rgb(var(--accent-ink))" strokeDasharray="4 3" />
            <circle r={radius(record.offPeakMins)} fill="rgb(var(--accent) / 0.18)" stroke="rgb(var(--accent-ink))" />
          </>
        )}
        <circle r="5" fill="rgb(var(--accent))" />
      </svg>
      <div>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Office hub">
          {hubs.map((h) => (
            <button key={h.id} type="button" role="radio" aria-checked={hubId === h.id} onClick={() => setHubId(h.id)} className="chip text-2xs">
              {h.name}
            </button>
          ))}
        </div>
        {record ? (
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-ink-muted">Off-peak</dt>
              <dd className="font-serif text-2xl">{record.offPeakMins} min</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Peak</dt>
              <dd className="font-serif text-2xl">{record.peakMins} min</dd>
            </div>
          </dl>
        ) : null}
        {record ? (
          <p className="mt-2 text-2xs text-ink-muted">Source: {record.source} · as of {record.asOf}</p>
        ) : (
          <p className="mt-4 text-ink-muted">We haven’t published a measured drive time from {property.title} to {hub?.name} yet. Ask the advisor for a timed route.</p>
        )}
        <p className="mt-3 text-2xs text-ink-muted">{disclaimer}</p>
      </div>
    </div>
  );
}
