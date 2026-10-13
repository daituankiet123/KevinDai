import { create } from 'zustand';
import {
  CoupleData,
  Anniversary,
  LoveLetter,
  WishItem,
  CouplePhoto,
  DailyNote,
} from './types';
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
import { loadPhotosIndexedDB, savePhotosIndexedDB } from './utils/photoStorage';

interface AppState {
  couple: CoupleData;
  anniversaries: Anniversary[];
  letters: LoveLetter[];
  wishes: WishItem[];
  photos: CouplePhoto[];
  dailyNotes: DailyNote[];

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
  importData: (data: Record<string, unknown>) => void;
  hydratePhotos: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  couple: loadCoupleData(),
  anniversaries: loadAnniversaries(),
  letters: loadLetters(),
  wishes: loadWishes(),
  photos: DEFAULT_PHOTOS,
  dailyNotes: loadDailyNotes(),

  hydratePhotos: async () => {
    const photos = await loadPhotosIndexedDB(DEFAULT_PHOTOS);
    set({ photos });
  },

  updateCouple: (data) => {
    saveCoupleData(data);
    set({ couple: data });
  },

  addAnniversary: (anniv) =>
    set((state) => {
      const anniversaries = [anniv, ...state.anniversaries];
      saveAnniversaries(anniversaries);
      return { anniversaries };
    }),

  deleteAnniversary: (id) =>
    set((state) => {
      const anniversaries = state.anniversaries.filter((a) => a.id !== id);
      saveAnniversaries(anniversaries);
      return { anniversaries };
    }),

  addLetter: (letter) =>
    set((state) => {
      const letters = [letter, ...state.letters];
      saveLetters(letters);
      return { letters };
    }),

  deleteLetter: (id) =>
    set((state) => {
      const letters = state.letters.filter((l) => l.id !== id);
      saveLetters(letters);
      return { letters };
    }),

  toggleFavoriteLetter: (id) =>
    set((state) => {
      const letters = state.letters.map((l) =>
        l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
      );
      saveLetters(letters);
      return { letters };
    }),

  addWish: (wish) =>
    set((state) => {
      const wishes = [...state.wishes, wish];
      saveWishes(wishes);
      return { wishes };
    }),

  toggleWish: (id) =>
    set((state) => {
      const wishes = state.wishes.map((w) =>
        w.id === id ? { ...w, completed: !w.completed } : w
      );
      saveWishes(wishes);
      return { wishes };
    }),

  heartWish: (id) =>
    set((state) => {
      const wishes = state.wishes.map((w) =>
        w.id === id ? { ...w, hearts: w.hearts + 1 } : w
      );
      saveWishes(wishes);
      return { wishes };
    }),

  deleteWish: (id) =>
    set((state) => {
      const wishes = state.wishes.filter((w) => w.id !== id);
      saveWishes(wishes);
      return { wishes };
    }),

  addPhoto: (photo) =>
    set((state) => {
      const photos = [photo, ...state.photos];
      savePhotosIndexedDB(photos);
      return { photos };
    }),

  deletePhoto: (id) =>
    set((state) => {
      const photos = state.photos.filter((p) => p.id !== id);
      savePhotosIndexedDB(photos);
      return { photos };
    }),

  toggleFavoritePhoto: (id) =>
    set((state) => {
      const photos = state.photos.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      );
      savePhotosIndexedDB(photos);
      return { photos };
    }),

  heartPhoto: (id) =>
    set((state) => {
      const photos = state.photos.map((p) =>
        p.id === id ? { ...p, hearts: p.hearts + 1 } : p
      );
      savePhotosIndexedDB(photos);
      return { photos };
    }),

  editPhotoCaption: (id, caption) =>
    set((state) => {
      const photos = state.photos.map((p) =>
        p.id === id ? { ...p, caption } : p
      );
      savePhotosIndexedDB(photos);
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
      saveDailyNotes(dailyNotes);
      return { dailyNotes };
    }),

  deleteNote: (id) =>
    set((state) => {
      const dailyNotes = state.dailyNotes.filter((n) => n.id !== id);
      saveDailyNotes(dailyNotes);
      return { dailyNotes };
    }),

  heartNote: (id) =>
    set((state) => {
      const dailyNotes = state.dailyNotes.map((n) =>
        n.id === id ? { ...n, hearts: (n.hearts || 0) + 1 } : n
      );
      saveDailyNotes(dailyNotes);
      return { dailyNotes };
    }),

  importData: (data) => {
    const next: Partial<Pick<AppState, 'couple' | 'anniversaries' | 'letters' | 'wishes' | 'photos' | 'dailyNotes'>> = {};
    if (data.couple) {
      saveCoupleData(data.couple as CoupleData);
      next.couple = data.couple as CoupleData;
    }
    if (data.anniversaries) {
      saveAnniversaries(data.anniversaries as Anniversary[]);
      next.anniversaries = data.anniversaries as Anniversary[];
    }
    if (data.letters) {
      saveLetters(data.letters as LoveLetter[]);
      next.letters = data.letters as LoveLetter[];
    }
    if (data.wishes) {
      saveWishes(data.wishes as WishItem[]);
      next.wishes = data.wishes as WishItem[];
    }
    if (data.photos) {
      savePhotosIndexedDB(data.photos as CouplePhoto[]);
      next.photos = data.photos as CouplePhoto[];
    }
    if (Array.isArray(data.dailyNotes)) {
      saveDailyNotes(data.dailyNotes as DailyNote[]);
      next.dailyNotes = data.dailyNotes as DailyNote[];
    }
    set(next);
  },
}));
