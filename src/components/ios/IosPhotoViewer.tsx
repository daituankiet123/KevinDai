import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, Minimize2, RotateCcw, RotateCw, Share2 } from 'lucide-react';
import { Icon } from './Icon';
import type { CouplePhoto } from '../../types';
import { sharePhoto } from '../../utils/photoShare';

type Props = {
  photo: CouplePhoto;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFavorite: () => void;
  onHeart: () => void;
  onDelete: () => void;
  onEditCaption: (caption: string) => void;
  canPrev: boolean;
  canNext: boolean;
  isSlideshow?: boolean;
  slideshowProgress?: number;
};

export function IosPhotoViewer({
  photo,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  onToggleFavorite,
  onHeart,
  onDelete,
  onEditCaption,
  canPrev,
  canNext,
  isSlideshow = false,
  slideshowProgress = 0,
}: Props) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showEditCaption, setShowEditCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(photo.caption);
  const imgRef = useRef<HTMLImageElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [scale, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          t: Date.now(),
        };
        if (scale > 1) {
          setIsDragging(true);
          setDragStart({
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y,
          });
        }
      }
    },
    [scale, position]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && e.touches.length === 1 && scale > 1) {
        e.preventDefault();
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart, scale]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || scale > 1) return;
    const dx = 0;
    const touchEnd = (window.event as TouchEvent | undefined)?.changedTouches?.[0]?.clientX ?? start.x;
    void touchEnd;
    void dx;
    const endX = (window.event as TouchEvent | undefined)?.changedTouches?.[0]?.clientX ?? start.x;
    const endY = (window.event as TouchEvent | undefined)?.changedTouches?.[0]?.clientY ?? start.y;
    const diffX = endX - start.x;
    const diffY = endY - start.y;
    const dt = Date.now() - start.t;
    if (dt < 400 && Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0 && canNext) onNext();
      else if (diffX > 0 && canPrev) onPrev();
    }
  }, [scale, canNext, canPrev, onNext, onPrev]);

  const zoomIn = useCallback(() => setScale((p) => Math.min(p + 0.25, 5)), []);
  const zoomOut = useCallback(() => setScale((p) => Math.max(p - 0.25, 0.5)), []);
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);
  const rotateLeft = useCallback(() => setRotation((p) => p - 90), []);
  const rotateRight = useCallback(() => setRotation((p) => p + 90), []);

  const handleShare = useCallback(() => {
    void sharePhoto(photo);
  }, [photo]);

  const handleSaveCaption = () => {
    const next = captionDraft.trim();
    if (next && next !== photo.caption) onEditCaption(next);
    setShowEditCaption(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-night"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center justify-between px-4 pt-safe pb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
        >
          <Icon name="x" size={24} />
        </button>
        <span className="text-sm font-semibold text-white">
          {index + 1} / {total}
          {isSlideshow && (
            <span className="ml-2 inline-flex items-center gap-1 text-rose-300">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
              Trình chiếu
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Chia sẻ ảnh"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={photo.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
          >
            <span className="text-xl">{photo.isFavorite ? '❤️' : '🤍'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowEditCaption(true)}
            aria-label="Sửa lời tựa"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
          >
            <Icon name="pen" size={20} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Xoá ảnh"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
          >
            <Icon name="trash" size={20} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-4 relative overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          </div>
        )}
        <img
          ref={imgRef}
          src={photo.url}
          alt={photo.caption}
          onLoad={handleImageLoad}
          className={`transition-transform duration-200 ${
            scale > 1 ? 'cursor-grab' : 'cursor-default'
          } ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            maxHeight: '70vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            opacity: imageLoaded ? 1 : 0,
          }}
          draggable={false}
        />

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:hidden">
          <button
            onClick={zoomOut}
            aria-label="Thu nhỏ"
            className="touch-target rounded-full bg-black/50 p-2 text-white"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={resetView}
            aria-label="Khôi phục"
            className="touch-target rounded-full bg-black/50 p-2 text-white"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
          <button
            onClick={zoomIn}
            aria-label="Phóng to"
            className="touch-target rounded-full bg-black/50 p-2 text-white"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={rotateLeft}
            aria-label="Xoay trái"
            className="touch-target rounded-full bg-black/50 p-2 text-white"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={rotateRight}
            aria-label="Xoay phải"
            className="touch-target rounded-full bg-black/50 p-2 text-white"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-safe pt-4">
        {isSlideshow && (
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-rose transition-[width] duration-200"
              style={{ width: `${Math.min(100, Math.max(0, slideshowProgress * 100))}%` }}
            />
          </div>
        )}

        <div className="mb-3 text-center">
          <p className="text-sm text-ink">{photo.caption}</p>
          <p className="mt-1 text-xs text-mute">
            {photo.date}
            {photo.location && ` · ${photo.location}`}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onHeart}
            className="flex items-center gap-1.5 rounded-full bg-rose/20 px-4 py-2 text-sm font-semibold text-rose active:bg-rose/30 transition touch-target"
          >
            <span>❤️</span>
            <span>{photo.hearts}</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Ảnh trước"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 active:bg-white/20 transition touch-target"
          >
            <Icon name="back" size={24} />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            aria-label="Ảnh sau"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 active:bg-white/20 transition touch-target"
          >
            <svg
              width="24"
              height="24"
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

      {showEditCaption && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowEditCaption(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-line bg-card pb-safe p-6 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.25s ease-out' }}
          >
            <h3 className="mb-3 text-base font-bold text-ink">Sửa lời tựa</h3>
            <textarea
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink focus:border-rose focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEditCaption(false)}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line transition touch-target"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveCaption}
                className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night active:opacity-80 transition touch-target"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
