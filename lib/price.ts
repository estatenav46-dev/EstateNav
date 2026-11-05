const SQFT_TO_SQM = 0.092903;

export function formatINR(amount: number): string {
  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    return `₹${Number(crore.toFixed(crore % 1 === 0 ? 0 : 2))} Cr`;
  }
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    return `₹${Number(lakh.toFixed(lakh % 1 === 0 ? 0 : 2))} L`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatPrice(amount: number, type: 'onwards' | 'fixed' | 'per-sqft-month'): string {
  if (type === 'per-sqft-month') return `₹${Math.round(amount).toLocaleString('en-IN')}/sq.ft/month`;
  return `${formatINR(amount)}${type === 'onwards' ? ' onwards' : ''}`;
}

export function sqftToSqm(areaSqft: number): number {
  return areaSqft * SQFT_TO_SQM;
}

export function formatArea(areaSqft: number): string {
  return `${areaSqft.toLocaleString('en-IN')} sq.ft. (${sqftToSqm(areaSqft).toFixed(2)} sq.m)`;
}

export function calculatePricePerSqft(priceINR: number, areaSqft: number): number | undefined {
  if (!Number.isFinite(priceINR) || !Number.isFinite(areaSqft) || priceINR <= 0 || areaSqft <= 0) return undefined;
  return Math.round(priceINR / areaSqft);
}

export function formatPricePerSqft(pricePerSqft: number): string {
  return `₹${Math.round(pricePerSqft).toLocaleString('en-IN')}/sq.ft.`;
}

/** "1.35 Cr" / "90 L" without the rupee sign, for the second half of a range. */
export function formatINRShort(amount: number): string {
  return formatINR(amount).replace('₹', '');
}

export function formatINRRange(min: number, max: number | null | undefined, suffix = ''): string {
  if (!max || max <= min) return `From ${formatINR(min)}${suffix}`;
  return `${formatINR(min)} – ${formatINRShort(max)}${suffix}`;
}

export function formatSqft(value: number): string {
  return `${Math.round(value).toLocaleString('en-IN')} sq.ft`;
}

export function formatSqftRange(min: number | null | undefined, max: number | null | undefined): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) return `${min.toLocaleString('en-IN')}–${max.toLocaleString('en-IN')} sq.ft`;
  if (min != null && max == null) return `${min.toLocaleString('en-IN')}+ sq.ft`;
  return formatSqft((min ?? max)!);
}
