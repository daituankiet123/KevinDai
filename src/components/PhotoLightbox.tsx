import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Pause, X, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `AnhKyNiem_${photo.date}_${(photo.location || photo.tag || 'love').replace(/\s+/g, '_')}.png`;
    a.click();
    playHeartPop(soundEnabled);
  };

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
      setImageLoaded(true);
      // Reset scale and position on new image
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

  const _handlePinchZoom = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    // Simple pinch zoom - just prevent default and let browser handle
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

  const toggleFullSize = useCallback(() => {
    if (scale === 1) {
      setScale(2);
    } else {
      resetView();
    }
  }, [scale, resetView]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') resetView();
      if (e.key === 'r') rotateRight();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, zoomIn, zoomOut, resetView, rotateRight]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="absolute top-5 right-5 flex items-center gap-2 z-50">
        <button
          onClick={handleDownload}
          className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1 text-xs touch-target"
          title="Tải ảnh về máy"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Tải về</span>
        </button>

        <button
          onClick={toggleFullSize}
          className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition touch-target"
          title={scale === 1 ? 'Xem kích thước gốc (Zoom 2x)' : 'Khôi phục vừa màn hình'}
        >
          {scale === 1 ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
        </button>

        <button
          onClick={resetView}
          className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition touch-target"
          title="Khôi phục (0)"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition touch-target"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <button
        onClick={onPrev}
        disabled={index === 0}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/40 hover:bg-black/70 disabled:opacity-30 transition z-40 touch-target"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNext}
        disabled={index === total - 1}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/40 hover:bg-black/70 disabled:opacity-30 transition z-40 touch-target"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="max-w-4xl w-full flex flex-col items-center">
        {isSlideshow && (
          <div className="mb-2 px-3.5 py-1 rounded-full bg-rose-500/80 text-white text-xs font-bold flex items-center gap-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trình chiếu ảnh tự động</span>
            <button onClick={onStopSlideshow} className="ml-1 p-0.5 hover:bg-white/20 rounded touch-target">
              <Pause className="w-3 h-3" />
            </button>
          </div>
        )}

        <div
          ref={containerRef}
          className="relative w-full h-auto max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black touch-target"
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
            className={`transition-transform duration-200 ${
              scale > 1 ? 'cursor-grab' : 'cursor-default'
            } ${isDragging ? 'cursor-grabbing' : ''}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              maxHeight: '80vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              opacity: imageLoaded ? 1 : 0,
            }}
            draggable={false}
          />
        </div>

        {naturalSize.width > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs px-2 py-1 rounded bg-black/50 pointer-events-none">
            Kích thước gốc: {naturalSize.width} × {naturalSize.height}px
            {scale !== 1 && <span className="ml-2">· Zoom: {Math.round(scale * 100)}%</span>}
            {rotation !== 0 && <span className="ml-2">· Xoay: {rotation}°</span>}
          </div>
        )}

        <div className="mt-4 text-center text-white max-w-xl px-4">
          <p className="font-script text-2xl sm:text-3xl text-rose-200 leading-snug drop-shadow-sm">
            "{photo.caption}"
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-white/70 mt-2 flex-wrap">
            <span>{photo.date}</span>
            {photo.location && <span>· {photo.location}</span>}
            <span>· {photo.tag}</span>
            <span>· {index + 1}/{total}</span>
          </div>
        </div>
      </div>

      {/* Zoom controls on mobile */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:hidden z-50">
        <button onClick={zoomOut} className="touch-target p-2 rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Thu nhỏ">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={resetView} className="touch-target p-2 rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Khôi phục">
          <Minimize2 className="w-5 h-5" />
        </button>
        <button onClick={zoomIn} className="touch-target p-2 rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Phóng to">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={rotateLeft} className="touch-target p-2 rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Xoay trái">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={rotateRight} className="touch-target p-2 rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Xoay phải">
          <RotateCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};