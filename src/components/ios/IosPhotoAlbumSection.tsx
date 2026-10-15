import { useState, useMemo, useCallback, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Icon } from './Icon';
import { useAppStore } from '../../store';
import { playHeartPop } from '../../utils/audio';
import type { CouplePhoto } from '../../types';
import { ZoomIn, ZoomOut, Minimize2, RotateCcw, RotateCw } from 'lucide-react';

type Props = {
  onAddPhoto: (photo: CouplePhoto) => void;
  onDeletePhoto: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onHeartPhoto: (id: string) => void;
  onEditCaption: (id: string, caption: string) => void;
  soundEnabled: boolean;
};

export function IosPhotoAlbumSection({
  onAddPhoto,
  onDeletePhoto,
  onToggleFavorite,
  onHeartPhoto,
  onEditCaption,
  soundEnabled,
}: Props) {
  const photos = useAppStore(useShallow((s) => s.photos));
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<CouplePhoto | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Form state
  const [newCaption, setNewCaption] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState<string | null>(null);

  const filteredPhotos = useMemo(() => {
    let list = filter === 'favorites' ? photos.filter((p) => p.isFavorite) : photos;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          (p.location || '').toLowerCase().includes(q) ||
          p.date.includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [photos, filter, search]);

  const totalHearts = photos.reduce((acc, p) => acc + p.hearts, 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = async () => {
    if (!preview) return;

    const newPhoto: CouplePhoto = {
      id: crypto.randomUUID(),
      url: preview,
      caption: newCaption || 'Khoảnh khắc yêu thương 💕',
      date: newDate,
      location: newLocation || undefined,
      tag: '',
      isFavorite: false,
      hearts: 0,
    };

    onAddPhoto(newPhoto);
    playHeartPop(soundEnabled);
    resetForm();
    setShowAdd(false);
  };

  const resetForm = () => {
    setNewCaption('');
    setNewLocation('');
    setNewDate(new Date().toISOString().slice(0, 10));
    setPreview(null);
  };

  const openPhoto = (photo: CouplePhoto, idx: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(idx);
  };

  const closePhoto = () => setSelectedPhoto(null);

  const goNext = () => {
    if (selectedIndex < filteredPhotos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setSelectedPhoto(filteredPhotos[selectedIndex + 1]);
    }
  };

  const goPrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setSelectedPhoto(filteredPhotos[selectedIndex - 1]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight">Album ảnh</h1>
          <p className="text-xs text-mute">{photos.length} ảnh · ❤️ {totalHearts}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-rose text-night active:scale-95 transition"
        >
          <Icon name="plus" size={24} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            filter === 'all' ? 'bg-rose text-night' : 'bg-line text-mute'
          }`}
        >
          Tất cả
        </button>
        <button
          type="button"
          onClick={() => setFilter('favorites')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            filter === 'favorites' ? 'bg-rose text-night' : 'bg-line text-mute'
          }`}
        >
          Yêu thích ❤️
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm ảnh..."
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 pl-10 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-12 text-center">
          <div className="mb-3 text-4xl">📷</div>
          <p className="text-sm text-mute">
            {search || filter === 'favorites' ? 'Không tìm thấy ảnh nào' : 'Chưa có ảnh nào'}
          </p>
          {!search && filter === 'all' && (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="mt-3 rounded-xl bg-rose px-4 py-2 text-xs font-semibold text-night"
            >
              Thêm ảnh đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filteredPhotos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openPhoto(photo, idx)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-line"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-active:opacity-100 transition-opacity" />
              {/* Favorite badge */}
              {photo.isFavorite && (
                <span className="absolute left-2 top-2 text-sm">❤️</span>
              )}
              {/* Hearts count */}
              {photo.hearts > 0 && (
                <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
                  ❤️ {photo.hearts}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Add Photo Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border border-line p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-ink">Thêm ảnh mới</h2>
              <button
                type="button"
                onClick={() => { setShowAdd(false); resetForm(); }}
                className="text-mute hover:text-ink transition"
              >
                <Icon name="x" size={24} />
              </button>
            </div>

            {/* Photo Preview / Upload */}
            <div className="mb-4">
              {preview ? (
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-line">
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
                    >
                    <Icon name="x" size={18} />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-line/50 transition hover:bg-line">
                  <Icon name="image" size={40} className="text-mute mb-2" />
                  <span className="text-sm text-mute">Chọn ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-mute">Lời tựa</label>
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Khoảnh khắc yêu thương..."
                  className="w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-mute">Ngày</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink focus:border-rose focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-mute">Địa điểm</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="TP.HCM..."
                    className="w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => { setShowAdd(false); resetForm(); }}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddPhoto}
                disabled={!preview}
                className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night disabled:opacity-50 active:opacity-80 transition"
              >
                Lưu ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer */}
      {selectedPhoto && (
        <IosPhotoViewer
          photo={selectedPhoto}
          index={selectedIndex}
          total={filteredPhotos.length}
          onClose={closePhoto}
          onPrev={goPrev}
          onNext={goNext}
          onToggleFavorite={() => onToggleFavorite(selectedPhoto.id)}
          onHeart={() => onHeartPhoto(selectedPhoto.id)}
          onDelete={() => onDeletePhoto(selectedPhoto.id)}
          onEditCaption={(caption) => onEditCaption(selectedPhoto.id, caption)}
          canPrev={selectedIndex > 0}
          canNext={selectedIndex < filteredPhotos.length - 1}
        />
      )}
    </div>
  );
}

interface IosPhotoViewerProps {
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
}

function IosPhotoViewer({
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
}: IosPhotoViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
      setImageLoaded(true);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 5));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scale <= 1) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  }, [scale, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(() => setScale(prev => Math.min(prev + 0.25, 5)), []);
  const zoomOut = useCallback(() => setScale(prev => Math.max(prev - 0.25, 0.5)), []);
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);
  const rotateLeft = useCallback(() => setRotation(prev => prev - 90), []);
  const rotateRight = useCallback(() => setRotation(prev => prev + 90), []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pb-2">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
        >
          <Icon name="x" size={24} />
        </button>
        <span className="text-sm font-semibold text-white">
          {index + 1} / {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFavorite}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
          >
            <span className="text-xl">{photo.isFavorite ? '❤️' : '🤍'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const next = window.prompt('Sửa lời tựa:', photo.caption);
              if (next !== null && next.trim()) onEditCaption(next.trim());
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
          >
            <Icon name="pen" size={20} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 touch-target"
          >
            <Icon name="trash" size={20} />
          </button>
        </div>
      </div>

      {/* Image with zoom/pan */}
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
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          ref={imgRef}
          src={photo.url}
          alt={photo.caption}
          onLoad={handleImageLoad}
          className={`transition-transform duration-200 ${scale > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging ? 'cursor-grabbing' : ''}`}
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

        {naturalSize.width > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs px-2 py-1 rounded bg-black/50 pointer-events-none">
            Kích thước gốc: {naturalSize.width} × {naturalSize.height}px
            {scale !== 1 && <span className="ml-2">· Zoom: {Math.round(scale * 100)}%</span>}
            {rotation !== 0 && <span className="ml-2">· Xoay: {rotation}°</span>}
          </div>
        )}

        {/* Zoom controls overlay */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:hidden">
          <button onClick={zoomOut} className="touch-target p-2 rounded-full bg-black/50 text-white" aria-label="Thu nhỏ">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button onClick={resetView} className="touch-target p-2 rounded-full bg-black/50 text-white" aria-label="Khôi phục">
            <Minimize2 className="w-5 h-5" />
          </button>
          <button onClick={zoomIn} className="touch-target p-2 rounded-full bg-black/50 text-white" aria-label="Phóng to">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={rotateLeft} className="touch-target p-2 rounded-full bg-black/50 text-white" aria-label="Xoay trái">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={rotateRight} className="touch-target p-2 rounded-full bg-black/50 text-white" aria-label="Xoay phải">
            <RotateCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info & Actions */}
      <div className="px-4 pb-safe pt-4">
        <div className="mb-3 text-center">
          <button
            type="button"
            onClick={() => {
              const next = window.prompt('Sửa lời tựa:', photo.caption);
              if (next !== null && next.trim()) onEditCaption(next.trim());
            }}
            className="text-sm text-ink underline decoration-dotted underline-offset-4 active:text-rose"
          >
            {photo.caption}
          </button>
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

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 active:bg-white/20 transition touch-target"
          >
            <Icon name="back" size={24} />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 active:bg-white/20 transition touch-target"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
