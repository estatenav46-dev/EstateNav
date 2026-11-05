'use client';

// Each digit is a column of 0–9 that slides to its value (transform only).
export function NumberRoll({ value, className = '' }: { value: number; className?: string }) {
  const digits = String(Math.max(0, Math.round(value))).split('');
  return (
    <span className={`tabular inline-flex overflow-hidden align-bottom leading-none ${className}`} aria-hidden="true">
      {digits.map((digit, i) => (
        <span key={`${digits.length}-${i}`} className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
          <span className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-slow ease-out" style={{ transform: `translateY(-${Number(digit) * 10}%)` }}>
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block h-[1em] text-center leading-none">{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
