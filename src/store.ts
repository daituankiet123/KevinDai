import { create } from 'zustand';
import { CoupleData, Anniversary, LoveLetter, WishItem, CouplePhoto, DailyNote } from './types';
import {
  loadCoupleData,
  saveCoupleData,
  loadAnniversaries,
  saveAnniversaries,
  loadLetters,
  saveLetters,
  loadWishes,
  saveWishes,
  loadDailyNotes,
  saveDailyNotes,
  DEFAULT_PHOTOS,
} from './utils/storage';
import { loadPhotosIndexedDB, queueSavePhotos } from './utils/photoStorage';

// Persist photos to IndexedDB via a serialized queue so rapid successive actions
// (heart, favorite, delete) always end up writing the latest snapshot.
function persistPhotos(photos: CouplePhoto[]): void {
  queueSavePhotos(photos);
}

const STORAGE_ERROR_MESSAGE =
  'Không thể lưu dữ liệu (bộ nhớ trình duyệt đã đầy). Hãy xóa bớt ảnh hoặc sao lưu dữ liệu.';

function isCoupleData(value: unknown): value is CoupleData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.boyfriendName === 'string' &&
    typeof v.girlfriendName === 'string' &&
    typeof v.militaryStartDate === 'string' &&
    typeof v.militaryEndDate === 'string' &&
    typeof v.datingStartDate === 'string'
  );
}

function isArrayOf<T>(value: unknown, check: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(check);
}

function isAnniversary(value: unknown): value is Anniversary {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.title === 'string' && typeof v.date === 'string';
}

function isLetter(value: unknown): value is LoveLetter {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.content === 'string' &&
    typeof v.date === 'string'
  );
}

function isWish(value: unknown): value is WishItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.title === 'string';
}

function isPhoto(value: unknown): value is CouplePhoto {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.url === 'string';
}

function isDailyNote(value: unknown): value is DailyNote {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.date === 'string' && typeof v.content === 'string';
}

interface AppState {
  couple: CoupleData;
  anniversaries: Anniversary[];
  letters: LoveLetter[];
  wishes: WishItem[];
  photos: CouplePhoto[];
  dailyNotes: DailyNote[];
  storageError: string | null;
  lastDeleted: { kind: string; item: unknown } | null;

  updateCouple: (data: CoupleData) => void;
  addAnniversary: (anniv: Anniversary) => void;
  deleteAnniversary: (id: string) => void;
  addLetter: (letter: LoveLetter) => void;
  deleteLetter: (id: string) => void;
  toggleFavoriteLetter: (id: string) => void;
  addWish: (wish: WishItem) => void;
  toggleWish: (id: string) => void;
  heartWish: (id: string) => void;
  deleteWish: (id: string) => void;
  addPhoto: (photo: CouplePhoto) => void;
  deletePhoto: (id: string) => void;
  toggleFavoritePhoto: (id: string) => void;
  heartPhoto: (id: string) => void;
  editPhotoCaption: (id: string, caption: string) => void;
  addOrUpdateNote: (note: DailyNote) => void;
  deleteNote: (id: string) => void;
  heartNote: (id: string) => void;
  importData: (data: Record<string, unknown>) => boolean;
  hydratePhotos: () => Promise<void>;
  clearStorageError: () => void;
  clearLastDeleted: () => void;
  undoDelete: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  couple: loadCoupleData(),
  anniversaries: loadAnniversaries(),
  letters: loadLetters(),
  wishes: loadWishes(),
  photos: DEFAULT_PHOTOS,
  dailyNotes: loadDailyNotes(),
  storageError: null,
  lastDeleted: null,

  clearStorageError: () => set({ storageError: null }),

  clearLastDeleted: () => set({ lastDeleted: null }),

  undoDelete: () =>
    set((state) => {
      const { lastDeleted } = state;
      if (!lastDeleted) return {};
      const next: Partial<AppState> = { lastDeleted: null };
      switch (lastDeleted.kind) {
        case 'wish': {
          const wishes = [...state.wishes, lastDeleted.item as WishItem];
          const ok = saveWishes(wishes);
          return { wishes, lastDeleted: null, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
        }
        case 'letter': {
          const letters = [...state.letters, lastDeleted.item as LoveLetter];
          const ok = saveLetters(letters);
          return { letters, lastDeleted: null, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
        }
        case 'anniversary': {
          const anniversaries = [...state.anniversaries, lastDeleted.item as Anniversary];
          const ok = saveAnniversaries(anniversaries);
          return {
            anniversaries,
            lastDeleted: null,
            ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }),
          };
        }
        case 'note': {
          const dailyNotes = [...state.dailyNotes, lastDeleted.item as DailyNote];
          dailyNotes.sort((a, b) => b.date.localeCompare(a.date));
          const ok = saveDailyNotes(dailyNotes);
          return {
            dailyNotes,
            lastDeleted: null,
            ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }),
          };
        }
        case 'photo': {
          const photos = [...state.photos, lastDeleted.item as CouplePhoto];
          persistPhotos(photos);
          return { photos, lastDeleted: null };
        }
        default:
          return next;
      }
    }),

  hydratePhotos: async () => {
    const photos = await loadPhotosIndexedDB(DEFAULT_PHOTOS);
    set({ photos });
  },

  updateCouple: (data) => {
    const ok = saveCoupleData(data);
    set({ couple: data, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) });
  },

  addAnniversary: (anniv) =>
    set((state) => {
      const anniversaries = [anniv, ...state.anniversaries];
      const ok = saveAnniversaries(anniversaries);
      return { anniversaries, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
    }),

  deleteAnniversary: (id) =>
    set((state) => {
      const deleted = state.anniversaries.find((a) => a.id === id);
      const anniversaries = state.anniversaries.filter((a) => a.id !== id);
      const ok = saveAnniversaries(anniversaries);
      return {
        anniversaries,
        lastDeleted: deleted ? { kind: 'anniversary', item: deleted } : null,
        ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }),
      };
    }),

  addLetter: (letter) =>
    set((state) => {
      const letters = [letter, ...state.letters];
      const ok = saveLetters(letters);
      return { letters, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
    }),

  deleteLetter: (id) =>
    set((state) => {
      const deleted = state.letters.find((l) => l.id === id);
      const letters = state.letters.filter((l) => l.id !== id);
      const ok = saveLetters(letters);
      return {
        letters,
        lastDeleted: deleted ? { kind: 'letter', item: deleted } : null,
        ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }),
      };
    }),

  toggleFavoriteLetter: (id) =>
    set((state) => {
      const letters = state.letters.map((l) =>
        l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
      );
      const ok = saveLetters(letters);
      return { letters, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
    }),

  addWish: (wish) =>
    set((state) => {
      const wishes = [...state.wishes, wish];
      const ok = saveWishes(wishes);
      return { wishes, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
    }),

  toggleWish: (id) =>
    set((state) => {
      const wishes = state.wishes.map((w) => (w.id === id ? { ...w, completed: !w.completed } : w));
      const ok = saveWishes(wishes);
      return { wishes, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
    }),

  heartWish: (id) =>
    set((state) => {
      const wishes = state.wishes.map((w) => (w.id === id ? { ...w, hearts: w.hearts + 1 } : w));
      const ok = saveWishes(wishes);
      return { wishes, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
    }),

  deleteWish: (id) =>
    set((state) => {
      const deleted = state.wishes.find((w) => w.id === id);
      const wishes = state.wishes.filter((w) => w.id !== id);
      const ok = saveWishes(wishes);
      return {
        wishes,
        lastDeleted: deleted ? { kind: 'wish', item: deleted } : null,
        ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }),
      };
    }),

  addPhoto: (photo) =>
    set((state) => {
      const photos = [photo, ...state.photos];
      persistPhotos(photos);
      return { photos };
    }),

  deletePhoto: (id) =>
    set((state) => {
      const deleted = state.photos.find((p) => p.id === id);
      const photos = state.photos.filter((p) => p.id !== id);
      persistPhotos(photos);
      return { photos, lastDeleted: deleted ? { kind: 'photo', item: deleted } : null };
    }),

  toggleFavoritePhoto: (id) =>
    set((state) => {
      const photos = state.photos.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      );
      persistPhotos(photos);
      return { photos };
    }),

  heartPhoto: (id) =>
    set((state) => {
      const photos = state.photos.map((p) => (p.id === id ? { ...p, hearts: p.hearts + 1 } : p));
      persistPhotos(photos);
      return { photos };
    }),

  editPhotoCaption: (id, caption) =>
    set((state) => {
      const photos = state.photos.map((p) => (p.id === id ? { ...p, caption } : p));
      persistPhotos(photos);
      return { photos };
    }),

  addOrUpdateNote: (note) =>
    set((state) => {
      const existingIndex = state.dailyNotes.findIndex(
        (n) => n.id === note.id || n.date === note.date
      );
      let dailyNotes: DailyNote[];
      if (existingIndex >= 0) {
        dailyNotes = [...state.dailyNotes];
        dailyNotes[existingIndex] = note;
      } else {
        dailyNotes = [note, ...state.dailyNotes];
      }
      dailyNotes.sort((a, b) => b.date.localeCompare(a.date));
      const ok = saveDailyNotes(dailyNotes);
      return { dailyNotes, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
    }),

  deleteNote: (id) =>
    set((state) => {
      const deleted = state.dailyNotes.find((n) => n.id === id);
      const dailyNotes = state.dailyNotes.filter((n) => n.id !== id);
      const ok = saveDailyNotes(dailyNotes);
      return {
        dailyNotes,
        lastDeleted: deleted ? { kind: 'note', item: deleted } : null,
        ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }),
      };
    }),

  heartNote: (id) =>
    set((state) => {
      const dailyNotes = state.dailyNotes.map((n) =>
        n.id === id ? { ...n, hearts: (n.hearts || 0) + 1 } : n
      );
      const ok = saveDailyNotes(dailyNotes);
      return { dailyNotes, ...(ok ? {} : { storageError: STORAGE_ERROR_MESSAGE }) };
    }),

  importData: (data) => {
    if (!data || typeof data !== 'object') return false;

    const next: Partial<
      Pick<AppState, 'couple' | 'anniversaries' | 'letters' | 'wishes' | 'photos' | 'dailyNotes'>
    > = {};
    let hasValid = false;

    if (data.couple) {
      if (!isCoupleData(data.couple)) return false;
      saveCoupleData(data.couple);
      next.couple = data.couple;
      hasValid = true;
    }
    if (data.anniversaries) {
      if (!isArrayOf(data.anniversaries, isAnniversary)) return false;
      saveAnniversaries(data.anniversaries);
      next.anniversaries = data.anniversaries;
      hasValid = true;
    }
    if (data.letters) {
      if (!isArrayOf(data.letters, isLetter)) return false;
      saveLetters(data.letters);
      next.letters = data.letters;
      hasValid = true;
    }
    if (data.wishes) {
      if (!isArrayOf(data.wishes, isWish)) return false;
      saveWishes(data.wishes);
      next.wishes = data.wishes;
      hasValid = true;
    }
    if (data.photos) {
      if (!isArrayOf(data.photos, isPhoto)) return false;
      persistPhotos(data.photos);
      next.photos = data.photos;
      hasValid = true;
    }
    if (data.dailyNotes) {
      if (!isArrayOf(data.dailyNotes, isDailyNote)) return false;
      saveDailyNotes(data.dailyNotes);
      next.dailyNotes = data.dailyNotes;
      hasValid = true;
    }

    if (!hasValid) return false;
    set(next);
    return true;
  },
}));
