import { describe, it, expect } from 'vitest';
import { calculateMilitaryCountdown, getAnniversaryStatus } from './dateCalculations';
import { Anniversary } from '../types';

const START = '2026-03-04';
const END = '2028-01-10';
const DATING = '2024-08-29';

function at(dateStr: string): Date {
  // Parse as local time to match the app's own "YYYY-MM-DD" handling.
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

describe('calculateMilitaryCountdown', () => {
  it('is before start when current < start date', () => {
    const r = calculateMilitaryCountdown(START, END, DATING, at('2026-01-01'));
    expect(r.isBeforeStart).toBe(true);
    expect(r.isCompleted).toBe(false);
    expect(r.daysPassed).toBe(0);
    expect(r.progressPercent).toBe(0);
  });

  it('is completed when current >= end date', () => {
    const r = calculateMilitaryCountdown(START, END, DATING, at('2028-02-01'));
    expect(r.isCompleted).toBe(true);
    expect(r.daysPassed).toBe(r.totalDays);
    expect(r.daysRemaining).toBe(0);
    expect(r.progressPercent).toBe(100);
  });

  it('computes days passed and remaining mid-service', () => {
    const r = calculateMilitaryCountdown(START, END, DATING, at('2027-03-04'));
    expect(r.isBeforeStart).toBe(false);
    expect(r.isCompleted).toBe(false);
    expect(r.daysPassed).toBe(365);
    expect(r.daysRemaining).toBeGreaterThan(0);
    expect(r.progressPercent).toBeGreaterThan(0);
    expect(r.progressPercent).toBeLessThan(100);
  });

  it('computes total days correctly', () => {
    const r = calculateMilitaryCountdown(START, END, DATING, at('2027-01-01'));
    // 2026-03-04 -> 2028-01-10
    const start = at(START).getTime();
    const end = at(END).getTime();
    const expected = Math.round((end - start) / (1000 * 60 * 60 * 24));
    expect(r.totalDays).toBe(expected);
  });

  it('handles leap year in total days dating', () => {
    const r = calculateMilitaryCountdown(START, END, DATING, at('2028-01-10'));
    // 2024-08-29 -> 2028-01-10 spans 2024 & 2026 & 2027 (2024 and 2028 leap)
    expect(r.totalDaysDating).toBeGreaterThan(0);
  });

  it('never returns negative days remaining', () => {
    const r = calculateMilitaryCountdown(START, END, DATING, at('2030-01-01'));
    expect(r.daysRemaining).toBe(0);
  });

  it('clamps progress to [0, 100]', () => {
    const before = calculateMilitaryCountdown(START, END, DATING, at('2020-01-01'));
    const after = calculateMilitaryCountdown(START, END, DATING, at('2030-01-01'));
    expect(before.progressPercent).toBe(0);
    expect(after.progressPercent).toBe(100);
  });

  it('countdown target is start date when before start', () => {
    const r = calculateMilitaryCountdown(START, END, DATING, at('2026-03-01'));
    expect(r.isBeforeStart).toBe(true);
    expect(r.daysRemaining).toBeGreaterThan(0);
    expect(r.daysRemaining).toBeLessThanOrEqual(4);
  });
});

describe('getAnniversaryStatus', () => {
  const base: Anniversary = {
    id: 'a1',
    title: 'Test',
    date: '2026-03-04',
    isAnnual: false,
    category: 'love',
    reminderDaysBefore: 5,
  };

  it('marks a specific date today correctly', () => {
    const status = getAnniversaryStatus(base, at('2026-03-04'));
    expect(status.isToday).toBe(true);
    expect(status.daysRemaining).toBe(0);
  });

  it('marks upcoming specific date as urgent within reminder window', () => {
    const status = getAnniversaryStatus(base, at('2026-03-01'));
    expect(status.isUrgent).toBe(true);
    expect(status.daysRemaining).toBe(3);
  });

  it('does not mark past specific date as urgent', () => {
    const status = getAnniversaryStatus(base, at('2026-03-10'));
    expect(status.isUrgent).toBe(false);
  });

  it('annual anniversary rolls to next year when passed', () => {
    const annual: Anniversary = { ...base, isAnnual: true, date: '2024-08-29' };
    const status = getAnniversaryStatus(annual, at('2025-01-01'));
    // 29/08/2024 passed -> target 29/08/2025
    expect(status.daysRemaining).toBeGreaterThan(0);
    expect(status.formattedDate).toContain('2025');
  });

  it('annual anniversary on same day is today', () => {
    const annual: Anniversary = { ...base, isAnnual: true, date: '2024-08-29' };
    const status = getAnniversaryStatus(annual, at('2026-08-29'));
    expect(status.isToday).toBe(true);
  });

  it('formats date as DD/MM/YYYY', () => {
    const status = getAnniversaryStatus(base, at('2026-01-01'));
    expect(status.formattedDate).toBe('04/03/2026');
  });
});
