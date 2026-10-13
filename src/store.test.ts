import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CouplePhoto, DailyNote, WishItem } from './types';

// localStorage stub
const ls = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => ls.get(k) ?? null,
  setItem: (k: string, v: string) => void ls.set(k, v),
  removeItem: (k: string) => void ls.delete(k),
  clear: () => ls.clear(),
});

// Mock IndexedDB-backed photo storage to avoid idb-keyval in node.
vi.mock('./utils/photoStorage', () => {
  let stored: CouplePhoto[] = [];
  return {
    loadPhotosIndexedDB: async (d: CouplePhoto[]) => (stored.length ? stored : d),
    savePhotosIndexedDB: async (photos: CouplePhoto[]) => {
      stored = photos;
    },
  };
});

import { useAppStore } from './store';

const photo = (id: string): CouplePhoto => ({
  id,
  url: 'data:image/png;base64,x',
  caption: 'test',
  date: '2026-03-04',
  tag: 'Hẹn hò',
  hearts: 1,
  isFavorite: false,
});

const note = (id: string, date = '2026-03-04'): DailyNote => ({
  id,
  date,
  content: 'hello',
  mood: 'love',
  author: 'girlfriend',
  hearts: 0,
  createdAt: '2026-03-04T00:00:00.000Z',
});

describe('useAppStore actions', () => {
  beforeEach(() => {
    ls.clear();
    useAppStore.setState({ photos: [], dailyNotes: [], wishes: [] });
  });

  it('adds a wish', () => {
    const wish: WishItem = {
      id: 'w1',
      title: 'x',
      completed: false,
      category: 'Hẹn hò',
      hearts: 1,
    };
    useAppStore.getState().addWish(wish);
    expect(useAppStore.getState().wishes).toHaveLength(1);
  });

  it('toggles a wish completed state', () => {
    const wish: WishItem = {
      id: 'w1',
      title: 'x',
      completed: false,
      category: 'Hẹn hò',
      hearts: 1,
    };
    useAppStore.getState().addWish(wish);
    useAppStore.getState().toggleWish('w1');
    expect(useAppStore.getState().wishes[0].completed).toBe(true);
  });

  it('increments wish hearts', () => {
    const wish: WishItem = {
      id: 'w1',
      title: 'x',
      completed: false,
      category: 'Hẹn hò',
      hearts: 1,
    };
    useAppStore.getState().addWish(wish);
    useAppStore.getState().heartWish('w1');
    expect(useAppStore.getState().wishes[0].hearts).toBe(2);
  });

  it('deletes a wish', () => {
    const wish: WishItem = {
      id: 'w1',
      title: 'x',
      completed: false,
      category: 'Hẹn hò',
      hearts: 1,
    };
    useAppStore.getState().addWish(wish);
    useAppStore.getState().deleteWish('w1');
    expect(useAppStore.getState().wishes).toHaveLength(0);
  });

  it('adds a photo and persists', () => {
    useAppStore.getState().addPhoto(photo('p1'));
    expect(useAppStore.getState().photos).toHaveLength(1);
  });

  it('deletes a photo', () => {
    useAppStore.getState().addPhoto(photo('p1'));
    useAppStore.getState().deletePhoto('p1');
    expect(useAppStore.getState().photos).toHaveLength(0);
  });

  it('toggles a photo favorite', () => {
    useAppStore.getState().addPhoto(photo('p1'));
    useAppStore.getState().toggleFavoritePhoto('p1');
    expect(useAppStore.getState().photos[0].isFavorite).toBe(true);
  });

  it('addOrUpdateNote inserts new note sorted by date desc', () => {
    useAppStore.getState().addOrUpdateNote(note('n1', '2026-03-04'));
    useAppStore.getState().addOrUpdateNote(note('n2', '2026-03-05'));
    const dates = useAppStore.getState().dailyNotes.map((n) => n.date);
    expect(dates).toEqual(['2026-03-05', '2026-03-04']);
  });

  it('addOrUpdateNote updates existing note by id instead of duplicating', () => {
    useAppStore.getState().addOrUpdateNote(note('n1', '2026-03-04'));
    useAppStore.getState().addOrUpdateNote({ ...note('n1', '2026-03-04'), content: 'updated' });
    const notes = useAppStore.getState().dailyNotes;
    expect(notes).toHaveLength(1);
    expect(notes[0].content).toBe('updated');
  });
});
