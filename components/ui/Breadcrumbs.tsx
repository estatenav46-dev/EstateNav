import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({ items, className = '' }: { items: { name: string; path: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="inline-flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              {last ? (
                <span aria-current="page" className="truncate text-ink">{item.name}</span>
              ) : (
                <Link href={item.path} className="inline-flex min-h-[32px] items-center hover:text-ink">{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
