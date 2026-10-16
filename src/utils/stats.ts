import type { DailyNote, DailyNoteMood } from '../types';
import { todayStr } from './dateUtils';

function dateKey(d: string): string {
  return d.slice(0, 10);
}

export function computeNoteStreak(notes: DailyNote[], today: Date = new Date()): number {
  if (notes.length === 0) return 0;
  const days = new Set(notes.map((n) => dateKey(n.date)));
  let streak = 0;
  const cursor = new Date(today);
  while (days.has(todayStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const ALL_MOODS: DailyNoteMood[] = [
  'love',
  'miss',
  'happy',
  'proud',
  'special',
  'excited',
  'tired',
];

export function computeMoodByMonth(
  notes: DailyNote[]
): Array<{ ym: string; counts: Record<DailyNoteMood, number> }> {
  const map = new Map<string, Record<DailyNoteMood, number>>();
  for (const n of notes) {
    const ym = dateKey(n.date).slice(0, 7);
    const row = map.get(ym) ?? ({} as Record<DailyNoteMood, number>);
    for (const m of ALL_MOODS) row[m] = row[m] ?? 0;
    row[n.mood] = (row[n.mood] ?? 0) + 1;
    map.set(ym, row);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([ym, counts]) => ({ ym, counts }));
}

export interface TotalStats {
  photos: number;
  letters: number;
  notes: number;
  hearts: number;
}

export function computeTotalStats(input: {
  photos: { hearts: number }[];
  letters: { isFavorite: boolean }[];
  dailyNotes: { hearts: number }[];
}): TotalStats {
  const hearts =
    input.photos.reduce((s, p) => s + (p.hearts || 0), 0) +
    input.dailyNotes.reduce((s, n) => s + (n.hearts || 0), 0);
  return {
    photos: input.photos.length,
    letters: input.letters.length,
    notes: input.dailyNotes.length,
    hearts,
  };
}
