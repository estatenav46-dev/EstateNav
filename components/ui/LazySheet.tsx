'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, type ComponentProps } from 'react';

// The sheet library (vaul + Radix Dialog) loads the first time a sheet opens, not with the page.
const Sheet = dynamic(() => import('./Sheet').then((m) => m.Sheet), { ssr: false });

export function LazySheet(props: ComponentProps<typeof Sheet>) {
  const [used, setUsed] = useState(props.open);
  useEffect(() => {
    if (props.open) setUsed(true);
  }, [props.open]);
  return used ? <Sheet {...props} /> : null;
}
