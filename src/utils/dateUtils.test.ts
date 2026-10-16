import { describe, it, expect } from 'vitest';
import {
  todayStr,
  todayMonthStr,
  pad2,
  daysBetween,
  isSameDay,
} from './dateUtils';

describe('dateUtils', () => {
  it('pad2 pads single digits', () => {
    expect(pad2(1)).toBe('01');
    expect(pad2(10)).toBe('10');
  });

  it('todayStr uses local timezone, not UTC', () => {
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

  it('daysBetween counts inclusive whole days', () => {
    const a = new Date(2026, 2, 4);
    const b = new Date(2026, 2, 6);
    expect(daysBetween(a, b)).toBe(2);
  });

  it('daysBetween handles reverse order', () => {
    const a = new Date(2026, 2, 6);
    const b = new Date(2026, 2, 4);
    expect(daysBetween(a, b)).toBe(2);
  });

  it('isSameDay returns true only for identical local dates', () => {
    const a = new Date(2026, 2, 4, 0, 1);
    const b = new Date(2026, 2, 4, 23, 59);
    expect(isSameDay(a, b)).toBe(true);
    const c = new Date(2026, 2, 5, 0, 1);
    expect(isSameDay(a, c)).toBe(false);
  });
});
