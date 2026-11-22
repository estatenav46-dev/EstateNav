'use client';

import { Download, ExternalLink, FileText, Lock } from 'lucide-react';
import type { Property } from '@/lib/data/types';
import { DOCUMENT_KIND_LABEL } from '@/lib/listingMeta';
import { openLeadSheet } from '@/lib/ui/stores';
import { track } from '@/lib/ui/visitor';

const size = (bytes: number | null) => (!bytes ? null : bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

// Public documents download directly; "on request" ones open the lead form (their links never
// reach the browser — see lib/data/publicView.ts).
export function DocumentList({ property }: { property: Property }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {property.documents.map((doc) => {
        const open = doc.access === 'public';
        const meta = [DOCUMENT_KIND_LABEL[doc.kind], doc.format === 'pdf' ? 'PDF' : doc.format === 'image' ? 'Image' : null, size(doc.sizeBytes)].filter(Boolean).join(' · ');
        const body = (
          <>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-ink">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{doc.label}</span>
              <span className="block text-xs text-ink-muted">{meta}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent-ink">
              {open ? (
                doc.format === 'link' ? (
                  <>
                    Open <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Download <Download className="h-4 w-4" aria-hidden="true" />
                  </>
                )
              ) : (
                <>
                  Request <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              )}
            </span>
          </>
        );
        const className = 'lift flex w-full items-center gap-3 rounded-[14px] border border-line bg-surface p-3 text-left';
        return (
          <li key={doc.id}>
            {open ? (
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className={className} onClick={() => track('cta', { kind: `document-${doc.kind}`, id: property.id })}>
                {body}
              </a>
            ) : (
              <button type="button" className={className} onClick={() => openLeadSheet('price-sheet', `Please share the ${doc.label} for ${property.title}.`)}>
                {body}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
