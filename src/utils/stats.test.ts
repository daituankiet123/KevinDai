import { describe, it, expect } from 'vitest';
import { computeNoteStreak, computeMoodByMonth, computeTotalStats } from './stats';
import type { DailyNote } from '../types';

function mk(date: string, mood: DailyNote['mood'] = 'love'): DailyNote {
  return {
    id: date,
    date,
    content: 'x',
    mood,
    author: 'girlfriend',
    hearts: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('stats', () => {
  it('streak counts consecutive days up to today', () => {
    const today = new Date(2026, 2, 6);
    const notes = [mk('2026-03-04'), mk('2026-03-05'), mk('2026-03-06'), mk('2026-03-02')];
    expect(computeNoteStreak(notes, today)).toBe(3);
  });

  it('streak returns 0 if today missing', () => {
    const today = new Date(2026, 2, 6);
    const notes = [mk('2026-03-04'), mk('2026-03-05')];
    expect(computeNoteStreak(notes, today)).toBe(0);
  });

  it('moodByMonth groups and counts', () => {
    const notes = [mk('2026-03-01', 'love'), mk('2026-03-15', 'miss'), mk('2026-02-04', 'love')];
    const rows = computeMoodByMonth(notes);
    expect(rows[0].ym).toBe('2026-03');
    expect(rows[0].counts.love).toBe(1);
    expect(rows[0].counts.miss).toBe(1);
    expect(rows[1].ym).toBe('2026-02');
    expect(rows[1].counts.love).toBe(1);
  });

  it('totalStats sums photos, letters, notes, hearts', () => {
    const s = computeTotalStats({
      photos: [{ hearts: 10 }, { hearts: 5 }],
      letters: [{ isFavorite: true }, { isFavorite: false }],
      dailyNotes: [{ hearts: 3 }, { hearts: 0 }],
    });
    expect(s.photos).toBe(2);
    expect(s.letters).toBe(2);
    expect(s.notes).toBe(2);
    expect(s.hearts).toBe(18);
  });
});
