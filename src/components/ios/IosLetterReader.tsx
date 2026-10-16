import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Icon } from './Icon';
import { LETTER_MOOD_META } from '../../constants';
import { letterPhotos, letterStatus } from '../../utils/letters';
import { shareLetter } from '../../utils/photoShare';
import type { LoveLetter } from '../../types';

type Props = {
  letter: LoveLetter;
  isRandomReveal?: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onSend: () => void;
  onDelete: () => void;
};

export function IosLetterReader({
  letter,
  isRandomReveal = false,
  onClose,
  onToggleFavorite,
  onEdit,
  onSend,
  onDelete,
}: Props) {
  const photos = letterPhotos(letter);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const sent = letterStatus(letter) === 'sent';
  const mood = LETTER_MOOD_META[letter.mood] ?? LETTER_MOOD_META.love;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Lá thư ${letter.title}`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl border border-line ios-card-gradient p-6 pb-safe shadow-2xl sm:rounded-3xl ${
          isRandomReveal ? 'animate-pop-in' : 'animate-[slideUp_0.25s_ease-out]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                {mood.icon}
              </span>
              <span className="ios-pill bg-rose/20 text-rose">{mood.label}</span>
              {sent && (
                <span className="ios-pill bg-line text-mute" title="Thư đã niêm phong">
                  🔒 Đã gửi
                </span>
              )}
              {!sent && (
                <span className="ios-pill bg-amber-400/20 text-amber-300">Nháp</span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-mute">
              Ngày viết {new Date(letter.date).toLocaleDateString('vi-VN')}
              {sent && letter.sentAt
                ? ` · Gửi ${new Date(letter.sentAt).toLocaleDateString('vi-VN')}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-line text-mute transition active:bg-line/60 touch-target"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <h2 className="font-script text-3xl leading-tight text-rose">{letter.title}</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
          {letter.content}
        </p>

        {photos.length > 0 && (
          <div className={`mt-4 grid gap-2 ${photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {photos.map((src, i) => (
              <button
                key={`${src.slice(0, 24)}-${i}`}
                type="button"
                onClick={() => setViewerIndex(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                className="overflow-hidden rounded-2xl border border-line active:opacity-80 transition"
              >
                <img src={src} alt={`Ảnh đính kèm ${i + 1}`} className="h-36 w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={letter.isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-line text-lg transition active:scale-95 touch-target"
          >
            {letter.isFavorite ? '❤️' : '🤍'}
          </button>
          <button
            type="button"
            onClick={() => void shareLetter(letter)}
            aria-label="Chia sẻ lá thư"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-line text-rose transition active:scale-95 touch-target"
          >
            <Share2 size={18} />
          </button>
          <div className="flex-1" />
          {!sent && (
            <>
              <button
                type="button"
                onClick={onEdit}
                aria-label="Sửa thư"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-line text-mute transition active:scale-95 touch-target"
              >
                <Icon name="pen" size={18} />
              </button>
              <button
                type="button"
                onClick={onSend}
                className="rounded-full bg-rose px-4 py-2 text-xs font-semibold text-night transition active:opacity-80 touch-target"
              >
                Gửi thư
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onDelete}
            aria-label="Xoá lá thư"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-rose/15 text-rose transition active:scale-95 touch-target"
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      </div>

      {viewerIndex !== null && photos[viewerIndex] && (
        <div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95"
          onClick={(e) => {
            e.stopPropagation();
            setViewerIndex(null);
          }}
        >
          <img
            src={photos[viewerIndex]}
            alt={`Ảnh đính kèm ${viewerIndex + 1}`}
            className="max-h-[80vh] max-w-[94vw] rounded-2xl object-contain"
          />
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              disabled={viewerIndex === 0}
              onClick={(e) => {
                e.stopPropagation();
                setViewerIndex((i) => (i === null ? i : Math.max(0, i - 1)));
              }}
              aria-label="Ảnh trước"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 touch-target"
            >
              <Icon name="back" size={20} />
            </button>
            <span className="text-xs text-white/70">
              {viewerIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              disabled={viewerIndex >= photos.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                setViewerIndex((i) => (i === null ? i : Math.min(photos.length - 1, i + 1)));
              }}
              aria-label="Ảnh sau"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 touch-target"
            >
              <Icon name="chevron" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
