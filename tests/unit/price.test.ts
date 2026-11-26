import { describe, expect, it } from 'vitest';
import { calculatePricePerSqft, formatINR, formatINRRange, formatINRSpan, formatSqftRange } from '@/lib/price';

describe('formatINR', () => {
  it.each([
    [0, '₹0'],
    [1, '₹1'],
    [99_999, '₹99,999'],
    [100_000, '₹1 L'],
    [8_500_000, '₹85 L'],
    [8_550_000, '₹85.5 L'],
    [9_999_999, '₹1 Cr'], // used to show "₹100 L"
    [10_000_000, '₹1 Cr'],
    [13_500_000, '₹1.35 Cr'],
    [99_990_000, '₹10 Cr'],
    [250_000_000, '₹25 Cr'],
  ])('%i → %s', (amount, expected) => {
    expect(formatINR(amount)).toBe(expected);
  });
});

describe('ranges', () => {
  it('shows "From" when there is no upper price', () => {
    expect(formatINRRange(12_000_000, null)).toBe('From ₹1.2 Cr');
    expect(formatINRRange(12_000_000, 12_000_000)).toBe('From ₹1.2 Cr');
  });

  it('shows a range without repeating the rupee sign', () => {
    expect(formatINRRange(9_000_000, 15_000_000)).toBe('₹90 L – 1.5 Cr');
    expect(formatINRSpan(9_000_000, 15_000_000)).toBe('₹90 L – 1.5 Cr');
  });

  it('adds a suffix for rents', () => {
    expect(formatINRRange(85_000, null, ' /month')).toBe('From ₹85,000 /month');
  });
});

describe('areas and rates', () => {
  it('refuses to divide by zero or negative areas', () => {
    expect(calculatePricePerSqft(10_000_000, 0)).toBeUndefined();
    expect(calculatePricePerSqft(-1, 1000)).toBeUndefined();
    expect(calculatePricePerSqft(Number.NaN, 1000)).toBeUndefined();
    expect(calculatePricePerSqft(10_000_000, 1000)).toBe(10_000);
  });

  it('formats size ranges', () => {
    expect(formatSqftRange(null, null)).toBeNull();
    expect(formatSqftRange(1200, 1600)).toBe('1,200–1,600 sq.ft');
    expect(formatSqftRange(1200, null)).toBe('1,200+ sq.ft');
    expect(formatSqftRange(1200, 1200)).toBe('1,200 sq.ft');
  });
});
