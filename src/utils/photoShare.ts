import type { CouplePhoto, LoveLetter } from '../types';

type ShareData = {
  title: string;
  text: string;
  url?: string;
};

function isShareAvailable(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

async function tryNativeShare(data: ShareData): Promise<boolean> {
  if (!isShareAvailable()) return false;
  try {
    await navigator.share(data);
    return true;
  } catch {
    return false;
  }
}

async function fallbackCopy(data: ShareData): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  const payload = [data.text, data.url].filter(Boolean).join('\n');
  try {
    await navigator.clipboard.writeText(payload);
    return true;
  } catch {
    return false;
  }
}

export async function shareText(title: string, text: string): Promise<boolean> {
  const used = await tryNativeShare({ title, text });
  if (used) return true;
  return fallbackCopy({ title, text });
}

export function sharePhoto(photo: CouplePhoto): Promise<boolean> {
  const text = `💖 ${photo.caption}\n📅 ${photo.date}${photo.location ? `\n📍 ${photo.location}` : ''}`;
  return tryNativeShare({ title: 'Khoảnh khắc của tụi mình', text });
}

export function shareLetter(letter: LoveLetter): Promise<boolean> {
  const text = `💌 ${letter.title}\n\n${letter.content}\n\n— ${new Date(letter.date).toLocaleDateString('vi-VN')}`;
  return tryNativeShare({ title: letter.title, text });
}

export function copyToClipboard(text: string): Promise<boolean> {
  return fallbackCopy({ title: '', text });
}
