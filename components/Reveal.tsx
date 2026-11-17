'use client';

import { Children, createElement, Fragment, isValidElement, useEffect, useLayoutEffect, useRef, type CSSProperties, type ElementType, type ReactElement, type ReactNode } from 'react';

// One shared IntersectionObserver runs every reveal on the page, once each. On the first load
// anything already on screen is left alone (no flash before hydration); after a client-side
// navigation, on-screen blocks animate in as well.
let observer: IntersectionObserver | null = null;
let booted = false;

/** Called once the first page has hydrated (components/ui/Interactions.tsx). */
export function markRevealBooted() {
  booted = true;
}

function getObserver() {
  if (typeof IntersectionObserver === 'undefined') return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.reveal = 'shown';
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  );
  return observer;
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type RevealVariant = 'up' | 'zoom' | 'left' | 'right' | 'clip' | 'words';
type Props = { children: ReactNode; className?: string; index?: number; as?: ElementType; id?: string; variant?: RevealVariant; style?: CSSProperties };

export function Reveal({ children, className = '', index = 0, as = 'div', id, variant = 'up', style }: Props) {
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const element = ref.current;
    const io = getObserver();
    if (!element || !io || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = element.getBoundingClientRect();
    const onScreen = box.top < window.innerHeight * 0.92 && box.bottom > 0;
    if (onScreen && !booted) return;
    element.dataset.reveal = 'waiting';
    io.observe(element);
    return () => io.unobserve(element);
  }, []);

  return createElement(
    as,
    {
      ref,
      id,
      'data-variant': variant,
      className: `reveal ${className}`,
      style: { '--reveal-delay': `${Math.min(index, 8) * 90}ms`, ...style },
      onFocusCapture: () => {
        if (ref.current) ref.current.dataset.reveal = 'shown';
      },
    },
    variant === 'clip' ? <div className="rv-clip">{children}</div> : children,
  );
}

/**
 * Splits text into masked words for the "words" reveal. Accepts plain strings, fragments and
 * one level of styled spans, e.g. <>Where do you <span className="text-accent-ink">live?</span></>.
 */
export function Words({ children }: { children: ReactNode }) {
  let i = 0;
  const split = (text: string, className?: string): ReactNode[] =>
    text.split(/(\s+)/).map((part, k) =>
      part.trim() ? (
        <span key={`w${i}-${k}`} className="rw-word">
          <span className={className} style={{ '--i': i++ } as CSSProperties}>{part}</span>
        </span>
      ) : (
        part && ' '
      ),
    );
  const walk = (node: ReactNode): ReactNode =>
    Children.map(node, (child) => {
      if (typeof child === 'string') return split(child);
      if (!isValidElement(child)) return child;
      const element = child as ReactElement<{ children?: ReactNode; className?: string }>;
      if (element.type === Fragment) return walk(element.props.children);
      if (typeof element.props.children === 'string') return split(element.props.children, element.props.className);
      return child;
    });
  return <>{walk(children)}</>;
}
