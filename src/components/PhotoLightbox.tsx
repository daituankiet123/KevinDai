import React from 'react';
import { Sparkles, Pause, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { CouplePhoto } from '../types';
import { playHeartPop } from '../utils/audio';

interface PhotoLightboxProps {
  photo: CouplePhoto;
  index: number;
  total: number;
  isSlideshow: boolean;
  soundEnabled: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStopSlideshow: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  index,
  total,
  isSlideshow,
  soundEnabled,
  onClose,
  onPrev,
  onNext,
  onStopSlideshow,
}) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `AnhKyNiem_${photo.date}_${(photo.location || photo.tag || 'love').replace(/\s+/g, '_')}.png`;
    a.click();
    playHeartPop(soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="absolute top-5 right-5 flex items-center gap-2 z-50">
        <button
          onClick={handleDownload}
          className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1 text-xs"
          title="Tải ảnh về máy"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Tải về</span>
        </button>

        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <button
        onClick={onPrev}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/40 hover:bg-black/70 transition z-40"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/40 hover:bg-black/70 transition z-40"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="max-w-4xl w-full flex flex-col items-center">
        {isSlideshow && (
          <div className="mb-2 px-3.5 py-1 rounded-full bg-rose-500/80 text-white text-xs font-bold flex items-center gap-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trình chiếu ảnh tự động</span>
            <button onClick={onStopSlideshow} className="ml-1 p-0.5 hover:bg-white/20 rounded">
              <Pause className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="relative max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black">
          <img
            src={photo.url}
            alt={photo.caption}
            className="max-h-[70vh] w-auto object-contain mx-auto transition duration-500"
          />
        </div>

        <div className="mt-4 text-center text-white max-w-xl px-4">
          <p className="font-script text-2xl sm:text-3xl text-rose-200 leading-snug drop-shadow-sm">
            "{photo.caption}"
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-white/70 mt-2">
            <span>{photo.date}</span>
            {photo.location && <span>· {photo.location}</span>}
            <span>· {photo.tag}</span>
            <span>
              · {index + 1}/{total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
