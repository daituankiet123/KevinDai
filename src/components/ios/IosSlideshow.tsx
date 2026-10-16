import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from './Icon';
import type { CouplePhoto } from '../../types';

type Props = {
  photos: CouplePhoto[];
  startIndex: number;
  intervalMs?: number;
  onClose: () => void;
  onHeart: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function IosSlideshow({
  photos,
  startIndex,
  intervalMs = 4000,
  onClose,
  onHeart,
  onToggleFavorite,
}: Props) {
  const [index, setIndex] = useState(startIndex);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedAt = useRef(0);

  // Khởi tạo startedAt sau khi mount (tránh impure call trong render)
  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % photos.length);
    startedAt.current = performance.now();
    setProgress(0);
  }, [photos.length]);

  useEffect(() => {
    if (paused || photos.length <= 1) return;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const p = Math.min(1, elapsed / intervalMs);
      setProgress(p);
      if (p >= 1) {
        goNext();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, index, intervalMs, goNext, photos.length]);

  const current = photos[index];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Trình chiếu ảnh"
    >
      <div className="flex items-center justify-between px-4 pt-safe pb-2 text-white">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Trình chiếu · {index + 1}/{photos.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng trình chiếu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
        >
          <Icon name="x" size={22} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <img
          key={current.id}
          src={current.url}
          alt={current.caption}
          className="max-h-full max-w-full object-contain"
          style={{ animation: 'popIn 0.5s ease-out' }}
        />
      </div>

      <div className="space-y-3 px-6 pb-safe pt-4 text-white">
        <div className="text-center">
          <p className="text-sm font-semibold">{current.caption}</p>
          <p className="mt-1 text-xs text-white/60">
            {current.date}
            {current.location && ` · ${current.location}`}
          </p>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-rose transition-[width] duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Tiếp tục' : 'Tạm dừng'}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 active:bg-white/20 touch-target"
          >
            {paused ? <Icon name="check" size={20} /> : <span className="text-base">⏸</span>}
          </button>
          <button
            type="button"
            onClick={() => onHeart(current.id)}
            className="flex h-11 items-center gap-1.5 rounded-full bg-rose/30 px-5 active:bg-rose/40 touch-target"
            aria-label="Thả tim"
          >
            <span>❤️</span>
            <span className="text-sm font-semibold">{current.hearts}</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(current.id)}
            aria-label="Yêu thích"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 active:bg-white/20 touch-target"
          >
            <span className="text-lg">{current.isFavorite ? '❤️' : '🤍'}</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Ảnh sau"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 active:bg-white/20 touch-target"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
