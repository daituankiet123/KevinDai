import React, { useState, useEffect } from 'react';
import {
  Image,
  Plus,
  Heart,
  Sparkles,
  Calendar,
  MapPin,
  Trash2,
  Star,
  Play,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Download,
  Search,
  ArrowUpDown,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CouplePhoto } from '../types';
import { playHeartPop, playSweetChime } from '../utils/audio';
import { todayStr } from '../utils/dateUtils';
import { PHOTO_TAG_OPTIONS } from '../constants';
import { compressImage } from '../utils/imageCompression';
import { useConfirm } from '../hooks/useConfirm';

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
  const { confirm, ConfirmDialogElement } = useConfirm();

  // Form states for single / batch add photo
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(todayStr());
  const [location, setLocation] = useState('');
  const [tag, setTag] = useState('Hẹn hò');

  // Edit caption state
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editedCaption, setEditedCaption] = useState('');

  // Handle image upload from computer (single or multiple files)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    const filesArray = Array.from(files);

    for (const file of filesArray) {
      try {
        const compressed = await compressImage(file);
        urls.push(compressed);
      } catch (err) {
        if (err instanceof Error && err.message === 'IMAGE_TOO_LARGE') {
          alert(`Ảnh "${file.name}" quá lớn (>8MB), vui lòng chọn ảnh nhẹ hơn.`);
        }
      }
    }

    setFileUrls(urls);
    if (filesArray.length === 1 && !caption) {
      setCaption(filesArray[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileUrls.length === 0) {
      alert('Vui lòng chọn ít nhất một tấm ảnh từ máy tính!');
      return;
    }

    fileUrls.forEach((url, idx) => {
      const photoCaption =
        fileUrls.length > 1
          ? `${caption.trim() || 'Kỷ niệm yêu thương'} (${idx + 1})`
          : caption.trim() || 'Khoảnh khắc ngọt ngào của hai đứa mình';

      const newPhoto: CouplePhoto = {
        id: `photo-${Date.now()}-${idx}`,
        url,
        caption: photoCaption,
        date,
        location: location.trim() || undefined,
        tag,
        hearts: 1,
        isFavorite: false,
      };

      onAddPhoto(newPhoto);
    });

    playSweetChime(soundEnabled);
    setShowAddModal(false);

    // Reset form
    setFileUrls([]);
    setCaption('');
    setLocation('');
    setTag('Hẹn hò');
  };

  const handleHeart = (id: string, e: React.MouseEvent) => {
    playHeartPop(soundEnabled);
    onHeartPhoto(id);

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 20,
      spread: 50,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#f43f5e', '#fb7185', '#ec4899', '#fda4af'],
    });
  };

  const handleDownloadPhoto = (photo: CouplePhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `AnhKyNiem_${photo.date}_${(photo.location || photo.tag || 'love').replace(/\s+/g, '_')}.png`;
    a.click();
    playHeartPop(soundEnabled);
  };

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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-rose-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <h2 className="text-xl font-bold text-slate-800">
              Album Kỷ Niệm Tình Yêu
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lưu giữ từng khung hình yêu thương của <strong>Ông Chã Húi (Đại Tuấn Kiệt)</strong> &amp; <strong>Bà Chã Thơm (Lê Thị Thanh Tuyền)</strong>.
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
            <div
              key={photo.id}
              className="group bg-white rounded-3xl p-4 border border-rose-100/90 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
            >
              {/* Photo Frame Container */}
              <div>
                <div
                  className="relative aspect-4/3 rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 cursor-pointer"
                  onClick={() => {
                    setSelectedPhotoIndex(idx);
                    setIsSlideshow(false);
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Overlay Tag */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[11px] font-bold text-white bg-black/40 backdrop-blur-xs rounded-full">
                    {photo.tag}
                  </span>

                  {/* Favorite badge */}
                  {photo.isFavorite && (
                    <span className="absolute top-2.5 right-2.5 p-1 bg-white/80 rounded-full text-amber-500 shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                    </span>
                  )}
                </div>

                {/* Caption & Metadata */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-400" />
                      <span>{photo.date}</span>
                    </div>
                    {photo.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span className="truncate max-w-[120px]">{photo.location}</span>
                      </div>
                    )}
                  </div>

                  {editingPhotoId === photo.id ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs border rounded-lg focus:ring-1 focus:ring-rose-400"
                      />
                      <button
                        onClick={() => {
                          if (editedCaption.trim()) {
                            onEditCaption(photo.id, editedCaption.trim());
                          }
                          setEditingPhotoId(null);
                        }}
                        className="px-2 py-1 text-xs bg-rose-500 text-white rounded-lg font-bold"
                      >
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <p className="font-script text-lg sm:text-xl text-slate-800 leading-snug line-clamp-2 pt-1 font-semibold">
                      "{photo.caption}"
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between">
                <button
                  onClick={(e) => handleHeart(photo.id, e)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition active:scale-95"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{photo.hearts}</span>
                </button>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={(e) => handleDownloadPhoto(photo, e)}
                    title="Tải ảnh về máy"
                    className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingPhotoId(photo.id);
                      setEditedCaption(photo.caption);
                    }}
                    title="Chỉnh sửa chú thích"
                    className="p-1.5 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onToggleFavorite(photo.id)}
                    title={photo.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                    className={`p-1.5 hover:bg-amber-50 rounded-lg transition ${
                      photo.isFavorite ? 'text-amber-500' : 'hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-amber-500' : ''}`} />
                  </button>

                  <button
                    aria-label="Xóa ảnh khỏi album"
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Xóa ảnh',
                        message: 'Bạn có chắc muốn xóa ảnh này khỏi album không?',
                        confirmLabel: 'Xóa ảnh',
                      });
                      if (ok) {
                        onDeletePhoto(photo.id);
                      }
                    }}
                    title="Xóa ảnh"
                    className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Photo (Supports Single and Multiple uploads) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-rose-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📷</span>
                <h3 className="font-bold text-slate-800 text-lg">Thêm Ảnh Kỷ Niệm Mới</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Photo selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chọn một hoặc nhiều ảnh từ máy tính *
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-rose-200 rounded-2xl p-4 bg-rose-50/40 hover:bg-rose-50 transition cursor-pointer">
                  {fileUrls.length > 0 ? (
                    <div className="w-full space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {fileUrls.slice(0, 3).map((url, i) => (
                          <div key={i} className="aspect-video rounded-lg overflow-hidden border">
                            <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-rose-600">
                          Đã chọn {fileUrls.length} ảnh
                        </span>
                        <button
                          type="button"
                          onClick={() => setFileUrls([])}
                          className="px-2.5 py-1 text-xs bg-red-500 text-white rounded-md font-bold"
                        >
                          Chọn lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full py-5">
                      <Upload className="w-8 h-8 text-rose-400 mb-1" />
                      <span className="text-xs font-bold text-rose-600">
                        Nhấn để tải một hoặc nhiều ảnh lên cùng lúc
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        JPG, PNG, WEBP (Lưu offline an toàn trong máy tính)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lời chú thích ngọt ngào *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Buổi chiều đi dạo cùng Bà Chã Thơm, Nụ cười làm tan chảy trái tim..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ngày kỷ niệm *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Chủ đề
                  </label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 text-sm"
                  >
                    <option value="Hẹn hò">Hẹn hò</option>
                    <option value="Sinh nhật">Sinh nhật</option>
                    <option value="Quân ngũ">Quân ngũ</option>
                    <option value="Kỷ niệm">Kỷ niệm</option>
                    <option value="Du lịch">Du lịch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Địa điểm chụp
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Quán cafe quen, Đà Lạt, Doanh trại Trung đoàn 88..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-xs transition"
                >
                  Lưu Vào Album 💖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Slideshow Viewer */}
      {selectedPhotoIndex !== null && filteredPhotos[selectedPhotoIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="absolute top-5 right-5 flex items-center gap-2 z-50">
            <button
              onClick={() => handleDownloadPhoto(filteredPhotos[selectedPhotoIndex])}
              className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1 text-xs"
              title="Tải ảnh về máy"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải về</span>
            </button>

            <button
              onClick={() => {
                setSelectedPhotoIndex(null);
                setIsSlideshow(false);
              }}
              className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Left Arrow */}
          <button
            onClick={() =>
              setSelectedPhotoIndex((prev) =>
                prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0
              )
            }
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/40 hover:bg-black/70 transition z-40"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() =>
              setSelectedPhotoIndex((prev) =>
                prev !== null ? (prev + 1) % filteredPhotos.length : 0
              )
            }
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/40 hover:bg-black/70 transition z-40"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Center Content */}
          <div className="max-w-4xl w-full flex flex-col items-center">
            {isSlideshow && (
              <div className="mb-2 px-3.5 py-1 rounded-full bg-rose-500/80 text-white text-xs font-bold flex items-center gap-2 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trình chiếu ảnh tự động</span>
                <button
                  onClick={() => setIsSlideshow(false)}
                  className="ml-1 p-0.5 hover:bg-white/20 rounded"
                >
                  <Pause className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="relative max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black">
              <img
                src={filteredPhotos[selectedPhotoIndex].url}
                alt={filteredPhotos[selectedPhotoIndex].caption}
                className="max-h-[70vh] w-auto object-contain mx-auto transition duration-500"
              />
            </div>

            {/* Caption box */}
            <div className="mt-4 text-center text-white max-w-xl px-4">
              <p className="font-script text-2xl sm:text-3xl text-rose-200 leading-snug drop-shadow-sm">
                "{filteredPhotos[selectedPhotoIndex].caption}"
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-white/70 mt-2">
                <span>{filteredPhotos[selectedPhotoIndex].date}</span>
                {filteredPhotos[selectedPhotoIndex].location && (
                  <span>· {filteredPhotos[selectedPhotoIndex].location}</span>
                )}
                <span>· {filteredPhotos[selectedPhotoIndex].tag}</span>
                <span>
                  · {selectedPhotoIndex + 1}/{filteredPhotos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {ConfirmDialogElement}
    </div>
  );
};
