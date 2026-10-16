import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store';
import { playHeartPop } from '../../utils/audio';
import type { CouplePhoto } from '../../types';
import { IosPhotoGrid } from './IosPhotoGrid';
import { IosPhotoViewer } from './IosPhotoViewer';
import { IosAddPhotoSheet } from './IosAddPhotoSheet';
import { IosSlideshow } from './IosSlideshow';
import { EmptyState } from './EmptyState';
import { IosFab } from './IosFab';
import { useIosConfirm } from '../../hooks/useIosConfirm';

type Props = {
  onAddPhoto: (photo: CouplePhoto) => void;
  onDeletePhoto: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onHeartPhoto: (id: string) => void;
  onEditCaption: (id: string, caption: string) => void;
  soundEnabled: boolean;
};

type Filter = 'all' | 'favorites';

export function IosPhotoAlbumSection({
  onAddPhoto,
  onDeletePhoto,
  onToggleFavorite,
  onHeartPhoto,
  onEditCaption,
  soundEnabled,
}: Props) {
  const photos = useAppStore(useShallow((s) => s.photos));
  const [filter, setFilter] = useState<Filter>('all');
  const [activeTag, setActiveTag] = useState<string>('Tất cả');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);
  const { confirm, ConfirmDialogElement } = useIosConfirm();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>(['Tất cả', 'Yêu thích ❤️']);
    for (const p of photos) if (p.tag) tagSet.add(p.tag);
    return Array.from(tagSet);
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    let list = photos;
    if (filter === 'favorites') list = list.filter((p) => p.isFavorite);
    if (activeTag !== 'Tất cả' && activeTag !== 'Yêu thích ❤️') {
      list = list.filter((p) => p.tag === activeTag);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          (p.location || '').toLowerCase().includes(q) ||
          p.date.includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [photos, filter, activeTag, search]);

  const totalHearts = useMemo(
    () => photos.reduce((acc, p) => acc + p.hearts, 0),
    [photos]
  );

  const openPhoto = (photo: CouplePhoto, idx: number) => {
    setSelectedIndex(idx);
  };
  const closePhoto = () => setSelectedIndex(null);
  const goNext = () => {
    setSelectedIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : prev));
  };
  const goPrev = () => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  };

  const handleDelete = async () => {
    if (selectedIndex === null) return;
    const photo = filteredPhotos[selectedIndex];
    if (!photo) return;
    const ok = await confirm({
      title: 'Xoá ảnh này?',
      message: 'Bức ảnh sẽ bị xoá vĩnh viễn. Bạn có chắc chắn?',
      confirmLabel: 'Xoá',
      tone: 'danger',
    });
    if (ok) {
      onDeletePhoto(photo.id);
      closePhoto();
    }
  };

  const startSlideshow = () => {
    if (filteredPhotos.length > 0) setSlideshowIndex(0);
  };

  // Đảm bảo selectedIndex không vượt quá danh sách sau khi filter
  const safeIndex =
    selectedIndex !== null ? Math.min(selectedIndex, filteredPhotos.length - 1) : null;
  const selectedPhoto = safeIndex !== null && safeIndex >= 0 ? filteredPhotos[safeIndex] : null;

  return (
    <div className="space-y-4 pb-28 animate-pop-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight">Album ảnh</h1>
          <p className="text-xs text-mute">
            {photos.length} ảnh · ❤️ {totalHearts} · 🔥{' '}
            {new Set(photos.map((p) => p.date)).size} ngày
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filteredPhotos.length > 1 && (
            <button
              type="button"
              onClick={startSlideshow}
              aria-label="Bắt đầu trình chiếu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-line text-rose active:bg-line/60 touch-target"
            >
              <span className="text-lg">▶</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
        {allTags.map((t) => {
          const isActive = activeTag === t;
          const isFavChip = t === 'Yêu thích ❤️';
          const onClick = () => {
            if (isFavChip) {
              setFilter(isActive ? 'all' : 'favorites');
              setActiveTag('Tất cả');
            } else {
              setFilter('all');
              setActiveTag(t);
            }
          };
          return (
            <button
              key={t}
              type="button"
              onClick={onClick}
              className={`ios-pill whitespace-nowrap transition ${
                isActive
                  ? 'bg-rose text-night shadow-[0_0_12px_-2px_var(--color-rose)]'
                  : 'bg-line text-mute active:bg-line/60'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm ảnh..."
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 pl-10 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none touch-target"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {filteredPhotos.length === 0 ? (
        <EmptyState
          icon="📷"
          title={
            search || filter !== 'all' || activeTag !== 'Tất cả'
              ? 'Không tìm thấy ảnh nào'
              : 'Chưa có ảnh nào'
          }
          subtitle={
            search
              ? 'Thử đổi từ khoá hoặc bỏ bộ lọc nhé.'
              : 'Hãy thêm những bức ảnh đầu tiên của hai bạn.'
          }
          action={
            !search && filter === 'all' && activeTag === 'Tất cả'
              ? { label: 'Thêm ảnh đầu tiên', onClick: () => setShowAdd(true) }
              : undefined
          }
        />
      ) : (
        <IosPhotoGrid photos={filteredPhotos} onOpen={openPhoto} />
      )}

      <IosAddPhotoSheet
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAddPhoto={(p) => {
          onAddPhoto(p);
          playHeartPop(soundEnabled);
        }}
      />

      {selectedPhoto && safeIndex !== null && (
        <IosPhotoViewer
          key={selectedPhoto.id}
          photo={selectedPhoto}
          index={safeIndex}
          total={filteredPhotos.length}
          onClose={closePhoto}
          onPrev={goPrev}
          onNext={goNext}
          onToggleFavorite={() => onToggleFavorite(selectedPhoto.id)}
          onHeart={() => onHeartPhoto(selectedPhoto.id)}
          onDelete={handleDelete}
          onEditCaption={(caption) => onEditCaption(selectedPhoto.id, caption)}
          canPrev={safeIndex > 0}
          canNext={safeIndex < filteredPhotos.length - 1}
        />
      )}

      {slideshowIndex !== null && (
        <IosSlideshow
          photos={filteredPhotos}
          startIndex={slideshowIndex}
          onClose={() => setSlideshowIndex(null)}
          onHeart={onHeartPhoto}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {ConfirmDialogElement}

      <IosFab label="Thêm ảnh" onClick={() => setShowAdd(true)} />
    </div>
  );
}
