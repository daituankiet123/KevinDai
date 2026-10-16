import type { LoveLetter, MoodType } from '../types';

export type LetterStatus = 'draft' | 'sent';

export function letterPhotos(letter: LoveLetter): string[] {
  return letter.photoUrls ?? (letter.photoUrl ? [letter.photoUrl] : []);
}

export function letterStatus(letter: LoveLetter): LetterStatus {
  return letter.status ?? 'sent';
}

export function isLetterSent(letter: LoveLetter): boolean {
  return letterStatus(letter) === 'sent';
}

export interface LetterSummary {
  total: number;
  sent: number;
  drafts: number;
  photos: number;
  topMood: MoodType | null;
}

export function summarizeLetters(letters: LoveLetter[]): LetterSummary {
  const moodCounts = new Map<MoodType, number>();
  let sent = 0;
  let photos = 0;

  for (const letter of letters) {
    if (isLetterSent(letter)) sent++;
    photos += letterPhotos(letter).length;
    moodCounts.set(letter.mood, (moodCounts.get(letter.mood) ?? 0) + 1);
  }

  let topMood: MoodType | null = null;
  let topCount = 0;
  for (const [mood, count] of moodCounts) {
    if (count > topCount) {
      topCount = count;
      topMood = mood;
    }
  }

  return {
    total: letters.length,
    sent,
    drafts: letters.length - sent,
    photos,
    topMood,
  };
}
