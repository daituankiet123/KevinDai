import { describe, it, expect, beforeEach, vi } from 'vitest';

// localStorage stub
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

vi.stubGlobal('localStorage', localStorageMock);

import {
  loadCoupleData,
  loadAnniversaries,
  DEFAULT_ANNIVERSARIES,
  DEFAULT_COUPLE,
} from './storage';

describe('storage migrations', () => {
  beforeEach(() => {
    store.clear();
  });

  it('loadCoupleData returns defaults when nothing stored', () => {
    const couple = loadCoupleData();
    expect(couple.boyfriendName).toBe('Đại Tuấn Kiệt');
    expect(couple.militaryStartDate).toBe('2026-03-04');
    expect(couple.militaryEndDate).toBe('2028-01-10');
  });

  it('loadCoupleData auto-corrects outdated military dates (one-time migration)', () => {
    store.set(
      'love_soldier_couple_data_v4',
      JSON.stringify({
        boyfriendName: 'Test',
        girlfriendName: 'Test GF',
        militaryStartDate: '2026-04-04',
        militaryEndDate: '2028-04-04',
        datingStartDate: '2024-08-29',
      })
    );
    const couple = loadCoupleData();
    expect(couple.militaryStartDate).toBe('2026-03-04');
    expect(couple.militaryEndDate).toBe('2028-01-10');
  });

  it('loadCoupleData preserves user-edited dates after migration ran', () => {
    store.set(
      'love_soldier_couple_data_v4',
      JSON.stringify({
        boyfriendName: 'Test',
        girlfriendName: 'Test GF',
        militaryStartDate: '2026-04-04',
        militaryEndDate: '2028-04-04',
        datingStartDate: '2024-08-29',
      })
    );
    loadCoupleData(); // runs migration
    // Simulate user later editing the dates in settings.
    const edited = {
      ...DEFAULT_COUPLE,
      militaryStartDate: '2026-05-05',
      militaryEndDate: '2028-05-05',
    };
    store.set('love_soldier_couple_data_v4', JSON.stringify(edited));
    const couple = loadCoupleData();
    expect(couple.militaryStartDate).toBe('2026-05-05');
    expect(couple.militaryEndDate).toBe('2028-05-05');
  });

  it('loadAnniversaries migrates legacy dates to defaults', () => {
    store.set(
      'love_soldier_anniversaries_v4',
      JSON.stringify([{ id: 'anniv-5', date: '2026-04-04', title: 'old' }])
    );
    const anniversaries = loadAnniversaries();
    expect(anniversaries).toEqual(DEFAULT_ANNIVERSARIES);
  });

  it('loadAnniversaries preserves custom data after migration ran', () => {
    store.set(
      'love_soldier_anniversaries_v4',
      JSON.stringify([{ id: 'anniv-5', date: '2026-04-04', title: 'old' }])
    );
    loadAnniversaries(); // runs migration
    const custom = [{ id: 'x', date: '2026-05-05', title: 'custom' }];
    store.set('love_soldier_anniversaries_v4', JSON.stringify(custom));
    const anniversaries = loadAnniversaries();
    expect(anniversaries).toEqual(custom);
  });

  it('loadAnniversaries returns stored data when valid', () => {
    const valid = [{ id: 'x', date: '2026-05-05', title: 'custom' }];
    store.set('love_soldier_anniversaries_v4', JSON.stringify(valid));
    const anniversaries = loadAnniversaries();
    expect(anniversaries).toEqual(valid);
  });
});
