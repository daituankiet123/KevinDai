import React, { useState } from 'react';
import { Heart, Star, Download, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CouplePhoto } from '../types';
import { playHeartPop } from '../utils/audio';
import { useConfirm } from '../hooks/useConfirm';

interface PhotoCardProps {
  photo: CouplePhoto;
  soundEnabled: boolean;
  onOpen: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onHeart: (id: string) => void;
  onEditCaption: (id: string, caption: string) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  soundEnabled,
  onOpen,
  onDelete,
  onToggleFavorite,
  onHeart,
  onEditCaption,
}) => {
  const [editing, setEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(photo.caption);
  const { confirm, ConfirmDialogElement } = useConfirm();

  const handleHeart = (e: React.MouseEvent) => {
    playHeartPop(soundEnabled);
    onHeart(photo.id);

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

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `AnhKyNiem_${photo.date}_${(photo.location || photo.tag || 'love').replace(/\s+/g, '_')}.png`;
    a.click();
    playHeartPop(soundEnabled);
  };

  const saveCaption = () => {
    if (editedCaption.trim()) {
      onEditCaption(photo.id, editedCaption.trim());
    }
    setEditing(false);
  };

  return (
    <div className="group bg-white rounded-3xl p-4 border border-rose-100/90 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
      <div>
        <div
          className="relative aspect-4/3 rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 cursor-pointer"
          onClick={onOpen}
        >
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />

          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[11px] font-bold text-white bg-black/40 backdrop-blur-xs rounded-full">
            {photo.tag}
          </span>

          {photo.isFavorite && (
            <span className="absolute top-2.5 right-2.5 p-1 bg-white/80 rounded-full text-amber-500 shadow-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
            </span>
          )}
        </div>

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

          {editing ? (
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs border rounded-lg focus:ring-1 focus:ring-rose-400"
              />
              <button
                onClick={saveCaption}
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

      <div className="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between">
        <button
          onClick={handleHeart}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition active:scale-95"
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
          <span>{photo.hearts}</span>
        </button>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handleDownload}
            title="Tải ảnh về máy"
            className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setEditing(true);
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
                onDelete(photo.id);
              }
            }}
            title="Xóa ảnh"
            className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {ConfirmDialogElement}
    </div>
  );
};
