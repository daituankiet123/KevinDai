import { get, set, del } from 'idb-keyval';
import { CouplePhoto } from '../types';

// Photos (base64 data URLs) can exceed localStorage's ~5MB quota, so they are
// persisted to IndexedDB instead. This module wraps idb-keyval with a
// localStorage->IndexedDB migration on first load.

const IDB_KEY = 'love_soldier_photos_v5';
const LEGACY_LS_KEY = 'love_soldier_photos_v4';

export async function loadPhotosIndexedDB(defaultPhotos: CouplePhoto[]): Promise<CouplePhoto[]> {
  try {
    const stored = await get<CouplePhoto[]>(IDB_KEY);
    if (Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
    // Migrate from legacy localStorage key if present.
    const legacy = localStorage.getItem(LEGACY_LS_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as CouplePhoto[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        await set(IDB_KEY, parsed);
        return parsed;
      }
    }
    await set(IDB_KEY, defaultPhotos);
    return defaultPhotos;
  } catch {
    return defaultPhotos;
  }
}

export async function savePhotosIndexedDB(photos: CouplePhoto[]): Promise<void> {
  await set(IDB_KEY, photos);
}

// Serialize concurrent photo writes so rapid successive actions (heart, favorite,
// delete) never persist a stale snapshot. Each call enqueues the latest array and
// a trailing write coalesces intermediate updates.
let pendingPhotos: CouplePhoto[] | null = null;
let writeChain: Promise<void> = Promise.resolve();
let writeScheduled = false;

export function queueSavePhotos(photos: CouplePhoto[]): void {
  pendingPhotos = photos;
  if (writeScheduled) return;
  writeScheduled = true;
  writeChain = writeChain.then(async () => {
    writeScheduled = false;
    const snapshot = pendingPhotos;
    if (!snapshot) return;
    pendingPhotos = null;
    try {
      await savePhotosIndexedDB(snapshot);
    } catch (e) {
      console.error('Không thể lưu ảnh vào IndexedDB:', e);
    }
  });
}

export async function clearPhotosIndexedDB(): Promise<void> {
  try {
    await del(IDB_KEY);
  } catch {
    // ignore
  }
}
