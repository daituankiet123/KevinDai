import React, { useState, useMemo, useEffect } from 'react';
import { X, Image, Check } from 'lucide-react';
import { CouplePhoto } from '../types';
import { playHeartPop } from '../utils/audio';

interface AvatarPickerFromAlbumProps {
  isOpen: boolean;
  onClose: () => void;
  photos: CouplePhoto[];
  target: 'boyfriend' | 'girlfriend';
  onSelectAvatar: (avatarUrl: string) => void;
  soundEnabled: boolean;
}

const TAG_OPTIONS = ['Tất cả', 'Hẹn hò', 'Sinh nhật', 'Quân ngũ', 'Kỷ niệm', 'Du lịch', 'Yêu thích ❤️'];

export const AvatarPickerFromAlbum: React.FC<AvatarPickerFromAlbumProps> = ({
  isOpen,
  onClose,
  photos,
  target: _target,
  onSelectAvatar,
  soundEnabled,
}) => {
  const [activeTag, setActiveTag] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredPhotos = useMemo(() => {
    return photos
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
  }, [photos, activeTag, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0">
      <div className={`w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl rounded-t-3xl sm:rounded-3xl sm:max-w-2xl sm:mx-auto sm:items-center ${isMobile ? 'bottom-0' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b border-rose-100 sticky top-0 bg-white z-10 sm:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
              <Image className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Chọn ảnh từ album
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-rose-50 transition touch-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden sm:block sticky top-0 bg-white z-10 border-b border-rose-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <Image className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Chọn ảnh từ album làm ảnh đại diện
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-rose-50 transition touch-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-rose-100 bg-rose-50/50 flex flex-col gap-3 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {TAG_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setActiveTag(t);
                  playHeartPop(soundEnabled);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap touch-target ${
                  activeTag === t
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-rose-50 border border-rose-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Image className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo lời tựa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 bg-white touch-target"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-safe">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-16">
              <Image className="w-12 h-12 text-rose-300 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-bold text-slate-600">Không tìm thấy bức ảnh nào</p>
              <p className="text-xs text-slate-400 mt-1">
                Hãy đổi bộ lọc hoặc từ khóa tìm kiếm, hoặc tải ảnh mới trong album.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => {
                    onSelectAvatar(photo.url);
                    playHeartPop(soundEnabled);
                    onClose();
                  }}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-rose-50 border-2 border-transparent hover:border-rose-400 transition-all duration-200 group touch-target"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                      <Check className="w-5 h-5 text-rose-600 fill-rose-600" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded line-clamp-1">
                    {photo.caption}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 pb-safe z-10">
          <div className="flex items-center justify-center h-1.5 w-6 bg-slate-300 rounded-full mb-2 mx-auto" />
        </div>
      </div>
    </div>
  );
};