import { describe, it, expect } from 'vitest';
import { letterPhotos, letterStatus, isLetterSent, summarizeLetters } from './letters';
import type { LoveLetter } from '../types';

function mk(partial: Partial<LoveLetter> = {}): LoveLetter {
  return {
    id: 'letter-x',
    date: '2026-03-06T08:00:00.000Z',
    title: 'Gửi anh',
    content: 'Nội dung',
    mood: 'love',
    isFavorite: false,
    ...partial,
  };
}

describe('letters helpers', () => {
  it('falls back to legacy photoUrl when photoUrls is absent', () => {
    expect(letterPhotos(mk({ photoUrl: 'data:image/jpeg;base64,a' }))).toEqual([
      'data:image/jpeg;base64,a',
    ]);
  });

  it('prefers photoUrls over photoUrl', () => {
    const letter = mk({ photoUrl: 'old', photoUrls: ['a', 'b'] });
    expect(letterPhotos(letter)).toEqual(['a', 'b']);
  });

  it('treats letters without status as sent (backward compat)', () => {
    expect(letterStatus(mk())).toBe('sent');
    expect(isLetterSent(mk({ status: 'draft' }))).toBe(false);
    expect(isLetterSent(mk({ status: 'sent' }))).toBe(true);
  });

  it('summarizes counts and top mood', () => {
    const summary = summarizeLetters([
      mk({ id: '1', mood: 'miss' }),
      mk({ id: '2', mood: 'love', status: 'draft', photoUrls: ['a', 'b'] }),
      mk({ id: '3', mood: 'miss', photoUrl: 'c' }),
    ]);
    expect(summary).toEqual({ total: 3, sent: 2, drafts: 1, photos: 3, topMood: 'miss' });
  });

  it('summarizes an empty list', () => {
    expect(summarizeLetters([])).toEqual({
      total: 0,
      sent: 0,
      drafts: 0,
      photos: 0,
      topMood: null,
    });
  });
});
