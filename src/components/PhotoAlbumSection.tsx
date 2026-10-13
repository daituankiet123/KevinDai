import React, { useState, useEffect } from 'react';
import { Image, Plus, Play, Search, ArrowUpDown } from 'lucide-react';
import { CouplePhoto } from '../types';
import { playHeartPop, playSweetChime } from '../utils/audio';
import { PHOTO_TAG_OPTIONS } from '../constants';
import { PhotoAddModal } from './PhotoAddModal';
import { PhotoCard } from './PhotoCard';
import { PhotoLightbox } from './PhotoLightbox';

interface PhotoAlbumSectionProps {
  photos: CouplePhoto[];
  onAddPhoto: (photo: CouplePhoto) => void;
  onDeletePhoto: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onHeartPhoto: (id: string) => void;
  onEditCaption: (id: string, newCaption: string) => void;
  soundEnabled: boolean;
}

const TAG_OPTIONS = PHOTO_TAG_OPTIONS;

export const PhotoAlbumSection: React.FC<PhotoAlbumSectionProps> = ({
  photos,
  onAddPhoto,
  onDeletePhoto,
  onToggleFavorite,
  onHeartPhoto,
  onEditCaption,
  soundEnabled,
}) => {
  const [activeTag, setActiveTag] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'hearts'>('newest');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [slideshowSpeed] = useState(3500);

  // Filter and search photos
  const filteredPhotos = photos
    .filter((p) => {
      if (activeTag === 'Tất cả') return true;
      if (activeTag === 'Yêu thích ❤️') return p.isFavorite;
      return p.tag === activeTag;
    })
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.caption.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        p.date.includes(q)
      );
    });

  // Sort photos
  filteredPhotos.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return b.hearts - a.hearts;
  });

  // Total stats
  const totalHearts = photos.reduce((acc, p) => acc + p.hearts, 0);

  // Slideshow auto-advance
  useEffect(() => {
    if (!isSlideshow || selectedPhotoIndex === null || filteredPhotos.length === 0) return;
    const interval = setInterval(() => {
      setSelectedPhotoIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : 0));
    }, slideshowSpeed);
    return () => clearInterval(interval);
  }, [isSlideshow, selectedPhotoIndex, filteredPhotos.length, slideshowSpeed]);

  const selectedPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-rose-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <h2 className="text-xl font-bold text-slate-800">Album Kỷ Niệm Tình Yêu</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lưu giữ từng khung hình yêu thương của <strong>Ông Chã Húi (Đại Tuấn Kiệt)</strong>{' '}
            &amp; <strong>Bà Chã Thơm (Lê Thị Thanh Tuyền)</strong>.
          </p>
        </div>

        {/* Quick Stats & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 font-bold">
            <span>{photos.length} bức ảnh</span>
            <span>·</span>
            <span>❤️ {totalHearts} lượt thích</span>
          </div>

          {filteredPhotos.length > 0 && (
            <button
              onClick={() => {
                setSelectedPhotoIndex(0);
                setIsSlideshow(true);
                playSweetChime(soundEnabled);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-xl transition shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-rose-700" />
              <span>Trình chiếu lãng mạn</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowAddModal(true);
              playHeartPop(soundEnabled);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Ảnh Mới</span>
          </button>
        </div>
      </div>

      {/* Search, Sort and Tag Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 p-3 rounded-2xl border border-rose-100 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {TAG_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTag(t);
                playHeartPop(soundEnabled);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                activeTag === t
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-rose-50 border border-rose-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo lời tựa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-rose-200 focus:outline-hidden focus:ring-1 focus:ring-rose-400 bg-white"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-white border border-rose-200 rounded-xl px-2 py-1 text-xs">
            <ArrowUpDown className="w-3 h-3 text-rose-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'hearts')}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="hearts">Nhiều tim</option>
            </select>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-white/70 rounded-3xl border border-dashed border-rose-200">
          <Image className="w-12 h-12 text-rose-300 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-bold text-slate-600">Không tìm thấy bức ảnh nào</p>
          <p className="text-xs text-slate-400 mt-1">
            Hãy tải lên những tấm ảnh kỷ niệm của hai bạn hoặc đổi từ khóa tìm kiếm nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, idx) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              soundEnabled={soundEnabled}
              onOpen={() => {
                setSelectedPhotoIndex(idx);
                setIsSlideshow(false);
              }}
              onDelete={onDeletePhoto}
              onToggleFavorite={onToggleFavorite}
              onHeart={onHeartPhoto}
              onEditCaption={onEditCaption}
            />
          ))}
        </div>
      )}

      {/* Modal Add Photo (Supports Single and Multiple uploads) */}
      <PhotoAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddPhoto={onAddPhoto}
        onSuccess={() => {
          playSweetChime(soundEnabled);
          setShowAddModal(false);
        }}
      />

      {/* Lightbox / Slideshow Viewer */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          index={selectedPhotoIndex ?? 0}
          total={filteredPhotos.length}
          isSlideshow={isSlideshow}
          soundEnabled={soundEnabled}
          onClose={() => {
            setSelectedPhotoIndex(null);
            setIsSlideshow(false);
          }}
          onPrev={() =>
            setSelectedPhotoIndex((prev) =>
              prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0
            )
          }
          onNext={() =>
            setSelectedPhotoIndex((prev) =>
              prev !== null ? (prev + 1) % filteredPhotos.length : 0
            )
          }
          onStopSlideshow={() => setIsSlideshow(false)}
        />
      )}
    </div>
  );
};
