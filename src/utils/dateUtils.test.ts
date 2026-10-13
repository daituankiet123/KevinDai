import { describe, it, expect } from 'vitest';
import { todayStr, todayMonthStr, pad2 } from './dateUtils';

describe('dateUtils', () => {
  it('pad2 pads single digits', () => {
    expect(pad2(1)).toBe('01');
    expect(pad2(10)).toBe('10');
  });

  it('todayStr uses local timezone, not UTC', () => {
    // 2026-01-01 00:30 local time. In UTC+7 this is 2025-12-31 17:30 UTC,
    // which would be wrong if we used toISOString().slice(0,10).
    const d = new Date(2026, 0, 1, 0, 30, 0);
    expect(todayStr(d)).toBe('2026-01-01');
  });

  it('todayStr formats month and day with leading zeros', () => {
    const d = new Date(2026, 2, 4, 12, 0, 0);
    expect(todayStr(d)).toBe('2026-03-04');
  });

  it('todayMonthStr returns YYYY-MM', () => {
    const d = new Date(2026, 11, 25, 12, 0, 0);
    expect(todayMonthStr(d)).toBe('2026-12');
  });
});
