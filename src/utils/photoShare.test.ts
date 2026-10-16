import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shareText, sharePhoto, copyToClipboard } from './photoShare';
import type { CouplePhoto } from '../types';

const shareMock = vi.fn();
const writeTextMock = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  shareMock.mockReset();
  writeTextMock.mockClear();
  // Node 20 (CI) has no global navigator, so stub it instead of patching one.
  vi.stubGlobal('navigator', { share: shareMock, clipboard: { writeText: writeTextMock } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('photoShare', () => {
  it('uses native share when available', async () => {
    shareMock.mockResolvedValueOnce(undefined);
    const ok = await shareText('Tiêu đề', 'Nội dung');
    expect(ok).toBe(true);
    expect(shareMock).toHaveBeenCalled();
  });

  it('falls back to clipboard if user cancels', async () => {
    shareMock.mockRejectedValueOnce(new Error('abort'));
    const ok = await shareText('Tiêu đề', 'Nội dung');
    expect(ok).toBe(true);
  });

  it('sharePhoto includes caption & date', async () => {
    shareMock.mockResolvedValueOnce(undefined);
    const photo: CouplePhoto = {
      id: 'p1',
      url: 'data:image/png;base64,xxx',
      caption: 'Kỷ niệm đầu tiên',
      date: '2026-03-04',
      location: 'Hà Nội',
      tag: 'Hẹn hò',
      hearts: 1,
      isFavorite: false,
    };
    const ok = await sharePhoto(photo);
    expect(ok).toBe(true);
    const arg = shareMock.mock.calls[0][0];
    expect(arg.text).toContain('Kỷ niệm đầu tiên');
    expect(arg.text).toContain('Hà Nội');
  });

  it('copyToClipboard writes to clipboard', async () => {
    const ok = await copyToClipboard('hello');
    expect(ok).toBe(true);
  });
});
