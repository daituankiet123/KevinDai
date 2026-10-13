import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  BookOpen,
  MessageCircle,
  Clock,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyNote, CoupleData } from '../types';
import { playHeartPop } from '../utils/audio';

interface TodayDailyNoteCardProps {
  notes: DailyNote[];
  couple: CoupleData;
  onAddOrUpdateNote: (note: DailyNote) => void;
  onDeleteNote: (id: string) => void;
  onHeartNote: (id: string) => void;
  onOpenModal: (note?: DailyNote | null, date?: string) => void;
  onViewAllNotes: () => void;
  soundEnabled: boolean;
}

const MOOD_META: Record<string, { icon: string; label: string; badgeClass: string }> = {
  love: { icon: '💖', label: 'Yêu thương', badgeClass: 'bg-rose-100 text-rose-700 border-rose-200' },
  miss: { icon: '🥺', label: 'Nhớ da diết', badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  happy: { icon: '🌸', label: 'Vui vẻ & Bình yên', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  proud: { icon: '🎖️', label: 'Tự hào chàng lính', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  special: { icon: '📞', label: 'Cuộc gọi / Sự kiện', badgeClass: 'bg-sky-100 text-sky-800 border-sky-200' },
  excited: { icon: '🌟', label: 'Háo hức & Động lực', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  tired: { icon: '🔋', label: 'Mệt nhưng cố gắng', badgeClass: 'bg-teal-100 text-teal-800 border-teal-200' },
};

export const TodayDailyNoteCard: React.FC<TodayDailyNoteCardProps> = ({
  notes,
  couple,
  onAddOrUpdateNote,
  onDeleteNote,
  onHeartNote,
  onOpenModal,
  onViewAllNotes,
  soundEnabled,
}) => {
  const getTodayStr = () => new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  // Find note for currently selected date
  const noteForDate = notes.find((n) => n.date === selectedDate);

  // Date manipulation helpers
  const handleShiftDay = (days: number) => {
    playHeartPop(soundEnabled);
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleGoToday = () => {
    playHeartPop(soundEnabled);
    setSelectedDate(getTodayStr());
  };

  const isToday = selectedDate === getTodayStr();

  // Format date display
  const formatDateVietnamese = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = daysOfWeek[d.getDay()];
      return `${dayName}, ${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
      return dateStr;
    }
  };

  const handleHeartClick = (e: React.MouseEvent, noteId: string) => {
    onHeartNote(noteId);
    playHeartPop(soundEnabled);

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 15,
      spread: 50,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#fda4af', '#f43f5e', '#fb7185'],
    });
  };

  const authorLabel = (author: string) => {
    if (author === 'girlfriend') {
      return {
        name: couple.girlfriendNickname || couple.girlfriendName || 'Bà Chã Thơm',
        avatar: couple.girlfriendAvatar || '👧🌸',
        role: 'Hậu phương',
      };
    }
    if (author === 'boyfriend') {
      return {
        name: couple.boyfriendNickname || couple.boyfriendName || 'Ông Chã Húi',
        avatar: couple.boyfriendAvatar || '👨‍✈️',
        role: 'Chiến sĩ',
      };
    }
    return {
      name: `${couple.girlfriendName.split(' ').pop()} & ${couple.boyfriendName.split(' ').pop()}`,
      avatar: '💑',
      role: 'Đôi lứa',
    };
  };

  const moodInfo = noteForDate ? MOOD_META[noteForDate.mood] || MOOD_META.love : MOOD_META.love;
  const authorInfo = noteForDate ? authorLabel(noteForDate.author) : null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/90 via-white to-pink-50/80 p-5 sm:p-6 border border-rose-200/90 shadow-xs transition-all">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-200/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-rose-100">
        {/* Title & Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center text-lg shadow-xs">
            📝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base">
                Ghi Chú Cảm Xúc Mỗi Ngày
              </h3>
              {isToday && (
                <span className="text-[10px] font-extrabold uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                  Hôm nay
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Lưu giữ những điều nhỏ bé và ngọt ngào trên hành trình 2 năm quân ngũ
            </p>
          </div>
        </div>

        {/* Date Navigator Bar */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white/80 p-1 rounded-2xl border border-rose-100 shadow-2xs">
          <button
            onClick={() => handleShiftDay(-1)}
            title="Ngày trước"
            className="p-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              Hôm nay
            </button>
          )}

          <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 bg-rose-50/60 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>{formatDateVietnamese(selectedDate)}</span>
          </div>

          <button
            onClick={() => handleShiftDay(1)}
            title="Ngày sau"
            className="p-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            title="Chọn ngày bất kỳ"
            className="w-7 h-7 opacity-0 absolute cursor-pointer"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {noteForDate ? (
        <div className="relative bg-white/90 rounded-2xl p-4 sm:p-5 border border-rose-200/80 shadow-xs space-y-3">
          {/* Note Metadata Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Mood badge */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${moodInfo.badgeClass}`}>
                <span>{moodInfo.icon}</span>
                <span>{moodInfo.label}</span>
              </span>

              {/* Author badge */}
              {authorInfo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span>{authorInfo.avatar}</span>
                  <span>{authorInfo.name}</span>
                </span>
              )}

              {/* Tag badge */}
              {noteForDate.tag && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-100">
                  <Tag className="w-3 h-3" />
                  <span>{noteForDate.tag}</span>
                </span>
              )}
            </div>

            {/* Action buttons (Edit & Delete) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onOpenModal(noteForDate, selectedDate)}
                title="Chỉnh sửa ghi chú"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa ghi chú này không?')) {
                    onDeleteNote(noteForDate.id);
                  }
                }}
                title="Xóa ghi chú"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Note Content Text */}
          <div className="text-slate-800 text-sm sm:text-base leading-relaxed font-sans font-medium py-1 whitespace-pre-wrap">
            "{noteForDate.content}"
          </div>

          {/* Footer Info & Heart Interaction */}
          <div className="pt-2 border-t border-rose-100/70 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {noteForDate.updatedAt
                  ? `Đã cập nhật lúc ${new Date(noteForDate.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Ghi chú trong ngày'}
              </span>
            </div>

            <button
              onClick={(e) => handleHeartClick(e, noteForDate.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition transform active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{noteForDate.hearts} yêu thích</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State for selected date */
        <div className="bg-white/60 border border-dashed border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-100/80 flex items-center justify-center text-2xl">
            💌
          </div>
          <div>
            <h4 className="font-bold text-slate-700 text-sm">
              Chưa có ghi chú nào cho ngày {formatDateVietnamese(selectedDate)}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Hãy lưu lại một dòng cảm xúc, cuộc gọi, buổi thăm nuôi, hoặc sự kiện đáng nhớ hôm nay để gom thành nhật ký tình yêu quân ngũ nhé!
            </p>
          </div>
          <button
            onClick={() => onOpenModal(null, selectedDate)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-xs transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Viết ghi chú cho ngày này</span>
          </button>
        </div>
      )}

      {/* Bottom Link to view all notes */}
      <div className="mt-3.5 pt-2.5 border-t border-rose-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-rose-500" />
          <span>Tổng cộng: <strong className="text-rose-600">{notes.length}</strong> ngày đã ghi lại cảm xúc</span>
        </div>
        <button
          onClick={onViewAllNotes}
          className="font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Xem tất cả nhật ký ngày</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
